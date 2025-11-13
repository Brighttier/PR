"use client";

import { useState } from 'react';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  User,
  Briefcase,
  Video,
  Shield,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

const ROLES = [
  {
    role: 'candidate' as UserRole,
    label: 'Candidate',
    icon: User,
    color: 'bg-blue-500',
    route: '/candidate',
  },
  {
    role: 'recruiter' as UserRole,
    label: 'Recruiter',
    icon: Briefcase,
    color: 'bg-green-500',
    route: '/dashboard',
  },
  {
    role: 'interviewer' as UserRole,
    label: 'Interviewer',
    icon: Video,
    color: 'bg-purple-500',
    route: '/interviewer/dashboard',
  },
  {
    role: 'hr_admin' as UserRole,
    label: 'HR Admin',
    icon: Settings,
    color: 'bg-orange-500',
    route: '/dashboard',
  },
  {
    role: 'platform_admin' as UserRole,
    label: 'Platform Admin',
    icon: Shield,
    color: 'bg-red-500',
    route: '/platform-admin/dashboard',
  },
];

export function RoleSwitcher() {
  const { mockUser, setMockRole, clearMockUser } = useMockAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const currentRole = ROLES.find((r) => r.role === mockUser?.role);

  const handleRoleChange = (role: UserRole, route: string) => {
    setMockRole(role);
    setOpen(false);
    router.push(route);
  };

  const handleClear = () => {
    clearMockUser();
    setOpen(false);
    router.push('/');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 shadow-lg border-2 hover:scale-105 transition-transform">
          {currentRole ? (
            <>
              <currentRole.icon className="w-4 h-4 mr-2" />
              {currentRole.label}
              <ChevronDown className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              <User className="w-4 h-4 mr-2" />
              Select Role
              <ChevronDown className="w-4 h-4 ml-2" />
            </>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end">
          <div className="space-y-1">
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              Switch Role (Demo Mode)
            </div>
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = mockUser?.role === role.role;

              return (
                <button
                  key={role.role}
                  onClick={() => handleRoleChange(role.role, role.route)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${role.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{role.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {role.route}
                    </div>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </button>
              );
            })}
            {mockUser && (
              <>
                <div className="border-t my-1" />
                <button
                  onClick={handleClear}
                  className="w-full px-3 py-2 text-sm text-left text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  Clear Role
                </button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
