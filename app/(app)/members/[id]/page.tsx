"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, Edit2, PhoneCall, Home, MessageSquare, Users, MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { MemberForm, MemberFormData } from "@/components/members/MemberForm";

interface FollowUpRecord {
  id: string;
  type: string;
  subject: string;
  notes: string | null;
  feedback: string | null;
  outcome: string | null;
  status: string;
  scheduledDate: string | null;
  completedDate: string | null;
  assignedTo: string | null;
  createdAt: string;
}

interface MemberDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  occupation: string | null;
  maritalStatus: string | null;
  membershipDate: string | null;
  membershipStatus: string;
  notes: string | null;
  createdAt: string;
  attendance: Array<{
    id: string;
    checkInTime: string;
    programme: { title: string; type: string; date: string };
  }>;
}

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/members/${id}`)
      .then((r) => r.json())
      .then(setMember);
    fetch(`/api/followups?memberId=${id}`)
      .then((r) => r.json())
      .then(setFollowUps);
  }, [id]);

  const handleUpdate = async (data: MemberFormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setMember((prev) => ({ ...prev!, ...updated }));
      setShowEdit(false);
    } finally {
      setLoading(false);
    }
  };

  if (!member) {
    return (
      <div className="p-6 text-slate-400 animate-pulse">Loading...</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Members
      </button>

      <PageHeader
        title={`${member.firstName} ${member.lastName}`}
        description={`Member since ${formatDate(member.membershipDate || member.createdAt)}`}
        action={
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold mb-4">
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <h2 className="font-bold text-slate-900 text-lg">
            {member.firstName} {member.lastName}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">{member.occupation || "—"}</p>
          <div className="mt-3">
            <Badge variant={statusBadge(member.membershipStatus)}>
              {member.membershipStatus}
            </Badge>
          </div>
          {member.gender && (
            <p className="text-sm text-slate-500 mt-3">{member.gender} · {member.maritalStatus || "—"}</p>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Details</h3>
          <div className="space-y-3">
            {[
              { icon: Mail, label: "Email", value: member.email },
              { icon: Phone, label: "Phone", value: member.phone },
              { icon: MapPin, label: "Address", value: [member.address, member.city].filter(Boolean).join(", ") },
              { icon: Briefcase, label: "Occupation", value: member.occupation },
              { icon: Calendar, label: "Date of Birth", value: formatDate(member.dateOfBirth) },
              { icon: Calendar, label: "Membership Date", value: formatDate(member.membershipDate) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm text-slate-900">{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>

          {member.notes && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Notes</p>
              <p className="text-sm text-slate-700">{member.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">
          Attendance History ({member.attendance.length})
        </h3>
        {member.attendance.length === 0 ? (
          <p className="text-sm text-slate-400">No attendance records yet</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {member.attendance.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{a.programme.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(a.programme.date)}</p>
                </div>
                <div className="text-right">
                  <Badge variant={statusBadge(a.programme.type)}>
                    {a.programme.type}
                  </Badge>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Checked in {formatDateTime(a.checkInTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow-up History */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-slate-500" />
            Follow-up History ({followUps.length})
          </h3>
          <a href="/followups" className="text-xs text-blue-600 hover:underline">
            Manage follow-ups →
          </a>
        </div>
        {followUps.length === 0 ? (
          <p className="text-sm text-slate-400">No follow-ups recorded for this member</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {followUps.map((f) => {
              const typeIconMap: Record<string, React.ElementType> = {
                CALL: PhoneCall, VISIT: Home, TEXT: MessageSquare, IN_PERSON: Users, OTHER: MessageCircle,
              };
              const TypeIcon = typeIconMap[f.type] ?? MessageCircle;
              const statusColorMap: Record<string, string> = {
                SCHEDULED: "bg-blue-100 text-blue-700",
                COMPLETED: "bg-green-100 text-green-700",
                NEEDS_FOLLOWUP: "bg-amber-100 text-amber-700",
                NO_RESPONSE: "bg-slate-100 text-slate-600",
                CANCELLED: "bg-red-100 text-red-600",
              };
              const outcomeLabel: Record<string, string> = {
                POSITIVE: "✅ Positive", NEUTRAL: "➡️ Neutral",
                NEGATIVE: "⚠️ Negative", NO_RESPONSE: "📵 No Response",
              };
              return (
                <div key={f.id} className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <TypeIcon className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{f.subject}</p>
                      <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColorMap[f.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {f.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      {f.assignedTo && <span>→ {f.assignedTo}</span>}
                      {f.scheduledDate && <span>📅 {formatDate(f.scheduledDate)}</span>}
                      {f.outcome && <span className="font-medium">{outcomeLabel[f.outcome]}</span>}
                    </div>
                    {f.feedback && (
                      <p className="text-xs text-slate-500 mt-1 italic">"{f.feedback}"</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Member" size="lg">
        <MemberForm
          defaultValues={{
            ...member,
            dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split("T")[0] : undefined,
            membershipDate: member.membershipDate ? member.membershipDate.split("T")[0] : undefined,
          }}
          onSubmit={handleUpdate}
          loading={loading}
        />
      </Modal>
    </div>
  );
}
