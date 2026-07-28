# API Gateway Reference & Route Mapping

The **API Gateway** serves as the **single entry point** for all microservices in the GharSetu platform on port `4000` (`http://localhost:4000`).

---

## 🔑 Gateway Configuration
- **Gateway Base URL:** `http://localhost:4000`
- **Rate Limiting:**
  - Global routes: 100 requests per 15 mins per IP
  - Auth routes: 10 requests per 15 mins per IP
- **CORS & Headers:** Forwards `Authorization: Bearer <TOKEN>` intact to target microservices.

---

## 🔀 Unified Proxy Routing Table

| Gateway Route Prefix | Target Microservice | Port | Description |
|---|---|---|---|
| `/auth/*` | `identity-service` | `4001` | Authentication, OTP verification, Google OAuth, Profile management |
| `/properties/*` | `listing-service` | `4002` | Property CRUD, status transition, search filters, reviews |
| `/preferences/*` | `preference-service` | `4003` | Buyer preferences, saved searches, automated email alerts |
| `/discovery/*` | `discovery-history-service` | `4004` | Property view tracking, recent interaction history |
| `/availability/*` | `engagement-service` | `4005` | Builder site-visit calendar management |
| `/bookings/*` | `engagement-service` | `4005` | Atomic site-visit bookings, cancellation, rescheduling |
| `/leads/*` | `engagement-service` | `4005` | Lead lifecycle stage transitions & audit history |
| `/notifications/*` | `engagement-service` | `4005` | Guaranteed in-app user notifications |
| `/analytics/*` | `analytics-service` | `4006` | Real-time Builder & Admin dashboard metrics |
| `/health` | `api-gateway` | `4000` | Gateway health check status |

---

## 🚀 Postman Testing Examples via Gateway

### 1. Register / Login User via Gateway
- **Endpoint:** `POST http://localhost:4000/auth/register`
- **Body:**
```json
{
  "email": "buyer@test.com",
  "password": "Password123!",
  "name": "John Doe",
  "phone": "+919876543210",
  "role": "BUYER"
}
```

### 2. Search Properties via Gateway
- **Endpoint:** `GET http://localhost:4000/properties?city=Navi%20Mumbai&listingType=SALE`

### 3. Book Site Visit via Gateway
- **Endpoint:** `POST http://localhost:4000/bookings`
- **Headers:** `Authorization: Bearer <BUYER_TOKEN>`
- **Body:**
```json
{
  "propertyId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "availabilityId": "avail-slot-001"
}
```

### 4. Fetch Builder Dashboard via Gateway
- **Endpoint:** `GET http://localhost:4000/analytics/builder/dashboard`
- **Headers:** `Authorization: Bearer <BUILDER_TOKEN>`
