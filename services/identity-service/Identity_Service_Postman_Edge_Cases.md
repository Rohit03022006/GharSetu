# Identity Service — Complete Postman API & Testing Guide

**Base URL:** `http://localhost:4001`  
**Authentication Header:** `Authorization: Bearer <ACCESS_TOKEN>`

---

## 📌 Endpoint Quick Reference Map

| Purpose | Method | Endpoint | Access Level | Description |
|---|---|---|---|---|
| **Register Account** | `POST` | `/auth/register` | Public | Create new account (sends 6-digit Email Verification OTP) |
| **Verify Email OTP** | `POST` | `/auth/verify-otp` | Public | Verify 6-digit OTP after registration to verify email & set status |
| **Resend Email OTP** | `POST` | `/auth/resend-otp` | Public | Resend email verification OTP |
| **Login** | `POST` | `/auth/login` | Public | Login with email & password, returns JWT tokens |
| **Forgot Password** | `POST` | `/auth/forgot-password` | Public | Request 6-digit Password Reset OTP |
| **Reset Password** | `POST` | `/auth/reset-password` | Public | Reset password using 6-digit OTP + new password |
| **Refresh Tokens** | `POST` | `/auth/refresh` | Public | Rotate refresh token & get new access token |
| **Logout** | `POST` | `/auth/logout` | Authenticated | Invalidate active refresh token |
| **Google OAuth Login** | `GET` | `/auth/google` | Public | Initiate Google OAuth2 login flow |
| **Google OAuth Callback** | `GET` | `/auth/google/callback` | Public | OAuth callback URL handling authorization code |
| **Upload Verification Doc** | `POST` | `/admin/verifications/documents` | Broker / Builder | Upload business/identity verification documents |
| **List Pending Approvals** | `GET` | `/admin/verifications/pending` | Admin Only | View users awaiting admin verification approval |
| **Approve User** | `POST` | `/admin/verifications/:userId/approve` | Admin Only | Approve Broker/Builder account (`VERIFIED`) |
| **Reject User** | `POST` | `/admin/verifications/:userId/reject` | Admin Only | Reject Broker/Builder account (`REJECTED`) |

---

## 🚀 Postman Sample Request Payloads

### 1. Register Account (`POST /auth/register`)
```json
{
  "name": "Rahul Sharma",
  "email": "rahul.buyer@example.com",
  "phone": "+919876543210",
  "password": "Password123!",
  "role": "BUYER"
}
```

### 2. Verify Email OTP (`POST /auth/verify-otp`)
> **Use Case:** Called right after registration to verify the email address.
```json
{
  "email": "yefaja5966@jobraux.com",
  "otp": "108942"
}
```

### 3. Resend Email OTP (`POST /auth/resend-otp`)
```json
{
  "email": "yefaja5966@jobraux.com"
}
```

### 4. Login (`POST /auth/login`)
```json
{
  "email": "yefaja5966@jobraux.com",
  "password": "Password123!"
}
```

### 5. Forgot Password — Request OTP (`POST /auth/forgot-password`)
> **Use Case:** Triggered when user clicks "Forgot Password" to receive a password reset OTP.
```json
{
  "email": "rahul.buyer@example.com"
}
```

### 6. Reset Password with OTP (`POST /auth/reset-password`)
> **Use Case:** Submit the received Password Reset OTP along with the new password.
```json
{
  "email": "rahul.buyer@example.com",
  "otp": "940182",
  "newPassword": "NewPassword123!"
}
```

### 7. Refresh Access Token (`POST /auth/refresh`)
```json
{
  "refreshToken": "<PASTE_YOUR_REFRESH_TOKEN_HERE>"
}
```

### 8. Upload Verification Document (`POST /admin/verifications/documents`)
> **Headers:** `Authorization: Bearer <BROKER_OR_BUILDER_JWT>`
```json
{
  "docType": "GST_CERTIFICATE",
  "fileUrl": "https://minio.gharsetu.local/documents/gst_cert_123.pdf"
}
```

---

## 🔑 How to Test Google OAuth 2.0 in Postman

Because OAuth 2.0 requires a browser authorization step with Google, test it in Postman using one of these two methods:

### Method A: Using Postman's Built-in OAuth 2.0 Authorization Tab (Recommended)

1. Open Postman and create a new request or tab.
2. Go to the **Authorization** tab under your request line.
3. Set **Type**: `OAuth 2.0`.
4. In the **Configure New Token** section on the right/bottom panel, enter these values:
   - **Grant Type**: `Authorization Code`
   - **Callback URL**: `http://localhost:4001/auth/google/callback` *(Ensure `Authorize using browser` box is UNCHECKED)*
   - **Auth URL**: `https://accounts.google.com/o/oauth2/v2/auth`
   - **Access Token URL**: `https://oauth2.googleapis.com/token`
   - **Client ID**: `<YOUR_GOOGLE_CLIENT_ID_FROM_.ENV>`
   - **Client Secret**: `<YOUR_GOOGLE_CLIENT_SECRET_FROM_.ENV>`
   - **Scope**: `email profile`
5. Click **Get New Access Token**.
6. A popup window will open in Postman prompting you to log in with your Google Account.
7. After logging in and allowing permissions, Postman captures the callback token, and your backend server registers/authenticates the user in PostgreSQL.

---

### Method B: Testing directly via Browser to Postman Callback

1. Open your browser and navigate to:
   ```text
   http://localhost:4001/auth/google
   ```
2. Complete Google login in the browser window.
3. Upon completion, Google redirects back to `http://localhost:4001/auth/google/callback`.
4. Your server will return a JSON payload with the user object, access token, and refresh token directly in the browser window:
   ```json
   {
     "user": {
       "id": "c1f7b8...",
       "email": "user@gmail.com",
       "name": "User Name",
       "role": "BUYER",
       "isEmailVerified": true,
       "verificationStatus": "VERIFIED"
     },
     "accessToken": "eyJhbGci...",
     "refreshToken": "eyJhbGci..."
   }
   ```
5. Copy the `accessToken` into Postman (`Authorization: Bearer <accessToken>`) for testing downstream protected endpoints!

### 1. Email & Registration OTP Workflow
| Scenario | Endpoint | Request Payload / Setup | Status | Expected Response |
|---|---|---|---|---|
| Duplicate Email | `POST /auth/register` | Existing email | `409` | `{ "error": { "code": "USER_EXISTS", "message": "User with this email or phone already exists." } }` |
| Verify Wrong OTP | `POST /auth/verify-otp` | Incorrect 6-digit OTP | `400` | `{ "error": { "code": "INVALID_OTP", "message": "Invalid OTP entered." } }` |
| Verify Expired OTP | `POST /auth/verify-otp` | OTP older than 10 mins | `400` | `{ "error": { "code": "OTP_EXPIRED", "message": "OTP has expired or is invalid." } }` |

### 2. Password Reset OTP Workflow
| Scenario | Endpoint | Request Payload / Setup | Status | Expected Response |
|---|---|---|---|---|
| Request Reset | `POST /auth/forgot-password` | `{ "email": "rahul.buyer@example.com" }` | `200` | `{ "message": "If the email exists in our system, a password reset OTP has been sent." }` |
| Reset Short Password | `POST /auth/reset-password` | `"newPassword": "123"` | `400` | Zod validation error: `"Password must be at least 6 characters"` |
| Reset Invalid OTP | `POST /auth/reset-password` | Wrong OTP | `400` | `{ "error": { "code": "INVALID_OTP", "message": "Invalid OTP entered." } }` |

### 3. Role-Based Access Control (RBAC)
| Scenario | Endpoint | Token Role | Status | Expected Response |
|---|---|---|---|---|
| Non-Admin Pending List | `GET /admin/verifications/pending` | `BUYER` / `BROKER` | `403` | `{ "message": "Forbidden: Access restricted to [ADMIN] roles..." }` |
| Buyer Document Upload | `POST /admin/verifications/documents` | `BUYER` | `403` | `{ "message": "Forbidden: Access restricted to [BROKER, BUILDER] roles..." }` |
