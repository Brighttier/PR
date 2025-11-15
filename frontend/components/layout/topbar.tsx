"use client";

import GlobalSearch, { SearchResult } from "./global-search";
import NotificationBell, { Notification } from "./notifications";
import UserNav from "./user-nav";
import MobileNav from "./mobile-nav";
import { NavItem } from "./base-sidebar";

interface TopBarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  role?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  notifications?: Notification[];
  onSearch?: (query: string) => Promise<SearchResult[]>;
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onLogout?: () => void;
  // Mobile nav props
  companyName?: string;
  companyLogo?: string;
  portalName?: string;
  navItems?: NavItem[];
  theme?: "default" | "red";
}

export default function TopBar({
  user,
  role,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  notifications = [],
  onSearch,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onLogout,
  companyName,
  companyLogo,
  portalName,
  navItems,
  theme,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Mobile Navigation */}
        {navItems && portalName && (
          <MobileNav
            companyName={companyName}
            companyLogo={companyLogo}
            portalName={portalName}
            navItems={navItems}
            user={user}
            theme={theme}
            onLogout={onLogout}
          />
        )}

        {/* Search - Takes up remaining space on larger screens */}
        {showSearch && (
          <div className="flex-1 max-w-md hidden sm:block">
            <GlobalSearch onSearch={onSearch} />
          </div>
        )}

        {/* Spacer - Push right-side items to the end */}
        <div className="flex-1" />

        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          {showNotifications && (
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onMarkAllAsRead={onMarkAllNotificationsAsRead}
            />
          )}

          {/* User Menu */}
          {showUserMenu && (
            <UserNav user={user} role={role} onLogout={onLogout} />
          )}
        </div>
      </div>
    </header>
  );
}
