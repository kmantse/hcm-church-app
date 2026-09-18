"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import {
  Users,
  UserPlus,
  CalendarDays,
  QrCode,
  ClipboardList,
  TrendingUp,
  Share2,
  Copy,
  CheckCircle,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalMembers: number;
  activeMembers: number;
  totalVisitors: number;
  visitorsToday: number;
  totalProgrammes: number;
  upcomingProgrammes: number;
  pendingRegistrations: number;
  checkInsToday: number;
  pendingFollowUps: number;
  recentAttendance: Array<{
    id: string;
    checkInTime: string;
    attendeeType: string;
    programme: { title: string; date: string };
    member: { firstName: string; lastName: string } | null;
    visitor: { firstName: string; lastName: string } | null;
  }>;
  recentMembers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    membershipStatus: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyLink = (key: string, url: string) => {
    navigator.clipboard.writeText(window.location.origin + url).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-slate-400 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back — ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={data.totalMembers}
          icon={Users}
          color="blue"
          subtitle={`${data.activeMembers} active`}
        />
        <StatCard
          title="Visitors"
          value={data.totalVisitors}
          icon={UserPlus}
          color="green"
          subtitle={`${data.visitorsToday} today`}
        />
        <StatCard
          title="Programmes"
          value={data.totalProgrammes}
          icon={CalendarDays}
          color="purple"
          subtitle={`${data.upcomingProgrammes} upcoming`}
        />
        <StatCard
          title="Check-ins Today"
          value={data.checkInsToday}
          icon={QrCode}
          color="orange"
          subtitle={`${data.pendingRegistrations} pending registrations`}
        />
        <StatCard
          title="Pending Follow-ups"
          value={data.pendingFollowUps}
          icon={PhoneCall}
          color="red"
          subtitle="scheduled or needs follow-up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Check-ins */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-900">Recent Attendance</h2>
            </div>
            <Link href="/checkin" className="text-xs text-blue-600 hover:underline">
              View check-in →
            </Link>
          </div>

          {data.recentAttendance.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No attendance recorded this month</p>
          ) : (
            <div className="space-y-3">
              {data.recentAttendance.map((a) => {
                const name = a.member
                  ? `${a.member.firstName} ${a.member.lastName}`
                  : a.visitor
                  ? `${a.visitor.firstName} ${a.visitor.lastName}`
                  : "Unknown";
                return (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">{a.programme.title}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusBadge(a.attendeeType)}>
                        {a.attendeeType}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateTime(a.checkInTime)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Members */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-900">New Members</h2>
            </div>
            <Link href="/members" className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          {data.recentMembers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No members yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                      {m.firstName[0]}{m.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{formatDateTime(m.createdAt)}</p>
                    </div>
                  </div>
                  <Badge variant={statusBadge(m.membershipStatus)}>
                    {m.membershipStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/members?action=new", label: "Add Member", icon: Users, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
            { href: "/visitors?action=new", label: "Register Visitor", icon: UserPlus, color: "bg-green-50 text-green-700 hover:bg-green-100" },
            { href: "/checkin", label: "Check-in", icon: QrCode, color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
            { href: "/registrations", label: "Registrations", icon: ClipboardList, color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl transition-colors ${color}`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Shareable Public Links */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-4 h-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Public Shareable Links</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Share these links with members and visitors — no login required.
        </p>
        <div className="space-y-3">
          {[
            {
              key: "register",
              label: "New Member Registration",
              description: "For first-time visitors to register with the church",
              url: "/register",
              color: "bg-green-50 border-green-200 text-green-800",
              badge: "bg-green-100 text-green-700",
            },
            {
              key: "programmes",
              label: "Self Check-in (via Programmes)",
              description: "Go to Programmes → click the share icon on any programme to get a per-service QR code",
              url: "/programmes",
              color: "bg-blue-50 border-blue-200 text-blue-800",
              badge: "bg-blue-100 text-blue-700",
            },
          ].map(({ key, label, description, url, color, badge }) => (
            <div key={key} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-xl border p-4 ${color}`}>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs opacity-75 mt-0.5">{description}</p>
                <span className={`inline-block text-xs font-mono px-2 py-0.5 rounded mt-1.5 ${badge}`}>
                  {typeof window !== "undefined" ? window.location.origin : ""}{url}
                </span>
              </div>
              <div className="flex gap-2 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => copyLink(key, url)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-current/20 rounded-lg text-xs font-medium hover:bg-white/80 transition-colors opacity-80"
                >
                  {copiedKey === key ? (
                    <><CheckCircle className="w-3.5 h-3.5" /> Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy</>
                  )}
                </button>
                <Link
                  href={url}
                  target={key === "register" ? "_blank" : undefined}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-current/20 rounded-lg text-xs font-medium hover:bg-white/80 transition-colors opacity-80"
                >
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
