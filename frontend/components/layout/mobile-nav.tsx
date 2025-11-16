"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavItem } from "./base-sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

interface MobileNavProps {
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

export default function MobileNav({
  companyName = "Persona Recruit",
  companyLogo,
  portalName,
  navItems,
  user,
  theme = "default",
  onLogout,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.endsWith("/dashboard") || href === pathname) {
      return pathname === href;
    }
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
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
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? `${colors.bg} ${colors.text}`
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm flex-1">
                    {item.label}
                  </span>
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
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={user.name} />
                )}
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
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full justify-start gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
