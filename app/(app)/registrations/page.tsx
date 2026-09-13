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
    const data = await res.json();
    setRegistrations(data);
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const handleStatus = async (id: string, status: string) => {
    await fetch(`/api/registrations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchRegistrations();
    if (viewReg?.id === id) setViewReg((r) => r ? { ...r, status } : null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/registrations/${id}`, { method: "DELETE" });
    setViewReg(null);
    fetchRegistrations();
  };

  const filtered = statusFilter
    ? registrations.filter((r) => r.status === statusFilter)
    : registrations;

  const counts = {
    PENDING: registrations.filter((r) => r.status === "PENDING").length,
    APPROVED: registrations.filter((r) => r.status === "APPROVED").length,
    DECLINED: registrations.filter((r) => r.status === "DECLINED").length,
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Registrations"
        description="Review and process new member registration requests"
      />

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {([["", "All"], ["PENDING", "Pending"], ["APPROVED", "Approved"], ["DECLINED", "Declined"]] as [string, string][]).map(
          ([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === val
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
              {val && (
                <span className="ml-1.5 text-xs opacity-80">
                  ({counts[val as keyof typeof counts] ?? 0})
                </span>
              )}
            </button>
          )
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
            <p className="font-medium">No registrations</p>
          </div>
        ) : (
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
                        <span className="font-medium text-slate-900">
                          {r.firstName} {r.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div>{r.email || "—"}</div>
                      <div className="text-xs">{r.phone || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{r.gender || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge(r.status)}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewReg(r)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {r.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatus(r.id, "APPROVED")}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatus(r.id, "DECLINED")}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Decline"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Registration Modal */}
      <Modal
        open={!!viewReg}
        onClose={() => setViewReg(null)}
        title="Registration Details"
        size="lg"
      >
        {viewReg && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                  {viewReg.firstName[0]}{viewReg.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {viewReg.firstName} {viewReg.lastName}
                  </h3>
                  <Badge variant={statusBadge(viewReg.status)}>{viewReg.status}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Email", viewReg.email],
                ["Phone", viewReg.phone],
                ["Gender", viewReg.gender],
                ["Date of Birth", formatDate(viewReg.dateOfBirth)],
                ["Marital Status", viewReg.maritalStatus],
                ["Occupation", viewReg.occupation],
                ["Address", viewReg.address],
                ["City", viewReg.city],
                ["How Did They Hear", viewReg.howDidYouHear],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-slate-900">{val || "—"}</p>
                </div>
              ))}
            </div>

            {viewReg.prayerRequest && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Prayer Request</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{viewReg.prayerRequest}</p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => handleDelete(viewReg.id)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Delete
              </button>
              <div className="flex gap-2">
                {viewReg.status !== "DECLINED" && (
                  <button
                    onClick={() => handleStatus(viewReg.id, "DECLINED")}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50"
                  >
                    Decline
                  </button>
                )}
                {viewReg.status !== "APPROVED" && (
                  <button
                    onClick={() => handleStatus(viewReg.id, "APPROVED")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
