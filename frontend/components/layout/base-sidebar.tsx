"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface BaseSidebarProps {
  companyName?: string;
  companyLogo?: string;
  portalName: string;
  navItems: NavItem[];
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  theme?: "default" | "red";
  onLogout?: () => void;
}

export default function BaseSidebar({
  companyName = "Persona Recruit",
  companyLogo,
  portalName,
  navItems,
  user,
  theme = "default",
  onLogout,
}: BaseSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for dashboard pages
    if (href.endsWith("/dashboard") || href === pathname) {
      return pathname === href;
    }
    // Prefix match for other pages
    return pathname.startsWith(href);
  };

  const getUserInitials = () => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const themeColors = {
    default: {
      bg: "bg-primary",
      text: "text-primary-foreground",
      hover: "hover:bg-primary/90",
      border: "border-primary",
    },
    red: {
      bg: "bg-red-600",
      text: "text-white",
      hover: "hover:bg-red-700",
      border: "border-red-600",
    },
  };

  const colors = themeColors[theme];

  return (
    <aside className="hidden md:flex w-64 border-r bg-card flex-col h-screen">
      {/* Company Branding */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className="w-8 h-8 rounded"
            />
          ) : (
            <div
              className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${colors.bg} ${colors.text}`}
            >
              {companyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-base">{companyName}</h2>
            <p className="text-xs text-muted-foreground">{portalName}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? `${colors.bg} ${colors.text}`
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <Badge
                  variant={active ? "secondary" : "outline"}
                  className="ml-auto"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        {onLogout && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
