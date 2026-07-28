# Engagement Service API Reference & Testing Scenarios

The **Engagement Service** runs on port `4005` (`http://localhost:4005`).

---

## 🔑 Base Configuration & Authorization
- **Base URL:** `http://localhost:4005`
- **Auth Header:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Database:** Dedicated `engagement_db` PostgreSQL database

---

## 📧 Email Notification Dispatcher (FR-NOTIF-02)

The notification system uses **SMTP Relay** with zero hardcoded credentials, fetching settings directly from `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="xten41602@gmail.com"
SMTP_PASS="xwaukvadnaeccunp"
SMTP_FROM='"GharSetu Platform" <xten41602@gmail.com>'
```

Recipient email addresses are dynamically queried from `identity-service` via internal service calls (`identityClient.service.js`). Failure to dispatch email is handled asynchronously and non-blockingly (`FR-NOTIF-04`).

---

## 🚀 End-to-End (E2E) API Workflows

### 1. Create Availability Slot (FR-BOOK-01, UC-ES-01)
- **Endpoint:** `POST /availability`
- **Headers:** `Authorization: Bearer <SELLER_BROKER_BUILDER_TOKEN>`
- **Request Body:**
```json
{
  "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "date": "2026-08-01",
  "timeSlot": "10:00-11:00"
}
```

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": "Availability slot created",
  "data": {
    "id": "avail-slot-001",
    "ownerId": "builder-uuid-001",
    "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "date": "2026-08-01",
    "timeSlot": "10:00-11:00",
    "isBooked": false
  }
}
```

---

### 2. Create Atomic Site Visit Booking (FR-BOOK-02, FR-LEAD-01, UC-ES-02)
- **Endpoint:** `POST /bookings`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`
- **Description:** Executes an **atomic DB transaction** that locks the time slot (`isBooked = true`), creates the `Booking` record, creates/updates the `Lead` record to stage `VISIT_SCHEDULED`, creates an in-app `Notification`, and fires an async SMTP email.
- **Request Body:**
```json
{
  "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "availabilityId": "avail-slot-001",
  "notes": "Interested in viewing master bedroom balcony"
}
```

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": "Booking created and lead generated successfully",
  "data": {
    "booking": {
      "id": "booking-uuid-001",
      "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "buyerId": "buyer-uuid-101",
      "status": "SCHEDULED",
      "scheduledDate": "2026-08-01",
      "timeSlot": "10:00-11:00"
    },
    "lead": {
      "id": "lead-uuid-001",
      "currentStage": "VISIT_SCHEDULED"
    }
  }
}
```

---

### 3. Cancel Booking (FR-BOOK-03)
- **Endpoint:** `POST /bookings/:bookingId/cancel`
- **Headers:** `Authorization: Bearer <BUYER_OR_OWNER_TOKEN>`
- **Request Body:**
```json
{
  "reason": "Schedule conflict on August 1st"
}
```

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "booking-uuid-001",
    "status": "CANCELLED"
  }
}
```

---

### 4. Reschedule Booking (FR-BOOK-04, UC-ES-03)
- **Endpoint:** `POST /bookings/:bookingId/reschedule`
- **Headers:** `Authorization: Bearer <BUYER_OR_OWNER_TOKEN>`
- **Request Body:**
```json
{
  "newAvailabilityId": "avail-slot-002",
  "notes": "Rescheduling to slot 2"
}
```

---

### 5. Update Lead Stage & Record Audit History (FR-LEAD-02, FR-LEAD-03)
- **Endpoint:** `PATCH /leads/:leadId/stage`
- **Headers:** `Authorization: Bearer <SELLER_BROKER_BUILDER_TOKEN>`
- **Request Body:**
```json
{
  "toStage": "VISIT_COMPLETED",
  "notes": "Site visit went well, buyer asked for price negotiation"
}
```

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "Lead stage updated",
  "data": {
    "id": "lead-uuid-001",
    "currentStage": "VISIT_COMPLETED"
  }
}
```

---

### 6. Get User Notifications (FR-NOTIF-01)
- **Endpoint:** `GET /notifications`
- **Headers:** `Authorization: Bearer <ANY_USER_TOKEN>`

---

## ⚠️ Edge Cases & Validation Matrix

| Scenario | Request | Status Code | Response Payload |
|---|---|---|---|
| **Race-Condition / Double Booking** | Second `POST /bookings` for same `availabilityId` | `409 Conflict` | `{"error":{"code":"SLOT_ALREADY_BOOKED","message":"This time slot has already been booked by another buyer"}}` |
| **Reschedule Target Slot Unavailable** | `POST /bookings/:id/reschedule` to booked slot | `409 Conflict` | `{"error":{"code":"TARGET_SLOT_UNAVAILABLE","message":"Reschedule failed: target time slot is already booked"}}` |
| **Illegal Lead Stage Transition** | `PATCH /leads/:id/stage` jumping `VISIT_SCHEDULED` -> `CLOSED_WON` | `400 Bad Request` | `{"error":{"code":"INVALID_STAGE_TRANSITION","message":"Cannot transition lead stage from VISIT_SCHEDULED to CLOSED_WON"}}` |
| **Non-existent Slot** | `POST /bookings` with invalid `availabilityId` | `404 Not Found` | `{"error":{"code":"SLOT_NOT_FOUND","message":"Availability slot not found"}}` |
| **Buyer Trying to Add Slot** | `POST /availability` with BUYER token | `403 Forbidden` | `{"error":{"code":"FORBIDDEN","message":"Access denied. Requires one of roles: SELLER, BROKER, BUILDER, ADMIN"}}` |
