# Preference Service API Reference & Testing Scenarios

The **Preference Service** runs on port `4003` (`http://localhost:4003`).

---

## 🔑 Base Configuration & Authorization
- **Base URL:** `http://localhost:4003`
- **Auth Header:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Database:** Dedicated `preference_db` PostgreSQL database
- **Caching:** Redis (`redis://localhost:6379`) with 2-minute TTL for Listing Service property lookups.

---

## 🚀 End-to-End (E2E) API Workflows

### 1. Add Property to Wishlist (FR-WISH-01, UC-PS-01)
- **Endpoint:** `POST /wishlist`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`
- **Request Body:**
```json
{
  "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "notes": "Top pick for ocean view apartment"
}
```

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": "Property added to wishlist",
  "data": {
    "id": "wish-uuid-001",
    "userId": "user-uuid-buyer",
    "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "notes": "Top pick for ocean view apartment",
    "createdAt": "2026-07-28T12:30:00.000Z"
  }
}
```

---

### 2. Get User Wishlist with Populated Properties
- **Endpoint:** `GET /wishlist`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`
- **Description:** Resolves property details from Listing Service (`/internal/properties/:id`) using a 2-minute Redis cache.

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "wish-uuid-001",
      "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "notes": "Top pick for ocean view apartment",
      "addedAt": "2026-07-28T12:30:00.000Z",
      "property": {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "title": "Sunwest Riviera 3BHK Apartment",
        "price": 28500000,
        "city": "Navi Mumbai",
        "_source": "Redis"
      }
    }
  ]
}
```

---

### 3. Remove Property from Wishlist
- **Endpoint:** `DELETE /wishlist/:propertyId`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "Property removed from wishlist"
}
```

---

### 4. Compare Properties (FR-WISH-02, UC-PS-02)
- **Endpoint:** `POST /compare`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`
- **Rules:** Compares minimum 2 and maximum 4 properties side-by-side.
- **Request Body:**
```json
{
  "propertyIds": [
    "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"
  ]
}
```

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "title": "Sunwest Riviera 3BHK Apartment",
      "price": 28500000,
      "city": "Navi Mumbai",
      "bedrooms": 3,
      "_source": "ListingService"
    },
    {
      "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      "title": "Prestige Horizon 2BHK",
      "price": 17500000,
      "city": "Navi Mumbai",
      "bedrooms": 2,
      "_source": "Redis"
    }
  ]
}
```

---

## ⚠️ Edge Cases & Validation Matrix

| Scenario | Request | Status Code | Response Payload |
|---|---|---|---|
| **Compare > 4 properties** | `POST /compare` with 5 property UUIDs | `400 Bad Request` | `{"error":{"code":"VALIDATION_ERROR","message":"Maximum 4 properties can be compared at a time"}}` |
| **Compare < 2 properties** | `POST /compare` with 1 property UUID | `400 Bad Request` | `{"error":{"code":"VALIDATION_ERROR","message":"At least 2 properties are required for comparison"}}` |
| **Missing JWT Header** | Any endpoint without token | `401 Unauthorized` | `{"error":{"code":"UNAUTHORIZED","message":"Access token required"}}` |
| **Remove Non-existent Wishlist** | `DELETE /wishlist/non-existent-uuid` | `404 Not Found` | `{"error":{"code":"NOT_FOUND","message":"Wishlist item not found"}}` |
