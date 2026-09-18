"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { FollowUpForm, FollowUpFormData } from "@/components/followups/FollowUpForm";
import { FeedbackModal } from "@/components/followups/FeedbackModal";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Phone,
  Home,
  Mail,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MessageCircle,
  Trash2,
  ChevronDown,
  Filter,
} from "lucide-react";

interface FollowUp {
  id: string;
  personType: string;
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
  member: { id: string; firstName: string; lastName: string; phone: string | null; email: string | null } | null;
  visitor: { id: string; firstName: string; lastName: string; phone: string | null; email: string | null } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-700", icon: Clock },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  NEEDS_FOLLOWUP: { label: "Needs Follow-up", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  NO_RESPONSE: { label: "No Response", color: "bg-slate-100 text-slate-600", icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-600", icon: XCircle },
};

const typeIcon: Record<string, React.ElementType> = {
  CALL: Phone,
  VISIT: Home,
  EMAIL: Mail,
  TEXT: MessageSquare,
  IN_PERSON: Users,
  OTHER: MessageCircle,
};

const outcomeColors: Record<string, string> = {
  POSITIVE: "text-green-600",
  NEUTRAL: "text-slate-500",
  NEGATIVE: "text-amber-600",
  NO_RESPONSE: "text-red-400",
};

const outcomeLabels: Record<string, string> = {
  POSITIVE: "✅ Positive",
  NEUTRAL: "➡️ Neutral",
  NEGATIVE: "⚠️ Negative",
  NO_RESPONSE: "📵 No Response",
};

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<FollowUp | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchFollowUps = useCallback(async () => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (statusFilter) p.set("status", statusFilter);
    if (typeFilter) p.set("type", typeFilter);
    const res = await fetch(`/api/followups?${p}`);
    setFollowUps(await res.json());
  }, [search, statusFilter, typeFilter]);

  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

  const handleCreate = async (data: FollowUpFormData) => {
    setCreating(true);
    try {
      await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setShowCreate(false);
      fetchFollowUps();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/followups/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchFollowUps();
  };

  const counts = {
    all: followUps.length,
    SCHEDULED: followUps.filter((f) => f.status === "SCHEDULED").length,
    NEEDS_FOLLOWUP: followUps.filter((f) => f.status === "NEEDS_FOLLOWUP").length,
    COMPLETED: followUps.filter((f) => f.status === "COMPLETED").length,
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Follow-ups"
        description="Track outreach interactions and member feedback"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Follow-up
          </button>
        }
      />

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {([
          ["", "All", counts.all, "bg-slate-100 text-slate-700"],
          ["SCHEDULED", "Scheduled", counts.SCHEDULED, "bg-blue-100 text-blue-700"],
          ["NEEDS_FOLLOWUP", "Needs Follow-up", counts.NEEDS_FOLLOWUP, "bg-amber-100 text-amber-700"],
          ["COMPLETED", "Completed", counts.COMPLETED, "bg-green-100 text-green-700"],
        ] as [string, string, number, string][]).map(([val, label, count, cls]) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === val ? cls + " ring-2 ring-current ring-offset-1" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {label} <span className="ml-1 opacity-75">({count})</span>
          </button>
        ))}
      </div>

      {/* Search & Type filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, subject or assignee…"
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="CALL">Phone Call</option>
            <option value="VISIT">Home Visit</option>
            <option value="EMAIL">Email</option>
            <option value="TEXT">Text / WhatsApp</option>
            <option value="IN_PERSON">In Person</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Follow-up list */}
      {followUps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
          <MessageCircle className="w-10 h-10 mb-3 opacity-40" />
          <p className="font-medium">No follow-ups yet</p>
          <p className="text-sm mt-1">Create your first follow-up to start tracking outreach</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((f) => {
            const person = f.member || f.visitor;
            const personName = person ? `${person.firstName} ${person.lastName}` : "Unknown";
            const StatusIcon = statusConfig[f.status]?.icon ?? Clock;
            const TypeIcon = typeIcon[f.type] ?? MessageCircle;
            const isExpanded = expanded === f.id;

            return (
              <div
                key={f.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Main row */}
                <div className="flex items-start gap-4 p-4">
                  {/* Type icon */}
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <TypeIcon className="w-4 h-4 text-slate-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{f.subject}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            f.personType === "MEMBER" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                          }`}>
                            {personName}
                          </span>
                          {f.assignedTo && (
                            <span className="text-xs text-slate-400">→ {f.assignedTo}</span>
                          )}
                          {f.scheduledDate && (
                            <span className="text-xs text-slate-400">📅 {formatDate(f.scheduledDate)}</span>
                          )}
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusConfig[f.status]?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[f.status]?.label}
                      </span>
                    </div>

                    {/* Outcome row (if logged) */}
                    {f.outcome && (
                      <div className={`mt-2 text-xs font-medium ${outcomeColors[f.outcome]}`}>
                        {outcomeLabels[f.outcome]}
                        {f.completedDate && <span className="text-slate-400 font-normal ml-1">· {formatDate(f.completedDate)}</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-start">
                    {f.status !== "COMPLETED" && f.status !== "CANCELLED" && (
                      <button
                        onClick={() => setFeedbackTarget(f)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                        title="Log feedback"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Log
                      </button>
                    )}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : f.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <button
                      onClick={() => setDeleteId(f.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 bg-slate-50 space-y-3">
                    {/* Contact info */}
                    {person && (person.email || person.phone) && (
                      <div className="flex gap-4 text-xs text-slate-500">
                        {person.phone && (
                          <a href={`tel:${person.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Phone className="w-3 h-3" /> {person.phone}
                          </a>
                        )}
                        {person.email && (
                          <a href={`mailto:${person.email}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Mail className="w-3 h-3" /> {person.email}
                          </a>
                        )}
                      </div>
                    )}

                    {f.notes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-sm text-slate-700 bg-white rounded-lg p-2 border border-slate-100">{f.notes}</p>
                      </div>
                    )}

                    {f.feedback && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Feedback Received</p>
                        <p className="text-sm text-slate-700 bg-white rounded-lg p-2 border border-slate-100">{f.feedback}</p>
                      </div>
                    )}

                    {!f.notes && !f.feedback && (
                      <p className="text-xs text-slate-400 italic">No notes or feedback recorded yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Follow-up" size="lg">
        <FollowUpForm onSubmit={handleCreate} loading={creating} />
      </Modal>

      {/* Feedback/outcome modal */}
      <FeedbackModal
        open={!!feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
        followUp={feedbackTarget}
        onSaved={fetchFollowUps}
      />

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Follow-up" size="sm">
        <p className="text-slate-600 mb-6">Delete this follow-up record? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
