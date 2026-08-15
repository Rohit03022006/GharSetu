import * as engagementService from '../services/engagement.service.js';
import * as validator from '../validators/engagement.validators.js';

export const createAvailability = async (req, res, next) => {
  try {
    const ownerId = req.user.userId || req.user.id;
    const validated = validator.createAvailabilitySchema.parse(req.body);

    const slot = await engagementService.createAvailabilitySlot(
      ownerId,
      validated.propertyId,
      validated.date,
      validated.timeSlot
    );

    res.status(201).json({ success: true, message: 'Availability slot created', data: slot });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { date } = req.query;

    const slots = await engagementService.getAvailabilitySlots(propertyId, date);

    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const buyerId = req.user.userId || req.user.id;
    const validated = validator.createBookingSchema.parse(req.body);

    const result = await engagementService.createAtomicBooking(
      buyerId,
      validated.propertyId,
      validated.availabilityId,
      validated.notes
    );

    res.status(201).json({
      success: true,
      message: 'Booking created and lead generated successfully',
      data: result
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { bookingId } = req.params;
    const validated = validator.cancelBookingSchema.parse(req.body);

    const cancelled = await engagementService.cancelBooking(bookingId, userId, validated.reason);

    res.json({ success: true, message: 'Booking cancelled successfully', data: cancelled });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const rescheduleBooking = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { bookingId } = req.params;
    const validated = validator.rescheduleBookingSchema.parse(req.body);

    const rescheduled = await engagementService.rescheduleBooking(
      bookingId,
      userId,
      validated.newAvailabilityId,
      validated.notes
    );

    res.json({ success: true, message: 'Booking rescheduled successfully', data: rescheduled });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const getLeads = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const role = req.user.role;

    const leads = await engagementService.getLeadsForUser(userId, role);

    res.json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStage = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const role = req.user.role;
    const { leadId } = req.params;
    const validated = validator.updateLeadStageSchema.parse(req.body);

    const updatedLead = await engagementService.updateLeadStage(
      leadId,
      userId,
      validated.toStage,
      validated.notes,
      role
    );

    res.json({ success: true, message: 'Lead stage updated', data: updatedLead });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const verifyCompletedBookingInternal = async (req, res, next) => {
  try {
    const { propertyId, buyerId } = req.query;

    if (!propertyId || !buyerId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'propertyId and buyerId query parameters are required' } });
    }

    const verification = await engagementService.verifyCompletedBookingInternal(propertyId, buyerId);

    res.json({ success: true, data: verification });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const notifications = await engagementService.getUserNotifications(userId);

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const buyerId = req.user.userId || req.user.id;
    const bookings = await engagementService.getBookingsForBuyer(buyerId);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};
