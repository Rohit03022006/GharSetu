# Listing Service End-to-End (E2E) API Testing Scenarios & Edge Cases

The **Listing Service** runs on port `4002` (`http://localhost:4002`).

---

## 🔑 Base Configuration & Headers
- **Base URL:** `http://localhost:4002`
- **Auth Header:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Role Permissions:**
  - `BUILDER` / `BROKER`: Create draft, autosave, submit for review, upload images (Must be `VERIFIED` by Admin via Identity Service: `GET /admin/verifications/pending`).
  - `ADMIN`: Moderation (Approve / Reject), view internal property data.
  - `BUYER`: Submit property reviews for verified bookings.
  - `GUEST` (Public): Search properties, view public share metadata.

---

## 🚀 Complete End-to-End (E2E) Lifecycle Workflow

```
[1. Create Draft] -> [2. 30s Autosave] -> [3. Image Upload to MinIO] -> [4. Submit for Review + Duplicate Check] -> [5. Admin Approve] -> [6. Search via OpenSearch/Redis] -> [7. Buyer Review] -> [8. Public Share]
```

---

### Test Scenario 1: Create Draft Property (SALE)
- **Endpoint:** `POST /properties/draft`
- **Headers:** `Authorization: Bearer <BUILDER_TOKEN>`
- **Description:** Scaffolds a new property in `DRAFT` status with full room, pricing, and address metadata.

#### Request Body
```json
{
  "title": "Sunwest Riviera 3BHK Apartment",
  "description": "Ultra-luxury high-rise apartment with panoramic ocean views.",
  "listingType": "SALE",
  "propertyType": "APARTMENT",
  "constructionStatus": "READY_TO_MOVE",
  "furnishingStatus": "FULLY_FURNISHED",
  "price": 28500000,
  "areaSqFt": 1650,
  "bedrooms": 3,
  "bathrooms": 3,
  "parkingSlots": 2,
  "address": "Palm Beach Road, Nerul",
  "city": "Navi Mumbai",
  "state": "Maharashtra",
  "pincode": "400706",
  "latitude": 19.0330,
  "longitude": 73.0169,
  "metroProximity": true,
  "amenities": ["Gymnasium", "Infinity Pool", "Clubhouse", "24/7 Security"]
}
```

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": "Draft property created successfully",
  "data": {
    "id": "prop-uuid-9901",
    "title": "Sunwest Riviera 3BHK Apartment",
    "status": "DRAFT",
    "ownerId": "user-uuid-builder",
    "ownerRole": "BUILDER",
    "price": 28500000,
    "createdAt": "2026-07-28T11:50:00.000Z"
  }
}
```

---

### Test Scenario 2: 30-Second Autosave Draft Updates
- **Endpoint:** `PUT /properties/:id/autosave`
- **Headers:** `Authorization: Bearer <BUILDER_TOKEN>`
- **Description:** Simulates periodic form background saves while keeping status as `DRAFT`.

#### Request Body
```json
{
  "price": 29000000,
  "description": "Updated price and description during active editing."
}
```

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "Draft autosaved successfully",
  "data": {
    "id": "prop-uuid-9901",
    "price": 29000000,
    "status": "DRAFT"
  }
}
```

---

### Test Scenario 3: Upload Image to MinIO Object Storage
- **Endpoint:** `POST /properties/:id/images`
- **Headers:** `Authorization: Bearer <BUILDER_TOKEN>`
- **Body:** `form-data` with key `image` (JPEG/PNG file upload)
- **Description:** Runs Multer -> Sharp WEBP compression (80% quality, max 1200x800) -> Uploads object to MinIO bucket `gharsetu-listings`.

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": "Image uploaded to MinIO successfully",
  "data": {
    "id": "img-uuid-001",
    "propertyId": "prop-uuid-9901",
    "url": "http://localhost:9000/gharsetu-listings/properties/1785212000_living_room.webp",
    "key": "properties/1785212000_living_room.webp",
    "isPrimary": true
  }
}
```

---

### Test Scenario 4: Submit Draft for Admin Review (Duplicate Check)
- **Endpoint:** `POST /properties/:id/submit`
- **Headers:** `Authorization: Bearer <BUILDER_TOKEN>`
- **Description:** Transitions status `DRAFT -> PENDING` and runs advisory duplicate detection against existing active listings.

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "Property submitted for admin review",
  "duplicateCheck": {
    "isPossibleDuplicate": false,
    "matchedProperties": []
  },
  "data": {
    "id": "prop-uuid-9901",
    "status": "PENDING"
  }
}
```

---

### Test Scenario 5: Admin Moderation (Approve Property)
- **Endpoint:** `POST /properties/:id/approve`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
- **Description:** Transitions status `PENDING -> APPROVED`, marks property as live, indexes into OpenSearch, and invalidates search Redis cache.

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "Property approved and live in search",
  "data": {
    "id": "prop-uuid-9901",
    "status": "APPROVED",
    "approvedBy": "admin-uuid-001",
    "approvedAt": "2026-07-28T11:52:00.000Z"
  }
}
```

---

### Test Scenario 6: Admin Moderation (Reject Property Edge Case)
- **Endpoint:** `POST /properties/:id/reject`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
- **Description:** Rejects property with enforced enum (`SPAM`, `DUPLICATE`, `FAKE`, `INCOMPLETE`, `POLICY_VIOLATION`, `OTHER`).

#### Request Body
```json
{
  "rejectionReason": "INCOMPLETE",
  "rejectionNote": "High resolution exterior photos are missing."
}
```

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "Property listing rejected",
  "data": {
    "id": "prop-uuid-9901",
    "status": "REJECTED",
    "rejectionReason": "INCOMPLETE",
    "rejectionCount": 1
  }
}
```

---

### Test Scenario 7: Public Filtered Search (OpenSearch + Redis Cache)
- **Endpoint:** `GET /search?city=Navi Mumbai&bedrooms=3&minPrice=20000000&maxPrice=35000000&page=1&limit=20`
- **Access:** Public (No Token Required)

#### Response (First Request - Live Query from OpenSearch/PostgreSQL)
```json
{
  "success": true,
  "engine": "OpenSearch",
  "count": 1,
  "totalCount": 1,
  "page": 1,
  "totalPages": 1,
  "cached": false,
  "data": [
    {
      "id": "prop-uuid-9901",
      "title": "Sunwest Riviera 3BHK Apartment",
      "price": 29000000,
      "city": "Navi Mumbai",
      "bedrooms": 3,
      "status": "APPROVED"
    }
  ]
}
```

#### Response (Second Request - Instant Redis Cache Hit)
```json
{
  "success": true,
  "engine": "Redis",
  "count": 1,
  "totalCount": 1,
  "cached": true
}
```

---

### Test Scenario 8: Buyer Review Submission & Rating Aggregation
- **Endpoint:** `POST /reviews/property/:id`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`
- **Description:** Submits buyer review and automatically recalculates property `avgRating` and `totalReviews`.

#### Request Body
```json
{
  "bookingId": "booking-uuid-7701",
  "rating": 5,
  "comment": "Outstanding property with amazing views and verified documents."
}
```

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "rev-uuid-501",
    "propertyId": "prop-uuid-9901",
    "rating": 5,
    "comment": "Outstanding property with amazing views and verified documents."
  }
}
```

---

### Test Scenario 9: Public Social Share & OpenGraph Metadata
- **Endpoint:** `GET /share/:id`
- **Access:** Public (No Token Required)

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "prop-uuid-9901",
    "title": "Sunwest Riviera 3BHK Apartment",
    "price": 29000000,
    "city": "Navi Mumbai",
    "imageUrl": "http://localhost:9000/gharsetu-listings/properties/1785212000_living_room.webp",
    "openGraph": {
      "ogTitle": "Sunwest Riviera 3BHK Apartment | GharSetu",
      "ogDescription": "Price: ₹2,90,000,00 - 3 BHK in Navi Mumbai",
      "ogImage": "http://localhost:9000/gharsetu-listings/properties/1785212000_living_room.webp",
      "ogUrl": "https://gharsetu.com/properties/prop-uuid-9901"
    }
  }
}
```

---

## ⚠️ Edge Cases & Error Scenarios

| Scenario | Request | Expected Status | Error Response |
|---|---|---|---|
| **Rental listing missing deposit** | `POST /properties/draft` (`listingType: "RENT"`, missing `securityDeposit`) | `400 Bad Request` | `{"error":{"code":"VALIDATION_ERROR","message":"Rental listings require securityDeposit and leaseDurationMonths"}}` |
| **Unauthorized role moderation** | `POST /properties/:id/approve` with `BUILDER` token | `403 Forbidden` | `{"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action"}}` |
| **Duplicate Booking Review** | `POST /reviews/property/:id` with same `bookingId` twice | `400 Bad Request` | `{"error":{"code":"DUPLICATE_REVIEW","message":"You have already reviewed this booking"}}` |
| **Invalid Image Upload Format** | Upload `.pdf` or `.exe` file to `POST /properties/:id/images` | `500 Server Error` / Multer filter | `{"error":{"code":"SERVER_ERROR","message":"Only image files (JPEG, PNG, WEBP) are allowed"}}` |
| **Unapproved Property Share** | `GET /share/:id` for property in `DRAFT` status | `404 Not Found` | `{"error":{"code":"NOT_FOUND","message":"Property not found or not approved for public sharing"}}` |
