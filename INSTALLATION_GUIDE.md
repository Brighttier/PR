# Installation Guide - API Routes Setup

## Quick Start

### 1. Install Required Dependencies

```bash
cd frontend
npm install next-auth firebase-admin stripe
```

### 2. Configure Environment Variables

Create or update `.env.local` in the frontend directory:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-min-32-chars

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Meeting Bot Webhooks
ZOOM_WEBHOOK_SECRET=your-zoom-secret
TEAMS_WEBHOOK_SECRET=your-teams-secret
MEET_WEBHOOK_SECRET=your-meet-secret
```

### 3. Generate NextAuth Secret

```bash
# Generate a secure random secret
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in `.env.local`.

### 4. Set Up Firebase Service Account

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Convert to single-line JSON and add to `.env.local`:

```bash
# On macOS/Linux:
cat service-account.json | jq -c '.' | pbcopy

# Then paste into .env.local as FIREBASE_SERVICE_ACCOUNT_KEY
```

### 5. Configure Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen for:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   - customer.subscription.trial_will_end
4. Copy the webhook signing secret and add to `.env.local`

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret (starts with whsec_)
```

### 6. Configure Meeting Bot Webhooks

#### Zoom
1. Go to Zoom Marketplace > Develop > Build App
2. Create a Webhook-only app
3. Add webhook endpoint: `https://your-domain.com/api/webhooks/meeting-bots`
4. Subscribe to events:
   - Recording Completed
   - Meeting Ended
5. Generate a secret token and add to `.env.local`

#### Microsoft Teams
1. Go to Teams Admin Center > Bots
2. Configure webhook URL
3. Generate webhook secret

#### Google Meet
1. Configure in Google Cloud Console
2. Set up webhook endpoint
3. Generate authentication credentials

### 7. Verify Installation

Start the development server:

```bash
npm run dev
```

Test the API routes:

```bash
# Health check (should return 404 as there's no root API route, which is expected)
curl http://localhost:3000/api

# Test meeting bots webhook GET (should return status)
curl http://localhost:3000/api/webhooks/meeting-bots
```

### 8. Test Authentication

Create a test user and get an ID token, then test an authenticated route:

```bash
# Example: Test GDPR export (requires authentication)
curl -X POST http://localhost:3000/api/gdpr/export-data \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json"
```

## Troubleshooting

### Firebase Admin SDK Issues

**Error: "Could not load the default credentials"**

Solution: Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is properly formatted as a single-line JSON string.

```bash
# Verify the JSON is valid
echo $FIREBASE_SERVICE_ACCOUNT_KEY | jq .
```

**Error: "app/duplicate-app"**

Solution: This is expected on hot reload. Firebase Admin is initialized only once.

### NextAuth Issues

**Error: "No secret provided"**

Solution: Set `NEXTAUTH_SECRET` in `.env.local` with a value at least 32 characters long.

**Error: "NEXTAUTH_URL is missing"**

Solution: Set `NEXTAUTH_URL=http://localhost:3000` in `.env.local`.

### Stripe Webhook Issues

**Error: "No signatures found matching the expected signature"**

Solution:
1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. For local testing, use Stripe CLI to forward webhooks
3. Check that the webhook secret starts with `whsec_`

### Rate Limiting Issues

**Error: "Rate limit exceeded"**

Solution: Rate limits are per user/IP. Wait for the time window to reset, or restart the server to clear the in-memory store during development.

To disable rate limiting during development, comment out the rate limit checks in the route handlers.

### CORS Issues

If testing from a different origin:

```typescript
// Add to route handler
export async function POST(req: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers });
  }

  // ... rest of route handler
}
```

## Production Deployment

### 1. Update Environment Variables

Set production URLs and secrets:

```bash
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=different-secret-for-production
# ... other production credentials
```

### 2. Set Up Redis for Rate Limiting

Replace in-memory rate limiting with Redis:

```bash
npm install ioredis
```

Update `lib/rate-limit.ts` to use Redis instead of Map.

### 3. Configure Webhooks

Update webhook URLs to production endpoints:
- Stripe: `https://your-domain.com/api/webhooks/stripe`
- Meeting Bots: `https://your-domain.com/api/webhooks/meeting-bots`

### 4. Set Up Monitoring

Add error tracking and monitoring:

```bash
npm install @sentry/nextjs
```

Configure Sentry in `sentry.config.js`.

### 5. Security Checklist

- [ ] All secrets stored in secure environment variables
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Firebase service account has minimal required permissions
- [ ] CORS configured correctly for your domain
- [ ] Rate limiting enabled on all routes
- [ ] Webhook signatures verified
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Request logging enabled
- [ ] Error tracking set up

## Additional Configuration

### Custom Rate Limits

Edit `lib/rate-limit.ts` to adjust rate limits:

```typescript
export const RATE_LIMITS = {
  GDPR_EXPORT: { interval: 60 * 60 * 1000, maxRequests: 5 }, // 5 per hour
  // ... other limits
};
```

### Custom Audit Logging

Add custom audit logging in route handlers:

```typescript
await db.collection("auditLog").add({
  userId,
  action: "custom_action",
  timestamp: new Date(),
  severity: "medium",
  metadata: { /* custom data */ },
});
```

### Email Notifications

Configure email service for GDPR notifications:

```bash
npm install nodemailer
```

Create `lib/email.ts` and add email sending logic.

## Testing

### Unit Tests

Create tests for rate limiting:

```typescript
// __tests__/rate-limit.test.ts
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

test('rate limit allows requests within limit', () => {
  const result = checkRateLimit('test-user', RATE_LIMITS.DEFAULT);
  expect(result.allowed).toBe(true);
});
```

### Integration Tests

Test API routes with mock authentication:

```typescript
// __tests__/api/gdpr/export-data.test.ts
import { POST } from '@/app/api/gdpr/export-data/route';

// Mock NextAuth
jest.mock('next-auth');

test('exports user data successfully', async () => {
  // ... test implementation
});
```

## Support

For issues or questions:
1. Check the API README: `frontend/app/api/README.md`
2. Review the implementation summary: `API_ROUTES_SUMMARY.md`
3. Check Firebase logs for backend errors
4. Review Stripe webhook logs in dashboard
5. Check browser console for client-side errors

## Resources

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [GDPR Compliance Guide](https://gdpr.eu/)
