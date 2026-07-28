# Discovery & History Service API Reference & Testing Scenarios

The **Discovery & History Service** runs on port `4004` (`http://localhost:4004`).

---

## 🔑 Base Configuration & Authorization
- **Base URL:** `http://localhost:4004`
- **Auth Header:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Database:** Dedicated `discovery_db` PostgreSQL database
- **Caching:** Redis (`redis://localhost:6379`) with 2-minute TTL for Listing Service property lookups.

---

## 🚀 End-to-End (E2E) API Workflows

### 1. Log Property View (FR-REC-01, UC-DH-01)
- **Endpoint:** `POST /internal/views`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`
- **Description:** Logs a property view and automatically caps the user's history log to the 20 most recent entries.

#### Request Body
```json
{
  "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
}
```

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": "Property view logged",
  "data": {
    "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "viewedAt": "2026-07-28T12:45:00.000Z"
  }
}
```

---

### 2. Get Recently Viewed Properties (FR-REC-01)
- **Endpoint:** `GET /recently-viewed`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`
- **Description:** Returns up to 20 recently viewed properties populated via Listing Service (`/internal/properties/:id`) using a 2-minute Redis cache.

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "title": "Sunwest Riviera 3BHK Apartment",
      "price": 28500000,
      "city": "Navi Mumbai",
      "_source": "Redis"
    }
  ]
}
```

---

### 3. Log Search History (FR-REC-02)
- **Endpoint:** `POST /search-history`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`
- **Request Body:**
```json
{
  "filters": {
    "city": "Navi Mumbai",
    "bedrooms": 3,
    "minPrice": 20000000,
    "maxPrice": 35000000
  }
}
```

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": "Search history logged",
  "data": {
    "id": "search-uuid-001",
    "userId": "user-uuid-buyer",
    "filters": {
      "city": "Navi Mumbai",
      "bedrooms": 3
    },
    "createdAt": "2026-07-28T12:45:00.000Z"
  }
}
```

---

### 4. Get Rule-Based Similar Properties (FR-REC-03, FR-REC-04, UC-DH-02)
- **Endpoint:** `GET /similar/:propertyId`
- **Access:** Public (No Token Required)
- **Rules:** Matches properties with the same `city`, `propertyType`, and price within $\pm 20\%$ of the reference property.

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      "title": "Prestige Horizon 3BHK",
      "price": 27000000,
      "city": "Navi Mumbai",
      "bedrooms": 3
    }
  ]
}
```

---

## ⚠️ Edge Cases & Validation Matrix

| Scenario | Request | Status Code | Response Payload |
|---|---|---|---|
| **Invalid Property View UUID** | `POST /internal/views` with `"propertyId": "123"` | `400 Bad Request` | `{"error":{"code":"VALIDATION_ERROR","message":"Valid propertyId UUID is required"}}` |
| **Missing Search Filters** | `POST /search-history` with `{}` | `400 Bad Request` | `{"error":{"code":"VALIDATION_ERROR","message":"Search filters object is required"}}` |
| **Missing JWT Token** | `GET /recently-viewed` without Bearer header | `401 Unauthorized` | `{"error":{"code":"UNAUTHORIZED","message":"Access token required"}}` |
