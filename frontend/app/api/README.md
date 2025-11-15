# API Routes Documentation

This directory contains all Next.js API Route Handlers for the Persona Recruit AI application.

## Overview

All routes use Next.js 15 Route Handlers with the following features:
- TypeScript type safety
- NextAuth authentication
- Firebase Admin SDK for backend operations
- Rate limiting for abuse prevention
- Comprehensive error handling
- Audit logging for critical operations

## Authentication

Most routes require authentication via NextAuth. The session includes:
- `user.uid` - Firebase user ID
- `user.email` - User email
- `user.role` - User role (candidate, recruiter, interviewer, hr_admin, platform_admin)
- `user.companyId` - Company ID (null for candidates)

## Routes

### Interview Routes

#### `POST /api/interview/start`
Start an AI interview session.

**Authentication:** Required (candidate)

**Request Body:**
```json
{
  "interviewId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview started successfully",
  "interviewId": "string"
}
```

**Rate Limit:** 30 requests per minute

---

#### `POST /api/interview/end`
End an AI interview session.

**Authentication:** Required (candidate)

**Request Body:**
```json
{
  "interviewId": "string",
  "signOffType": "completed" | "abandoned",
  "recordingUrl": "string" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview ended successfully",
  "interviewId": "string",
  "elapsedTime": 1234
}
```

**Rate Limit:** 30 requests per minute

---

#### `POST /api/interview/send-message`
Send a message during an AI interview session.

**Authentication:** Required (candidate)

**Request Body:**
```json
{
  "interviewId": "string",
  "message": "string",
  "type": "text" | "voice"
}
```

**Rate Limit:** 30 requests per minute

---

#### `POST /api/interview/audio-stream`
Stream audio during voice interview.

**Authentication:** Required (candidate)

**Content-Type:** `multipart/form-data` or `audio/webm`

**Rate Limit:** 30 requests per minute

---

### GDPR Routes

#### `POST /api/gdpr/export-data`
Export all user data in compliance with GDPR Article 15 (Right of Access).

**Authentication:** Required

**Request Body:** None required (uses authenticated user)

**Response:**
```json
{
  "success": true,
  "message": "Data export completed successfully",
  "downloadUrl": "https://storage.googleapis.com/...",
  "fileName": "persona-ai-data-export-123-456.json",
  "expiresIn": "7 days",
  "recordCounts": {
    "applications": 5,
    "interviews": 3,
    "communications": 12,
    "consents": 4,
    "auditLog": 150
  }
}
```

**Rate Limit:** 3 requests per hour

**Notes:**
- Generates a comprehensive JSON export of all personal data
- Upload to Firebase Storage with 7-day expiration
- Signed URL valid for 7 days
- Logs export event in audit log

---

#### `DELETE /api/gdpr/delete-account`
Delete user account in compliance with GDPR Article 17 (Right to Erasure).

**Authentication:** Required

**Request Body:**
```json
{
  "confirmationToken": "DELETE_12345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deletion request processed successfully",
  "scheduledDeletionDate": "2025-12-14T00:00:00.000Z",
  "retentionPeriod": "30 days",
  "details": {
    "userAccountDisabled": true,
    "applicationCount": 5,
    "interviewsCancelled": 2,
    "permanentDeletionDate": "2025-12-14T00:00:00.000Z"
  },
  "nextSteps": [...]
}
```

**Rate Limit:** 1 request per 24 hours

**Notes:**
- Soft delete with 30-day retention period
- Immediately disables Firebase Auth account
- Anonymizes personal data in company records
- Cancels all scheduled interviews
- Schedules permanent deletion after 30 days

---

#### `GET /api/gdpr/delete-account`
Check account deletion status.

**Authentication:** Required

**Response:**
```json
{
  "deletionScheduled": true,
  "scheduledFor": "2025-12-14T00:00:00.000Z",
  "daysRemaining": 28,
  "canCancel": true
}
```

---

### Webhook Routes

#### `POST /api/webhooks/stripe`
Handle Stripe webhook events for subscription management.

**Authentication:** Stripe webhook signature verification

**Supported Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.trial_will_end`

**Request Headers:**
```
stripe-signature: string (required)
```

**Response:**
```json
{
  "received": true
}
```

**Rate Limit:** 100 requests per minute

**Notes:**
- Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
- Updates company subscription status in Firestore
- Logs all subscription events in audit log
- Handles payment success/failure notifications

---

#### `POST /api/webhooks/meeting-bots`
Handle webhooks from meeting bot services (Zoom, Teams, Google Meet).

**Authentication:** HMAC signature verification

**Request Body:**
```json
{
  "provider": "zoom" | "teams" | "meet",
  "meetingId": "string",
  "recordingUrl": "string" (optional),
  "transcriptUrl": "string" (optional),
  "transcript": "string" (optional),
  "duration": 1234 (optional),
  "startTime": "2025-11-14T10:00:00.000Z" (optional),
  "endTime": "2025-11-14T11:00:00.000Z" (optional),
  "participants": [...] (optional),
  "metadata": {...} (optional)
}
```

**Request Headers:**
```
x-webhook-signature: string (required)
x-webhook-timestamp: string (required)
```

**Response:**
```json
{
  "success": true,
  "message": "Meeting bot webhook processed successfully",
  "interviewId": "string",
  "processed": {
    "recording": true,
    "transcript": true,
    "metadata": true
  }
}
```

**Rate Limit:** 100 requests per minute

**Notes:**
- Downloads recording and uploads to Firebase Storage
- Processes transcript for AI analysis
- Updates interview document with meeting metadata
- Triggers AI analysis Cloud Function

---

#### `GET /api/webhooks/meeting-bots`
Webhook verification endpoint (Zoom requirement).

**Query Parameters:**
```
challenge: string (for Zoom verification)
```

**Response:**
```
Plain text: challenge value (for Zoom)
OR
{
  "status": "Meeting Bots Webhook Endpoint",
  "supportedProviders": ["zoom", "teams", "meet"]
}
```

---

### Admin Routes

#### `POST /api/admin/impersonate`
Create impersonation token for platform admin to access user accounts.

**Authentication:** Required (platform_admin only)

**Request Body:**
```json
{
  "targetUserId": "string",
  "reason": "string",
  "duration": 60 (minutes, optional, default: 60, max: 240)
}
```

**Response:**
```json
{
  "success": true,
  "token": "abc123...",
  "expiresAt": "2025-11-14T11:00:00.000Z",
  "duration": 60,
  "targetUser": {
    "uid": "string",
    "email": "string",
    "displayName": "string"
  },
  "warning": "This action has been logged..."
}
```

**Rate Limit:** 10 requests per hour

**Security Notes:**
- Only platform_admin role can create tokens
- Cannot impersonate other platform admins
- All impersonation events logged with CRITICAL severity
- Token is single-use and expires after duration
- IP address and user agent logged

---

#### `GET /api/admin/impersonate?token=abc123`
Validate and consume impersonation token.

**Authentication:** None (validates token)

**Query Parameters:**
```
token: string (required)
```

**Response:**
```json
{
  "success": true,
  "customToken": "firebase-custom-token",
  "targetUser": {
    "uid": "string",
    "email": "string",
    "displayName": "string"
  },
  "impersonationInfo": {
    "adminEmail": "string",
    "reason": "string",
    "expiresAt": "2025-11-14T11:00:00.000Z"
  }
}
```

**Notes:**
- Token can only be used once
- Returns Firebase custom token for authentication
- Logs token usage in audit log

---

#### `DELETE /api/admin/impersonate`
Revoke an active impersonation token.

**Authentication:** Required (platform_admin or token owner)

**Request Body:**
```json
{
  "token": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Impersonation token revoked successfully"
}
```

---

## Rate Limiting

Rate limits are enforced using an in-memory store (use Redis in production).

| Endpoint | Limit |
|----------|-------|
| GDPR Export | 3 per hour |
| GDPR Delete | 1 per 24 hours |
| Webhooks | 100 per minute |
| Admin Impersonate | 10 per hour |
| Interviews | 30 per minute |
| Default | 60 per minute |

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1699999999
Retry-After: 60 (on 429 errors)
```

## Error Handling

All routes return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information (optional)",
  "message": "User-friendly message (optional)"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Environment Variables

Required environment variables:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Meeting Bots
ZOOM_WEBHOOK_SECRET=your-secret
TEAMS_WEBHOOK_SECRET=your-secret
MEET_WEBHOOK_SECRET=your-secret
```

## Testing

Use the provided test scripts in `/scripts/test-api.sh`:

```bash
# Test GDPR export
curl -X POST http://localhost:3000/api/gdpr/export-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Test Stripe webhook (with signature)
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "stripe-signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d @webhook-payload.json
```

## Audit Logging

All critical operations are logged to the `auditLog` collection:

```typescript
{
  userId: string;
  action: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  metadata: {...};
}
```

Logged actions:
- `gdpr_data_export`
- `gdpr_account_deletion_requested`
- `admin_impersonation_created`
- `admin_impersonation_token_used`
- `subscription_created`
- `subscription_updated`
- `payment_succeeded`
- `payment_failed`
- `meeting_bot_webhook_received`

## Security Best Practices

1. **Always verify authentication** before processing requests
2. **Use rate limiting** to prevent abuse
3. **Validate input** using TypeScript types and runtime checks
4. **Log critical operations** for audit trails
5. **Use HMAC signatures** for webhook verification
6. **Implement proper error handling** without leaking sensitive info
7. **Use secure token generation** (crypto.randomBytes)
8. **Set appropriate CORS headers** (if needed)
9. **Implement request timeouts** to prevent hanging requests
10. **Use environment variables** for all secrets

## Future Enhancements

- [ ] Migrate rate limiting to Redis for distributed systems
- [ ] Add request ID tracing for debugging
- [ ] Implement request/response logging middleware
- [ ] Add Sentry integration for error tracking
- [ ] Implement webhook retry logic with exponential backoff
- [ ] Add API versioning (e.g., /api/v1/...)
- [ ] Implement GraphQL endpoint for complex queries
- [ ] Add OpenAPI/Swagger documentation
- [ ] Implement webhook event queuing with Bull/BullMQ
- [ ] Add API analytics and monitoring dashboard
