"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = auth !== null && db !== null;

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db!, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: userData.displayName,
            role: userData.role,
            companyId: userData.companyId || null,
            photoURL: userData.photoURL,
            createdAt: userData.createdAt?.toDate(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    if (!auth || !db) throw new Error('Firebase not configured');

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName: userData.displayName,
      role: userData.role || 'candidate',
      companyId: userData.companyId || null,
      photoURL: userData.photoURL || null,
      createdAt: new Date(),
    });
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase not configured');
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase not configured');
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
