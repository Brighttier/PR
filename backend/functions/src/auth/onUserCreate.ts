/**
 * Cloud Function: onUserCreate
 * Triggered when a new user is created in Firebase Auth
 * Creates user profile document in Firestore
 */

import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user;

    // Create user profile document
    await firestore().collection('users').doc(uid).set({
      uid,
      email: email || '',
      displayName: displayName || '',
      photoURL: photoURL || null,
      role: 'candidate', // Default role
      companyId: null,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      lastLogin: firestore.FieldValue.serverTimestamp(),
      emailVerified: user.emailVerified || false,
      isActive: true,
    });

    console.log(`User profile created for ${uid}`);

    // Set custom claims (will be updated when role is assigned)
    await user.customClaims?.();

    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create user profile');
  }
});
