"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';

interface MockAuthContextType {
  mockUser: User | null;
  setMockRole: (role: UserRole) => void;
  clearMockUser: () => void;
}

const MockAuthContext = createContext<MockAuthContextType>({} as MockAuthContextType);

export function useMockAuth() {
  return useContext(MockAuthContext);
}

const MOCK_USERS: Record<UserRole, User> = {
  candidate: {
    uid: 'mock-candidate-1',
    email: 'candidate@example.com',
    displayName: 'John Candidate',
    role: 'candidate',
    companyId: null,
    photoURL: undefined,
    createdAt: new Date(),
  },
  recruiter: {
    uid: 'mock-recruiter-1',
    email: 'recruiter@example.com',
    displayName: 'Sarah Recruiter',
    role: 'recruiter',
    companyId: 'company-1',
    photoURL: undefined,
    createdAt: new Date(),
  },
  interviewer: {
    uid: 'mock-interviewer-1',
    email: 'interviewer@example.com',
    displayName: 'Mike Interviewer',
    role: 'interviewer',
    companyId: 'company-1',
    photoURL: undefined,
    createdAt: new Date(),
  },
  hr_admin: {
    uid: 'mock-hr-admin-1',
    email: 'hradmin@example.com',
    displayName: 'Lisa HR Admin',
    role: 'hr_admin',
    companyId: 'company-1',
    photoURL: undefined,
    createdAt: new Date(),
  },
  platform_admin: {
    uid: 'mock-platform-admin-1',
    email: 'admin@persona-recruit.com',
    displayName: 'Platform Admin',
    role: 'platform_admin',
    companyId: null,
    photoURL: undefined,
    createdAt: new Date(),
  },
};

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [mockUser, setMockUser] = useState<User | null>(null);

  // Load mock user from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('mockUserRole') as UserRole;
    if (savedRole && MOCK_USERS[savedRole]) {
      setMockUser(MOCK_USERS[savedRole]);
    }
  }, []);

  const setMockRole = (role: UserRole) => {
    const user = MOCK_USERS[role];
    setMockUser(user);
    localStorage.setItem('mockUserRole', role);
  };

  const clearMockUser = () => {
    setMockUser(null);
    localStorage.removeItem('mockUserRole');
  };

  return (
    <MockAuthContext.Provider value={{ mockUser, setMockRole, clearMockUser }}>
      {children}
    </MockAuthContext.Provider>
  );
}
