"use client";

import { usePathname } from "next/navigation";
import {
  Building2,
  BarChart3,
  Briefcase,
  FileText,
  Users,
  Folder,
  Calendar,
  Settings,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: any;
}

export function RecruiterSidebar() {
  const pathname = usePathname();

  const navLinks: NavLink[] = [
    {
      href: "/recruiter/dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      href: "/recruiter/jobs",
      label: "Jobs",
      icon: Briefcase,
    },
    {
      href: "/recruiter/applications",
      label: "Applications",
      icon: FileText,
    },
    {
      href: "/recruiter/candidates",
      label: "Candidates",
      icon: Users,
    },
    {
      href: "/recruiter/talent-pool",
      label: "Talent Pool",
      icon: Folder,
    },
    {
      href: "/recruiter/calendar",
      label: "Calendar",
      icon: Calendar,
    },
    {
      href: "/recruiter/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/recruiter/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Recruiter Portal</h2>
            <p className="text-xs text-muted-foreground">TechCorp Inc.</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          return (
            <a
              key={link.href}
              href={link.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{link.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
