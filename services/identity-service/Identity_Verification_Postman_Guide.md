# Identity Service Verification & Admin Postman Guide

The **Identity Service** runs on port `4001` (`http://localhost:4001`).

---

## 🔑 Base Configuration & Authorization
- **Base URL:** `http://localhost:4001`
- **Auth Header:** `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`

---

## 📋 Admin Builder/Broker Verification Endpoints

### 1. Fetch Pending Verifications (GET)
- **Method:** `GET` *(Note: Sending POST to this URL returns 404/Cannot POST error)*
- **URL:** `http://localhost:4001/admin/verifications/pending`
- **Headers:** `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid-123",
      "email": "builder@gharsetu.com",
      "name": "Sunwest Builders",
      "role": "BUILDER",
      "verificationStatus": "PENDING",
      "createdAt": "2026-07-28T10:00:00.000Z"
    }
  ]
}
```

---

### 2. Admin Approve Builder/Broker (POST)
- **Method:** `POST`
- **URL:** `http://localhost:4001/admin/verifications/:userId/approve`
- **Headers:** `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Request Body:**
```json
{
  "notes": "Verified RERA Registration and Government ID."
}
```

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "User verification status updated to VERIFIED",
  "data": {
    "userId": "user-uuid-123",
    "verificationStatus": "VERIFIED",
    "verifiedBy": "admin-uuid-001"
  }
}
```

---

### 3. Admin Reject Builder/Broker (POST)
- **Method:** `POST`
- **URL:** `http://localhost:4001/admin/verifications/:userId/reject`
- **Headers:** `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Request Body:**
```json
{
  "reason": "Invalid or unreadable document uploaded."
}
```

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": "User verification status updated to REJECTED",
  "data": {
    "userId": "user-uuid-123",
    "verificationStatus": "REJECTED"
  }
}
```
