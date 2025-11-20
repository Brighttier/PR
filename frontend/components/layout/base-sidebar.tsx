"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LucideIcon, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LogOut } from "lucide-react";

export interface NavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
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
        {navItems.map((item, index) => {
          const Icon = item.icon;

          // Handle items with children (collapsible sections)
          if (item.children && item.children.length > 0) {
            const hasActiveChild = item.children.some(
              (child) => child.href && isActive(child.href)
            );

            return (
              <Collapsible key={`${item.label}-${index}`} defaultOpen={hasActiveChild}>
                <CollapsibleTrigger className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground group">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1">
                  <div className="space-y-1 ml-4 pl-4 border-l-2 border-muted">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = child.href ? isActive(child.href) : false;

                      return (
                        <Link
                          key={child.href}
                          href={child.href!}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            childActive
                              ? `${colors.bg} ${colors.text}`
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <ChildIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium flex-1">{child.label}</span>
                          {child.badge !== undefined && (
                            <Badge
                              variant={childActive ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {child.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          }

          // Handle regular items without children
          const active = item.href ? isActive(item.href) : false;

          return (
            <Link
              key={item.href || `${item.label}-${index}`}
              href={item.href!}
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
