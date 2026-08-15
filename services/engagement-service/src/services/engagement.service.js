import { prisma } from '../lib/prisma.js';
import { getPropertyOwner } from './listingClient.service.js';
import { sendEmailNotification } from './notificationDispatcher.service.js';
import { publishEvent } from '../lib/redis.js';

// Valid Lead Stage Transitions (FR-LEAD-03 Sequential Enforcement)
const ALLOWED_STAGE_TRANSITIONS = {
  NEW: ['CONTACTED', 'VISIT_SCHEDULED', 'CLOSED_LOST'],
  CONTACTED: ['VISIT_SCHEDULED', 'CLOSED_LOST'],
  VISIT_SCHEDULED: ['VISIT_COMPLETED', 'CANCELLED', 'RESCHEDULED', 'CLOSED_LOST'],
  VISIT_COMPLETED: ['NEGOTIATING', 'CLOSED_LOST'],
  NEGOTIATING: ['CLOSED_WON', 'CLOSED_LOST'],
  CLOSED_WON: [],
  CLOSED_LOST: []
};

import { getUserEmail } from './identityClient.service.js';

// Helper function to dispatch async email notification (FR-NOTIF-01, FR-NOTIF-02, FR-NOTIF-04)
const dispatchNotificationEmail = async (userId, title, message) => {
  const recipientEmail = await getUserEmail(userId);
  if (recipientEmail) {
    sendEmailNotification(recipientEmail, title, message);
  }
};



// --- Availability Calendar Management ---
export const createAvailabilitySlot = async (ownerId, propertyId, date, timeSlot) => {
  return await prisma.availabilityCalendar.create({
    data: { ownerId, propertyId, date, timeSlot }
  });
};

export const getAvailabilitySlots = async (propertyId, date) => {
  const where = { propertyId };
  if (date) where.date = date;

  return await prisma.availabilityCalendar.findMany({
    where,
    orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }]
  });
};

// --- Atomic Booking Creation & Race-Condition Prevention (FR-BOOK-02, FR-LEAD-01, UC-ES-02) ---
export const createAtomicBooking = async (buyerId, propertyId, availabilityId, notes) => {
  const result = await prisma.$transaction(async (tx) => {
    // Atomically claim the slot with conditional update
    const updateResult = await tx.availabilityCalendar.updateMany({
      where: {
        id: availabilityId,
        isBooked: false
      },
      data: {
        isBooked: true
      }
    });

    if (updateResult.count === 0) {
      const slotExists = await tx.availabilityCalendar.findUnique({
        where: { id: availabilityId }
      });
      if (!slotExists) {
        throw { status: 404, code: 'SLOT_NOT_FOUND', message: 'Availability slot not found' };
      }
      throw { status: 409, code: 'SLOT_ALREADY_BOOKED', message: 'This time slot has already been booked by another buyer' };
    }

    const slot = await tx.availabilityCalendar.findUnique({
      where: { id: availabilityId }
    });

    const ownerId = slot.ownerId || await getPropertyOwner(propertyId) || 'system-owner';

    const booking = await tx.booking.create({
      data: {
        propertyId,
        buyerId,
        ownerId,
        availabilityId,
        status: 'SCHEDULED',
        scheduledDate: slot.date,
        timeSlot: slot.timeSlot,
        notes
      }
    });

    let lead = await tx.lead.findUnique({
      where: { propertyId_buyerId: { propertyId, buyerId } }
    });

    if (lead) {
      const oldStage = lead.currentStage;
      lead = await tx.lead.update({
        where: { id: lead.id },
        data: {
          currentStage: 'VISIT_SCHEDULED',
          bookingId: booking.id
        }
      });

      await tx.leadStageHistory.create({
        data: {
          leadId: lead.id,
          fromStage: oldStage,
          toStage: 'VISIT_SCHEDULED',
          changedBy: buyerId,
          notes: 'Site visit booking scheduled'
        }
      });
    } else {
      lead = await tx.lead.create({
        data: {
          propertyId,
          buyerId,
          ownerId,
          bookingId: booking.id,
          currentStage: 'VISIT_SCHEDULED'
        }
      });

      await tx.leadStageHistory.create({
        data: {
          leadId: lead.id,
          fromStage: 'NEW',
          toStage: 'VISIT_SCHEDULED',
          changedBy: buyerId,
          notes: 'Initial site visit booking created lead'
        }
      });
    }

    const title = 'New Site Visit Scheduled';
    const message = `A buyer has scheduled a site visit for property ${propertyId} on ${slot.date} at ${slot.timeSlot}`;

    // Guaranteed In-App Channel (FR-NOTIF-01)
    await tx.notification.create({
      data: {
        userId: ownerId,
        type: 'BOOKING_CREATED',
        title,
        message
      }
    });

    return { booking, lead, ownerId, title, message };
  });

  // Async email dispatch outside DB transaction (FR-NOTIF-04)
  dispatchNotificationEmail(result.ownerId, result.title, result.message);

  // Publish booking.created event to Redis Pub/Sub for Analytics Service
  publishEvent('booking.created', {
    bookingId: result.booking.id,
    propertyId: result.booking.propertyId,
    buyerId: result.booking.buyerId,
    ownerId: result.ownerId,
    scheduledDate: result.booking.scheduledDate,
    timeSlot: result.booking.timeSlot
  });

  return { booking: result.booking, lead: result.lead };
};

// --- Atomic Cancel Booking (FR-BOOK-03) ---
export const cancelBooking = async (bookingId, userId, reason) => {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw { status: 404, code: 'BOOKING_NOT_FOUND', message: 'Booking not found' };
    }

    if (booking.buyerId !== userId && booking.ownerId !== userId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Not authorized to cancel this booking' };
    }

    if (booking.status === 'CANCELLED') {
      throw { status: 400, code: 'ALREADY_CANCELLED', message: 'Booking is already cancelled' };
    }

    // Release availability slot
    await tx.availabilityCalendar.update({
      where: { id: booking.availabilityId },
      data: { isBooked: false }
    });

    // Update booking status
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', notes: reason ? `Cancelled: ${reason}` : booking.notes }
    });

    // Target recipient
    const notifyUser = userId === booking.buyerId ? booking.ownerId : booking.buyerId;
    const title = 'Site Visit Cancelled';
    const message = `Site visit for property ${booking.propertyId} on ${booking.scheduledDate} was cancelled.`;

    // Guaranteed In-App Channel (FR-NOTIF-01)
    await tx.notification.create({
      data: {
        userId: notifyUser,
        type: 'BOOKING_CANCELLED',
        title,
        message
      }
    });

    return { updatedBooking, notifyUser, title, message };
  });

  // Async email dispatch outside DB transaction (FR-NOTIF-04)
  dispatchNotificationEmail(result.notifyUser, result.title, result.message);

  return result.updatedBooking;
};

// --- Atomic Reschedule Booking with Lock Release + Target Slot Check (FR-BOOK-04, UC-ES-03) ---
export const rescheduleBooking = async (bookingId, userId, newAvailabilityId, notes) => {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw { status: 404, code: 'BOOKING_NOT_FOUND', message: 'Booking not found' };
    }

    if (booking.buyerId !== userId && booking.ownerId !== userId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Not authorized to reschedule this booking' };
    }

    // Atomically claim target availability slot
    const updateTargetResult = await tx.availabilityCalendar.updateMany({
      where: {
        id: newAvailabilityId,
        isBooked: false
      },
      data: {
        isBooked: true
      }
    });

    if (updateTargetResult.count === 0) {
      const targetSlotExists = await tx.availabilityCalendar.findUnique({
        where: { id: newAvailabilityId }
      });
      if (!targetSlotExists) {
        throw { status: 404, code: 'TARGET_SLOT_NOT_FOUND', message: 'Target availability slot not found' };
      }
      throw { status: 409, code: 'TARGET_SLOT_UNAVAILABLE', message: 'Reschedule failed: target time slot is already booked' };
    }

    const targetSlot = await tx.availabilityCalendar.findUnique({
      where: { id: newAvailabilityId }
    });

    // Release old availability slot
    await tx.availabilityCalendar.update({
      where: { id: booking.availabilityId },
      data: { isBooked: false }
    });

    // Update booking record
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        availabilityId: newAvailabilityId,
        scheduledDate: targetSlot.date,
        timeSlot: targetSlot.timeSlot,
        status: 'RESCHEDULED',
        notes: notes || booking.notes
      }
    });

    const notifyUser = userId === booking.buyerId ? booking.ownerId : booking.buyerId;
    const title = 'Site Visit Rescheduled';
    const message = `Site visit for property ${booking.propertyId} rescheduled to ${targetSlot.date} at ${targetSlot.timeSlot}.`;

    // Guaranteed In-App Channel (FR-NOTIF-01)
    await tx.notification.create({
      data: {
        userId: notifyUser,
        type: 'BOOKING_RESCHEDULED',
        title,
        message
      }
    });

    return { updatedBooking, notifyUser, title, message };
  });

  // Async email dispatch outside DB transaction (FR-NOTIF-04)
  dispatchNotificationEmail(result.notifyUser, result.title, result.message);


  return result.updatedBooking;
};

// --- Lead & Sequential Stage Transition Enforcement (FR-LEAD-02, FR-LEAD-03, UC-ES-04) ---
export const getLeadsForUser = async (userId, role) => {
  const where = role === 'BUYER' ? { buyerId: userId } : { ownerId: userId };
  return await prisma.lead.findMany({
    where,
    include: {
      booking: true,
      history: { orderBy: { createdAt: 'desc' } }
    },
    orderBy: { updatedAt: 'desc' }
  });
};

export const updateLeadStage = async (leadId, changedBy, toStage, notes, role) => {
  const result = await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      throw { status: 404, code: 'LEAD_NOT_FOUND', message: 'Lead record not found' };
    }

    if (lead.ownerId !== changedBy && role !== 'ADMIN') {
      throw { status: 403, code: 'FORBIDDEN', message: 'Not authorized to update this lead stage' };
    }

    const fromStage = lead.currentStage;
    const allowed = ALLOWED_STAGE_TRANSITIONS[fromStage] || [];

    if (!allowed.includes(toStage)) {
      throw {
        status: 400,
        code: 'INVALID_STAGE_TRANSITION',
        message: `Invalid lead stage transition from ${fromStage} to ${toStage}. Allowed: ${allowed.join(', ') || 'None'}`
      };
    }

    const updatedLead = await tx.lead.update({
      where: { id: leadId },
      data: { currentStage: toStage }
    });

    await tx.leadStageHistory.create({
      data: {
        leadId,
        fromStage,
        toStage,
        changedBy,
        notes
      }
    });

    // If stage becomes VISIT_COMPLETED, mark associated booking as COMPLETED
    if (toStage === 'VISIT_COMPLETED' && lead.bookingId) {
      await tx.booking.update({
        where: { id: lead.bookingId },
        data: { status: 'COMPLETED' }
      });
    }

    return { updatedLead, fromStage, toStage, lead };
  });

  // Publish Redis Pub/Sub events for Analytics Service
  publishEvent('lead.stage_changed', {
    leadId: result.updatedLead.id,
    propertyId: result.updatedLead.propertyId,
    buyerId: result.updatedLead.buyerId,
    ownerId: result.updatedLead.ownerId,
    fromStage: result.fromStage,
    toStage: result.toStage,
    changedBy
  });

  if (toStage === 'VISIT_COMPLETED' && result.lead.bookingId) {
    publishEvent('booking.completed', {
      bookingId: result.lead.bookingId,
      leadId: result.updatedLead.id,
      propertyId: result.updatedLead.propertyId,
      buyerId: result.updatedLead.buyerId,
      ownerId: result.updatedLead.ownerId
    });
  }

  return result.updatedLead;
};


// --- Internal Verification Endpoint for Listing Service (FR-REV-01) ---
export const verifyCompletedBookingInternal = async (propertyId, buyerId) => {
  const completedBooking = await prisma.booking.findFirst({
    where: {
      propertyId,
      buyerId,
      status: 'COMPLETED'
    }
  });

  return { verified: !!completedBooking };
};

// --- Notifications ---
export const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

export const getBookingsForBuyer = async (buyerId) => {
  return await prisma.booking.findMany({
    where: { buyerId },
    orderBy: { createdAt: 'desc' }
  });
};
