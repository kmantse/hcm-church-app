"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { canAccessRoute, ROLE_COLORS, ROLE_LABELS } from "@/lib/permissions";
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
  Shield,
  LogOut,
  ChevronDown,
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
  { href: "/users", label: "User Management", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const visibleNav = navItems.filter(({ href }) =>
    !user ? false : canAccessRoute(user.role, href)
  );

  const roleColor = user ? (ROLE_COLORS[user.role] ?? "bg-slate-100 text-slate-600") : "";
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : "";

  const NavLinks = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
          <Church className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm leading-tight">Church HCM</div>
          <div className="text-xs text-slate-500">Management System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map(({ href, label, icon: Icon }) => (
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

      {/* User section */}
      {user && (
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded-full ${roleColor}`}>
                {roleLabel}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
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
        <div className="flex items-center gap-2">
          {user && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor}`}>
              {roleLabel}
            </span>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
