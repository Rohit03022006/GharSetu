# Analytics Service API Reference & Testing Scenarios

The **Analytics Service** runs on port `4006` (`http://localhost:4006`).

---

## 🔑 Base Configuration & Authorization
- **Base URL:** `http://localhost:4006`
- **Auth Header:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Database:** Dedicated `analytics_db` PostgreSQL database

---

## 📡 Real-time Event Streaming (Redis Pub/Sub)

The Analytics Service automatically listens to Redis Pub/Sub channels to aggregate real-time metrics:

| Event Channel | Triggering Action | Aggregated Metrics Updated |
|---|---|---|
| `property.viewed` | Buyer views a property detail page | `viewsCount` +1 |
| `booking.created` | Buyer creates a site visit booking | `bookingsCount` +1, `leadsCount` +1 |
| `booking.completed` | Lead stage transitions to `VISIT_COMPLETED` | `completionsCount` +1 |
| `lead.stage_changed` | Lead stage changes | Recorded in audit pipeline |

---

## 🚀 End-to-End (E2E) API Workflows

### 1. Get Builder Analytics Dashboard (FR-ANLY-02, UC-AS-01)
- **Endpoint:** `GET /analytics/builder/dashboard`
- **Headers:** `Authorization: Bearer <SELLER_BROKER_BUILDER_TOKEN>`
- **Description:** Returns aggregated views, leads, bookings, completions, conversion rate percentage, and daily metric breakdowns for properties owned by the builder.

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "Builder analytics retrieved successfully",
  "data": {
    "summary": {
      "totalViews": 150,
      "totalLeads": 12,
      "totalBookings": 8,
      "totalCompletions": 5,
      "conversionRate": 8.00
    },
    "dailyBreakdown": [
      {
        "id": "metric-uuid-001",
        "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "ownerId": "builder-uuid-001",
        "date": "2026-07-28",
        "viewsCount": 150,
        "leadsCount": 12,
        "bookingsCount": 8,
        "completionsCount": 5
      }
    ]
  }
}
```

---

### 2. Get Admin Platform-Wide Dashboard (FR-ANLY-03, UC-AS-03)
- **Endpoint:** `GET /analytics/admin/dashboard`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
- **Description:** Returns platform-wide aggregate metrics across all properties and builders.

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "Platform admin analytics retrieved successfully",
  "data": {
    "platformSummary": {
      "totalViews": 12500,
      "totalLeads": 980,
      "totalBookings": 620,
      "totalCompletions": 410,
      "platformConversionRate": 7.84
    }
  }
}
```

---

## ⚠️ Validation & Access Control Matrix

| Scenario | Request | Status Code | Response Payload |
|---|---|---|---|
| **Unauthorized Request** | `GET /analytics/builder/dashboard` without token | `401 Unauthorized` | `{"error":{"code":"UNAUTHORIZED","message":"Authentication required"}}` |
| **Buyer Accessing Admin Dashboard** | `GET /analytics/admin/dashboard` with BUYER token | `403 Forbidden` | `{"error":{"code":"FORBIDDEN","message":"Access denied. Requires one of roles: ADMIN"}}` |
| **Idempotent Event Re-processing** | Submitting duplicate `eventId` event to aggregator | `200 / Internal Log` | Event skipped gracefully (`SKIPPED_DUPLICATE`), zero double-counting |
