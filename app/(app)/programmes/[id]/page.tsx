"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ArrowLeft, Users, Clock } from "lucide-react";

interface ProgrammeDetail {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  description: string | null;
  attendance: Array<{
    id: string;
    checkInTime: string;
    attendeeType: string;
    member: { id: string; firstName: string; lastName: string } | null;
    visitor: { id: string; firstName: string; lastName: string } | null;
  }>;
  _count: { attendance: number };
}

export default function ProgrammeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [programme, setProgramme] = useState<ProgrammeDetail | null>(null);

  useEffect(() => {
    fetch(`/api/programmes/${id}`)
      .then((r) => r.json())
      .then(setProgramme);
  }, [id]);

  if (!programme) {
    return <div className="p-6 text-slate-400 animate-pulse">Loading...</div>;
  }

  const members = programme.attendance.filter((a) => a.attendeeType === "MEMBER");
  const visitors = programme.attendance.filter((a) => a.attendeeType === "VISITOR");

  return (
    <div className="p-6 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Programmes
      </button>

      <PageHeader
        title={programme.title}
        description={`${formatDate(programme.date)}${programme.startTime ? ` · ${programme.startTime}` : ""}${programme.venue ? ` · ${programme.venue}` : ""}`}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{programme._count.attendance}</p>
          <p className="text-sm text-slate-500 mt-0.5">Total Attendance</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{members.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Members</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{visitors.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Visitors</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Attendance List</h2>
        </div>

        {programme.attendance.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No attendance recorded for this programme</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="text-left pb-3 font-semibold text-slate-600">Name</th>
                  <th className="text-left pb-3 font-semibold text-slate-600">Type</th>
                  <th className="text-left pb-3 font-semibold text-slate-600">Check-in Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {programme.attendance.map((a) => {
                  const person = a.member || a.visitor;
                  const name = person ? `${person.firstName} ${person.lastName}` : "Unknown";
                  return (
                    <tr key={a.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            a.attendeeType === "MEMBER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                          }`}>
                            {name[0]}
                          </div>
                          <span className="font-medium text-slate-900">{name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant={statusBadge(a.attendeeType)}>
                          {a.attendeeType}
                        </Badge>
                      </td>
                      <td className="py-3 text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(a.checkInTime)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
