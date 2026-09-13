"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/FormField";
import { formatDate } from "@/lib/utils";
import { Plus, Search, CalendarDays, Edit2, Trash2, Users, Share2 } from "lucide-react";
import Link from "next/link";
import { ShareModal } from "@/components/programmes/ShareModal";

interface Programme {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  description: string | null;
  _count: { attendance: number };
}

interface ProgrammeForm {
  title: string;
  description: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  notes: string;
}

const emptyForm: ProgrammeForm = {
  title: "",
  description: "",
  type: "SERVICE",
  date: new Date().toISOString().split("T")[0],
  startTime: "",
  endTime: "",
  venue: "",
  notes: "",
};

const typeColors: Record<string, string> = {
  SERVICE: "info",
  MEETING: "secondary",
  EVENT: "default",
  SPECIAL: "warning",
};

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProg, setEditProg] = useState<Programme | null>(null);
  const [form, setForm] = useState<ProgrammeForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<{ id: string; title: string } | null>(null);

  const fetchProgrammes = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/programmes?${params}`);
    const data = await res.json();
    setProgrammes(data);
  }, [search, typeFilter]);

  useEffect(() => { fetchProgrammes(); }, [fetchProgrammes]);

  const openCreate = () => {
    setEditProg(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Programme) => {
    setEditProg(p);
    setForm({
      title: p.title,
      description: p.description || "",
      type: p.type,
      date: p.date.split("T")[0],
      startTime: p.startTime || "",
      endTime: p.endTime || "",
      venue: p.venue || "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setLoading(true);
    try {
      const url = editProg ? `/api/programmes/${editProg.id}` : "/api/programmes";
      const method = editProg ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setShowModal(false);
      fetchProgrammes();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/programmes/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchProgrammes();
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Programmes"
        description="Manage church services, events, and meetings"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Programme
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programmes..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Types</option>
          <option value="SERVICE">Service</option>
          <option value="MEETING">Meeting</option>
          <option value="EVENT">Event</option>
          <option value="SPECIAL">Special</option>
        </select>
      </div>

      {programmes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
          <CalendarDays className="w-10 h-10 mb-3 opacity-40" />
          <p className="font-medium">No programmes found</p>
          <p className="text-sm mt-1">Create your first programme</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programmes.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge variant={statusBadge(p.type) as "info" | "secondary" | "default" | "warning"}>
                  {p.type}
                </Badge>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShareTarget({ id: p.id, title: p.title })}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Share check-in link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900 mb-1">{p.title}</h3>
              {p.description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{p.description}</p>
              )}

              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDate(p.date)}
                  {p.startTime && ` · ${p.startTime}${p.endTime ? ` – ${p.endTime}` : ""}`}
                </div>
                {p.venue && (
                  <div className="flex items-center gap-1.5">
                    📍 {p.venue}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {p._count.attendance} attendance record{p._count.attendance !== 1 ? "s" : ""}
                </div>
              </div>

              <Link
                href={`/programmes/${p.id}`}
                className="mt-4 flex items-center justify-center w-full border border-slate-200 rounded-lg py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                View Attendance →
              </Link>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editProg ? "Edit Programme" : "New Programme"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
              placeholder="Sunday Service"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className={selectClass}
              >
                <option value="SERVICE">Service</option>
                <option value="MEETING">Meeting</option>
                <option value="EVENT">Event</option>
                <option value="SPECIAL">Special</option>
              </select>
            </FormField>
            <FormField label="Date" required>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClass}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Time">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className={inputClass}
              />
            </FormField>
            <FormField label="End Time">
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="Venue">
            <input
              value={form.venue}
              onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
              className={inputClass}
              placeholder="Main Auditorium"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={textareaClass}
              rows={3}
              placeholder="Programme description..."
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : editProg ? "Update Programme" : "Create Programme"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Programme" size="sm">
        <p className="text-slate-600 mb-6">Delete this programme? All attendance records will also be deleted.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
        </div>
      </Modal>

      <ShareModal
        open={!!shareTarget}
        onClose={() => setShareTarget(null)}
        programme={shareTarget}
      />
    </div>
  );
}
