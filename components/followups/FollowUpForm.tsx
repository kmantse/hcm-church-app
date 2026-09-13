"use client";

import { useState, useEffect } from "react";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/FormField";
import { Search } from "lucide-react";

export interface FollowUpFormData {
  personId: string;
  personType: "MEMBER" | "VISITOR";
  personName: string;
  type: string;
  subject: string;
  notes: string;
  scheduledDate: string;
  assignedTo: string;
  status: string;
}

const empty: FollowUpFormData = {
  personId: "",
  personType: "MEMBER",
  personName: "",
  type: "CALL",
  subject: "",
  notes: "",
  scheduledDate: new Date().toISOString().split("T")[0],
  assignedTo: "",
  status: "SCHEDULED",
};

export function FollowUpForm({
  onSubmit,
  loading,
  prefillPerson,
}: {
  onSubmit: (data: FollowUpFormData) => void;
  loading?: boolean;
  prefillPerson?: { id: string; name: string; type: "MEMBER" | "VISITOR" };
}) {
  const [form, setForm] = useState<FollowUpFormData>({
    ...empty,
    ...(prefillPerson
      ? { personId: prefillPerson.id, personName: prefillPerson.name, personType: prefillPerson.type }
      : {}),
  });
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; type: "MEMBER" | "VISITOR"; sub: string }[]>([]);
  const [searching, setSearching] = useState(false);

  const set = (key: keyof FollowUpFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (prefillPerson) return;
    if (search.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const [mr, vr] = await Promise.all([
        fetch(`/api/members?search=${encodeURIComponent(search)}`),
        fetch(`/api/visitors?search=${encodeURIComponent(search)}`),
      ]);
      const [members, visitors] = await Promise.all([mr.json(), vr.json()]);
      setSearchResults([
        ...members.map((m: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null }) => ({
          id: m.id,
          name: `${m.firstName} ${m.lastName}`,
          type: "MEMBER" as const,
          sub: m.email || m.phone || "Member",
        })),
        ...visitors.map((v: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null }) => ({
          id: v.id,
          name: `${v.firstName} ${v.lastName}`,
          type: "VISITOR" as const,
          sub: v.email || v.phone || "Visitor",
        })),
      ]);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, prefillPerson]);

  const selectPerson = (p: { id: string; name: string; type: "MEMBER" | "VISITOR" }) => {
    setForm((f) => ({ ...f, personId: p.id, personName: p.name, personType: p.type }));
    setSearch("");
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personId || !form.subject) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Person selector */}
      {!prefillPerson && (
        <FormField label="Member / Visitor" required>
          {form.personId ? (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <div>
                <span className="text-sm font-medium text-blue-900">{form.personName}</span>
                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">{form.personType}</span>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, personId: "", personName: "" }))}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search member or visitor by name…"
                  className={`${inputClass} pl-9`}
                />
              </div>
              {searching && <p className="text-xs text-slate-400 mt-1 animate-pulse">Searching…</p>}
              {searchResults.length > 0 && (
                <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 shadow-sm">
                  {searchResults.map((p) => (
                    <button
                      key={`${p.type}-${p.id}`}
                      type="button"
                      onClick={() => selectPerson(p)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 text-left transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        p.type === "MEMBER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.sub} · {p.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </FormField>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Contact Type" required>
          <select value={form.type} onChange={set("type")} className={selectClass}>
            <option value="CALL">📞 Phone Call</option>
            <option value="VISIT">🏠 Home Visit</option>
            <option value="EMAIL">📧 Email</option>
            <option value="TEXT">💬 Text / WhatsApp</option>
            <option value="IN_PERSON">🤝 In Person</option>
            <option value="OTHER">Other</option>
          </select>
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={set("status")} className={selectClass}>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="NEEDS_FOLLOWUP">Needs Follow-up</option>
            <option value="NO_RESPONSE">No Response</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </FormField>
      </div>

      <FormField label="Subject / Purpose" required>
        <input
          value={form.subject}
          onChange={set("subject")}
          className={inputClass}
          placeholder="e.g. Post-service welfare check, Absentee follow-up…"
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Scheduled Date">
          <input type="date" value={form.scheduledDate} onChange={set("scheduledDate")} className={inputClass} />
        </FormField>
        <FormField label="Assigned To">
          <input value={form.assignedTo} onChange={set("assignedTo")} className={inputClass} placeholder="Pastor / Leader name" />
        </FormField>
      </div>

      <FormField label="Notes">
        <textarea
          value={form.notes}
          onChange={set("notes")}
          className={textareaClass}
          rows={3}
          placeholder="What needs to be discussed or context for this follow-up…"
        />
      </FormField>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading || !form.personId}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : "Create Follow-up"}
        </button>
      </div>
    </form>
  );
}
