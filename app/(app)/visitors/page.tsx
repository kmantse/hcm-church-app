"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/FormField";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Trash2, UserPlus } from "lucide-react";

interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  invitedBy: string | null;
  createdAt: string;
  visits: Array<{ visitDate: string }>;
}

interface VisitorForm {
  firstName: string; lastName: string; email: string; phone: string;
  gender: string; address: string; invitedBy: string; purpose: string;
  notes: string; visitDate: string;
}

const emptyForm: VisitorForm = {
  firstName: "", lastName: "", email: "", phone: "", gender: "",
  address: "", invitedBy: "", purpose: "", notes: "",
  visitDate: new Date().toISOString().split("T")[0],
};

export default function VisitorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<VisitorForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchVisitors = useCallback(async () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/visitors${params}`);
    setVisitors(await res.json());
  }, [search]);

  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setShowModal(true);
      router.replace("/visitors");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) return;
    setLoading(true);
    try {
      await fetch("/api/visitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setShowModal(false);
      setForm(emptyForm);
      fetchVisitors();
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/visitors/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchVisitors();
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Visitors"
        description={`${visitors.length} visitor${visitors.length !== 1 ? "s" : ""} registered`}
        action={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" /> Register Visitor
          </button>
        }
      />

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search visitors..."
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {visitors.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
          <UserPlus className="w-10 h-10 mb-3 opacity-40" />
          <p className="font-medium">No visitors registered</p>
          <p className="text-sm mt-1">Register your first visitor</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {visitors.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                      {v.firstName[0]}{v.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{v.firstName} {v.lastName}</p>
                      <p className="text-xs text-slate-500 truncate">{v.email || v.phone || "—"}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-green-100 text-green-700 rounded-full text-xs font-bold shrink-0">
                    {v.visits.length}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    {v.invitedBy ? `Invited by ${v.invitedBy}` : formatDate(v.createdAt)}
                  </p>
                  <button onClick={() => setDeleteId(v.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Contact</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Gender</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Invited By</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Last Visit</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Visits</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
                            {v.firstName[0]}{v.lastName[0]}
                          </div>
                          <span className="font-medium text-slate-900">{v.firstName} {v.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <div>{v.email || "—"}</div>
                        <div className="text-xs">{v.phone || ""}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{v.gender || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{v.invitedBy || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{v.visits[0] ? formatDate(v.visits[0].visitDate) : formatDate(v.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-green-100 text-green-700 rounded-full text-xs font-bold">{v.visits.length}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setDeleteId(v.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register Visitor" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className={inputClass} placeholder="John" required />
            </FormField>
            <FormField label="Last Name" required>
              <input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className={inputClass} placeholder="Doe" required />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} placeholder="john@example.com" />
            </FormField>
            <FormField label="Phone">
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} placeholder="+233 20 000 0000" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Gender">
              <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className={selectClass}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </FormField>
            <FormField label="Visit Date">
              <input type="date" value={form.visitDate} onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))} className={inputClass} />
            </FormField>
          </div>
          <FormField label="Address">
            <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={inputClass} placeholder="Street address" />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Invited By">
              <input value={form.invitedBy} onChange={(e) => setForm((f) => ({ ...f, invitedBy: e.target.value }))} className={inputClass} placeholder="Member name" />
            </FormField>
            <FormField label="Purpose of Visit">
              <input value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} className={inputClass} placeholder="First visit, prayer, etc." />
            </FormField>
          </div>
          <FormField label="Notes">
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={textareaClass} rows={2} placeholder="Additional notes..." />
          </FormField>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
              {loading ? "Saving..." : "Register Visitor"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" size="sm">
        <p className="text-slate-600 mb-6">Delete this visitor? This cannot be undone.</p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
