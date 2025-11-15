/**
 * Type definitions for NextAuth
 * Extends default NextAuth types with custom fields
 */

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      uid: string;
      email: string;
      name?: string;
      role: string;
      companyId?: string | null;
    };
  }

  interface User {
    uid: string;
    email: string;
    name?: string;
    role: string;
    companyId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: string;
    companyId?: string | null;
  }
}
