"use client";

import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  BarChart3,
  Settings,
} from "lucide-react";
import BaseSidebar, { NavItem } from "@/components/layout/base-sidebar";

interface PlatformAdminSidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  companiesCount?: number;
  onLogout?: () => void;
}

export default function PlatformAdminSidebar({
  user,
  companiesCount = 0,
  onLogout,
}: PlatformAdminSidebarProps) {
  const navItems: NavItem[] = [
    {
      href: "/platform-admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/platform-admin/companies",
      label: "Companies",
      icon: Building2,
      badge: companiesCount > 0 ? companiesCount : undefined,
    },
    {
      href: "/platform-admin/users",
      label: "Users",
      icon: Users,
    },
    {
      href: "/platform-admin/system-health",
      label: "System Health",
      icon: Activity,
    },
    {
      href: "/platform-admin/reports",
      label: "Reports",
      icon: BarChart3,
    },
    {
      href: "/platform-admin/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <BaseSidebar
      companyName="Platform Admin"
      portalName="System Control"
      navItems={navItems}
      user={user}
      theme="red"
      onLogout={onLogout}
    />
  );
}
