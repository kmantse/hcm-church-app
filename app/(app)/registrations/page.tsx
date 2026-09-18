"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { ClipboardList, Check, X, Eye } from "lucide-react";

interface Registration {
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
  howDidYouHear: string | null;
  prayerRequest: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [viewReg, setViewReg] = useState<Registration | null>(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const fetchRegistrations = async () => {
    const res = await fetch("/api/registrations");
    setRegistrations(await res.json());
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const handleStatus = async (id: string, status: string) => {
    await fetch(`/api/registrations/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchRegistrations();
    if (viewReg?.id === id) setViewReg((r) => r ? { ...r, status } : null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/registrations/${id}`, { method: "DELETE" });
    setViewReg(null);
    fetchRegistrations();
  };

  const filtered = statusFilter ? registrations.filter((r) => r.status === statusFilter) : registrations;
  const counts = {
    PENDING: registrations.filter((r) => r.status === "PENDING").length,
    APPROVED: registrations.filter((r) => r.status === "APPROVED").length,
    DECLINED: registrations.filter((r) => r.status === "DECLINED").length,
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Registrations" description="Review and process new member registration requests" />

      <div className="flex flex-wrap gap-2 mb-5">
        {([["", "All"], ["PENDING", "Pending"], ["APPROVED", "Approved"], ["DECLINED", "Declined"]] as [string, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === val ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {label}{val && <span className="ml-1.5 text-xs opacity-80">({counts[val as keyof typeof counts] ?? 0})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
          <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
          <p className="font-medium">No registrations</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
                      {r.firstName[0]}{r.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{r.firstName} {r.lastName}</p>
                      <p className="text-xs text-slate-500 truncate">{r.email || r.phone || "—"}</p>
                    </div>
                  </div>
                  <Badge variant={statusBadge(r.status)}>{r.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewReg(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                    {r.status === "PENDING" && (
                      <>
                        <button onClick={() => handleStatus(r.id, "APPROVED")} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleStatus(r.id, "DECLINED")} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
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
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Submitted</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">
                            {r.firstName[0]}{r.lastName[0]}
                          </div>
                          <span className="font-medium text-slate-900">{r.firstName} {r.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500"><div>{r.email || "—"}</div><div className="text-xs">{r.phone || ""}</div></td>
                      <td className="px-4 py-3 text-slate-500">{r.gender || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3"><Badge variant={statusBadge(r.status)}>{r.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewReg(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                          {r.status === "PENDING" && (
                            <>
                              <button onClick={() => handleStatus(r.id, "APPROVED")} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><Check className="w-4 h-4" /></button>
                              <button onClick={() => handleStatus(r.id, "DECLINED")} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Decline"><X className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal open={!!viewReg} onClose={() => setViewReg(null)} title="Registration Details" size="lg">
        {viewReg && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold shrink-0">
                {viewReg.firstName[0]}{viewReg.lastName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{viewReg.firstName} {viewReg.lastName}</h3>
                <Badge variant={statusBadge(viewReg.status)}>{viewReg.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                ["Email", viewReg.email], ["Phone", viewReg.phone], ["Gender", viewReg.gender],
                ["Date of Birth", formatDate(viewReg.dateOfBirth)], ["Marital Status", viewReg.maritalStatus],
                ["Occupation", viewReg.occupation], ["Address", viewReg.address], ["City", viewReg.city],
                ["How Did They Hear", viewReg.howDidYouHear],
              ].map(([label, val]) => (
                <div key={label}><p className="text-xs text-slate-400">{label}</p><p className="text-slate-900">{val || "—"}</p></div>
              ))}
            </div>
            {viewReg.prayerRequest && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Prayer Request</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{viewReg.prayerRequest}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => handleDelete(viewReg.id)} className="text-sm text-red-500 hover:text-red-700 text-left">Delete</button>
              <div className="flex gap-2">
                {viewReg.status !== "DECLINED" && (
                  <button onClick={() => handleStatus(viewReg.id, "DECLINED")} className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">Decline</button>
                )}
                {viewReg.status !== "APPROVED" && (
                  <button onClick={() => handleStatus(viewReg.id, "APPROVED")} className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Approve</button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
