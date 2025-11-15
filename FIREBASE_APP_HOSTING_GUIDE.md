# Firebase App Hosting Deployment Guide
## Persona Recruit AI - Production Deployment with Google Cloud Secret Manager

---

## Prerequisites

1. **Google Cloud Project with Firebase**
   - Firebase project created
   - Billing enabled (Blaze plan)
   - Owner or Editor permissions

2. **Required Tools**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Install Google Cloud SDK
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

3. **GitHub Repository**
   - Code pushed to GitHub
   - Firebase App Hosting will deploy from GitHub

---

## Step 1: Enable Required Services

### 1.1 Firebase Services
Enable in [Firebase Console](https://console.firebase.google.com):
- ✅ Authentication → Email/Password provider
- ✅ Firestore Database → Create in production mode
- ✅ Storage → Create default bucket
- ✅ Functions → Ensure Blaze plan is active
- ✅ App Hosting → Enable (currently in preview)

### 1.2 Google Cloud APIs
Enable in [Google Cloud Console](https://console.cloud.google.com/apis/library):
```bash
# Or use gcloud CLI
gcloud services enable \
  aiplatform.googleapis.com \
  generativelanguage.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com
```

---

## Step 2: Set Up Google Cloud Secret Manager

### 2.1 Create Secrets

```bash
# Login to Google Cloud
gcloud auth login
gcloud config set project persona-recruit-ai-1753870110

# Create secrets (one-time setup)

# 1. NextAuth Secret
openssl rand -base64 32 | gcloud secrets create NEXTAUTH_SECRET --data-file=-

# 2. Firebase Service Account (from downloaded JSON)
gcloud secrets create FIREBASE_SERVICE_ACCOUNT_KEY --data-file=path/to/serviceAccountKey.json

# 3. Gemini API Key
echo "YOUR_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-

# 4. SendGrid API Key
echo "YOUR_SENDGRID_API_KEY" | gcloud secrets create SENDGRID_API_KEY --data-file=-

# 5. Stripe Keys (optional)
echo "YOUR_STRIPE_SECRET_KEY" | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
echo "YOUR_STRIPE_WEBHOOK_SECRET" | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=-

# 6. Meeting Bot Secrets (optional)
echo "YOUR_ZOOM_SECRET" | gcloud secrets create ZOOM_WEBHOOK_SECRET --data-file=-
echo "YOUR_TEAMS_SECRET" | gcloud secrets create TEAMS_WEBHOOK_SECRET --data-file=-
echo "YOUR_MEET_SECRET" | gcloud secrets create MEET_WEBHOOK_SECRET --data-file=-
```

### 2.2 Grant Access to Service Accounts

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe persona-recruit-ai-1753870110 --format="value(projectNumber)")

# Grant App Hosting service account access to secrets
gcloud secrets add-iam-policy-binding NEXTAUTH_SECRET \
  --member="serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-firebaseapphosting.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Repeat for each secret
for SECRET in FIREBASE_SERVICE_ACCOUNT_KEY GEMINI_API_KEY SENDGRID_API_KEY STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET ZOOM_WEBHOOK_SECRET TEAMS_WEBHOOK_SECRET MEET_WEBHOOK_SECRET; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-firebaseapphosting.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done

# Grant Cloud Functions service account access (for backend functions)
for SECRET in FIREBASE_SERVICE_ACCOUNT_KEY GEMINI_API_KEY SENDGRID_API_KEY STRIPE_SECRET_KEY; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:persona-recruit-ai-1753870110@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

---

## Step 3: Update Configuration Files

### 3.1 Update `.firebaserc` ✅ COMPLETED
Your Firebase project ID is already configured:
```json
{
  "projects": {
    "default": "persona-recruit-ai-1753870110"
  }
}
```

### 3.2 Update `apphosting.yaml` ✅ COMPLETED
Your Firebase configuration in `/frontend/apphosting.yaml` is already updated with actual values:
```yaml
env:
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    value: AIzaSyAZz3obF6GWhFgUfHdjql2krif-rnmsY4I
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    value: persona-recruit-ai-1753870110.firebaseapp.com
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
    value: persona-recruit-ai-1753870110
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    value: persona-recruit-ai-1753870110.firebasestorage.app
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    value: "934696740757"
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_APP_ID
    value: "1:934696740757:web:9a70441da45f47f7f8789c"
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXTAUTH_URL
    value: https://persona-recruit-ai-1753870110.web.app
    availability:
      - BUILD
      - RUNTIME
```

---

## Step 4: Deploy Firebase Infrastructure

### 4.1 Install Dependencies Locally (for testing)
```bash
# Frontend
cd frontend
npm install

# Backend Functions
cd ../backend/functions
npm install

# Test local build
cd ../../frontend
npm run build
```

### 4.2 Deploy Firestore Rules & Indexes
```bash
# From project root
firebase deploy --only firestore:rules,firestore:indexes
```

### 4.3 Deploy Storage Rules
```bash
firebase deploy --only storage
```

### 4.4 Deploy Cloud Functions
```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function groups
firebase deploy --only functions:auth,functions:applications,functions:interviews
```

---

## Step 5: Deploy Frontend to App Hosting

### 5.1 Connect GitHub Repository

```bash
# Initialize App Hosting
firebase apphosting:backends:create

# Follow the prompts:
# - Select your GitHub repository
# - Choose branch (main or production)
# - Confirm backend name (e.g., "persona-recruit-frontend")
```

### 5.2 Deploy

```bash
# Deploy from GitHub
firebase deploy --only apphosting

# Or trigger from Firebase Console:
# Go to Firebase Console → App Hosting → Click "Deploy"
```

### 5.3 Monitor Deployment

```bash
# Check deployment status
firebase apphosting:backends:list

# View logs
firebase apphosting:logs --backend=persona-recruit-frontend
```

---

## Step 6: Post-Deployment Configuration

### 6.1 Create First Admin User

1. Go to your deployed app URL
2. Sign up using company wizard
3. Go to Firebase Console → Firestore
4. Find the user document in `users` collection
5. Edit document:
   ```json
   {
     "role": "platform_admin"
   }
   ```
6. Set custom claim (optional, for immediate access):
   ```bash
   # Use Firebase CLI or Admin SDK
   firebase auth:set-custom-claims USER_UID --claims '{"role":"platform_admin"}'
   ```

### 6.2 Configure SendGrid

1. Create SendGrid account: https://sendgrid.com
2. Verify sender domain
3. Get API key
4. Add to Secret Manager (done in Step 2)
5. Create email templates in SendGrid (optional)

### 6.3 Configure Stripe (if using subscriptions)

1. Create Stripe account: https://stripe.com
2. Create products and prices
3. Get API keys (test and live)
4. Configure webhook:
   - URL: `https://your-domain.web.app/api/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.payment_*`
5. Add webhook secret to Secret Manager

---

## Step 7: Testing

### 7.1 Test Critical Flows

- [ ] **User Signup**
  - Candidate signup wizard
  - Company signup wizard
  - Email verification (if enabled)

- [ ] **Job Posting**
  - Create job as recruiter
  - Verify appears on public career page
  - Test AI job description generator

- [ ] **Application Submission**
  - Apply to job as candidate
  - Upload resume (PDF)
  - Verify email confirmation sent
  - Check Firestore for application document

- [ ] **AI Processing**
  - Verify resume parsed correctly
  - Check match score generated
  - Review AI summary and recommendations

- [ ] **Interview Scheduling**
  - Schedule AI interview
  - Verify calendar invite sent
  - Test interview session (if ready)

- [ ] **Email Notifications**
  - Application confirmation
  - Interview invitation
  - Status updates

### 7.2 Monitor Logs

```bash
# App Hosting logs
firebase apphosting:logs --backend=persona-recruit-frontend

# Cloud Functions logs
firebase functions:log

# Or in Firebase Console:
# Functions → Logs
# App Hosting → Logs
```

---

## Step 8: Domain Setup (Optional)

### 8.1 Add Custom Domain

```bash
# Add custom domain via Firebase Console
# Go to App Hosting → Your backend → "Add custom domain"

# Or use CLI
firebase apphosting:domains:create your-domain.com --backend=persona-recruit-frontend
```

### 8.2 SSL Certificate
Firebase automatically provisions SSL certificates for custom domains (usually takes 24-48 hours).

---

## Troubleshooting

### Secret Access Denied

**Error**: `Permission denied on secret`

**Solution**:
```bash
# Re-run IAM policy binding
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:service-PROJECT_NUMBER@gcp-sa-firebaseapphosting.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Build Fails

**Error**: `npm install failed`

**Solution**:
- Check `package.json` for missing dependencies
- Verify Node.js version in `apphosting.yaml` matches `package.json`
- Check build logs: `firebase apphosting:logs`

### Functions Not Deploying

**Error**: `Deployment failed`

**Solution**:
```bash
# Check for TypeScript errors
cd backend/functions
npm run build

# Deploy individual function
firebase deploy --only functions:functionName
```

### Email Not Sending

**Error**: Emails not received

**Solution**:
- Verify SendGrid API key in Secret Manager
- Check SendGrid sender verification
- Review function logs for errors
- Test with SendGrid API directly

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Review error logs
- [ ] Check failed function invocations
- [ ] Monitor API quotas (Gemini, Vertex AI)

### Weekly Tasks
- [ ] Review user feedback/bug reports
- [ ] Check database usage and costs
- [ ] Update dependencies if needed

### Monthly Tasks
- [ ] Review and optimize Firestore indexes
- [ ] Analyze Cloud Functions performance
- [ ] Review secret rotation needs
- [ ] Backup Firestore data

---

## Cost Optimization

### App Hosting
- Set `minInstances: 0` to scale to zero when idle
- Adjust `maxInstances` based on traffic
- Monitor CPU/memory usage

### Cloud Functions
- Increase memory only if needed
- Use timeouts to prevent runaway functions
- Monitor cold start times

### Firestore
- Optimize queries with proper indexes
- Use batch operations when possible
- Archive old data

### Storage
- Set lifecycle policies to delete old files
- Compress images before upload
- Use CDN for static assets

---

## Security Checklist

- [ ] All secrets stored in Secret Manager
- [ ] No `.env` files committed to GitHub
- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] CORS configured properly
- [ ] Rate limiting enabled on API routes
- [ ] Firebase App Check enabled (recommended)
- [ ] CSP headers configured
- [ ] Regular security audits

---

## Rollback Procedure

### Rollback Frontend
```bash
# List previous deployments
firebase apphosting:rollouts:list --backend=persona-recruit-frontend

# Rollback to previous version
firebase apphosting:rollbacks:create --backend=persona-recruit-frontend --rollout=ROLLOUT_ID
```

### Rollback Functions
```bash
# Firebase automatically keeps previous versions
# Redeploy from previous Git commit
git checkout PREVIOUS_COMMIT_SHA
firebase deploy --only functions
```

---

## Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs/app-hosting
- **Google Cloud Secret Manager**: https://cloud.google.com/secret-manager/docs
- **Firebase Support**: https://firebase.google.com/support
- **Status Page**: https://status.firebase.google.com

---

## Quick Reference Commands

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only apphosting
firebase deploy --only functions
firebase deploy --only firestore
firebase deploy --only storage

# View logs
firebase apphosting:logs
firebase functions:log

# List backends
firebase apphosting:backends:list

# Check build status
firebase apphosting:builds:list --backend=YOUR_BACKEND

# Update secret
echo "NEW_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-
```

---

**You're all set! 🎉**

Your Persona Recruit AI application is now deployed on Firebase App Hosting with secure secret management via Google Cloud Secret Manager.
