"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  QrCode,
  CalendarDays,
  ClipboardList,
  BarChart2,
  Church,
  Menu,
  X,
  PhoneCall,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/visitors", label: "Visitors", icon: UserPlus },
  { href: "/checkin", label: "Check-in", icon: QrCode },
  { href: "/programmes", label: "Programmes", icon: CalendarDays },
  { href: "/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/followups", label: "Follow-ups", icon: PhoneCall },
  { href: "/reports", label: "Reports", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
          <Church className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm leading-tight">Church HCM</div>
          <div className="text-xs text-slate-500">Management System</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "sidebar-link",
              pathname.startsWith(href) ? "active" : "text-slate-600"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full bg-green-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          New Registration
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 min-h-full shrink-0">
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
            <Church className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Church HCM</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-600 hover:text-slate-900"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
          <aside
            className="flex flex-col w-64 bg-white min-h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <NavLinks />
          </aside>
        </div>
      )}
    </>
  );
}
