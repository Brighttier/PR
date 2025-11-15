/**
 * Firebase Admin SDK initialization
 * Used for server-side operations in API routes
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if we have the service account credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
      // Initialize with service account JSON
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Initialize with default credentials (for Cloud Functions/App Engine)
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    // Initialize with minimal config to prevent crashes
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const fieldValue = admin.firestore.FieldValue;

export default admin;
