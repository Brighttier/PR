"use client";

import { User, Settings, HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserNavProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  role?: string;
  onLogout?: () => void;
}

export default function UserNav({ user, role, onLogout }: UserNavProps) {
  const getUserInitials = () => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine profile link based on role
  const getProfileLink = () => {
    if (!role) return "/profile";

    switch (role) {
      case "candidate":
        return "/candidate/profile";
      case "recruiter":
        return "/recruiter/settings";
      case "interviewer":
        return "/interviewer/settings";
      case "hr_admin":
      case "company_admin":
        return "/company-admin/settings";
      case "platform_admin":
        return "/platform-admin/settings";
      default:
        return "/profile";
    }
  };

  const getSettingsLink = () => {
    if (!role) return "/settings";

    switch (role) {
      case "candidate":
        return "/candidate/settings";
      case "recruiter":
        return "/recruiter/settings";
      case "interviewer":
        return "/interviewer/settings";
      case "hr_admin":
      case "company_admin":
        return "/company-admin/settings";
      case "platform_admin":
        return "/platform-admin/settings";
      default:
        return "/settings";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={getProfileLink()} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={getSettingsLink()} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help" className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onLogout && (
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
