"use client";

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role
        switch (user.role) {
          case 'candidate':
            router.push('/candidate');
            break;
          case 'recruiter':
          case 'hr_admin':
            router.push('/dashboard');
            break;
          case 'interviewer':
            router.push('/interviewer/dashboard');
            break;
          case 'platform_admin':
            router.push('/platform-admin/dashboard');
            break;
        }
      }
    }
  }, [user, loading, allowedRoles, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
