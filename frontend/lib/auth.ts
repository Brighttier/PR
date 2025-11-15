/**
 * NextAuth configuration
 * Handles authentication for API routes
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { auth as firebaseAuth } from './firebase-admin';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        idToken: { label: 'ID Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          return null;
        }

        try {
          // Verify the Firebase ID token
          const decodedToken = await firebaseAuth.verifyIdToken(credentials.idToken);

          // Return user object
          return {
            id: decodedToken.uid,
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            name: decodedToken.name || decodedToken.email || '',
            role: decodedToken.role || 'candidate',
            companyId: decodedToken.companyId || null,
          };
        } catch (error) {
          console.error('Error verifying Firebase ID token:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.uid;
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.uid = token.uid as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
