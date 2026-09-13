"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { FormField, inputClass, selectClass } from "@/components/ui/FormField";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS, ROLES } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import {
  Plus, Shield, Edit2, Trash2, ToggleLeft, ToggleRight,
  Eye, EyeOff, AlertCircle, CheckCircle,
} from "lucide-react";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = { name: "", email: "", password: "", role: "STAFF" };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only admins can access this page
  useEffect(() => {
    if (currentUser && currentUser.role !== "ADMIN") router.replace("/dashboard");
  }, [currentUser, router]);

  const fetchUsers = () =>
    fetch("/api/users").then((r) => r.json()).then(setUsers);

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setShowCreate(true);
  };

  const openEdit = (u: UserRecord) => {
    setEditTarget(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setShowCreate(false);
      fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setError("");
    setLoading(true);
    try {
      const body: Record<string, string> = { name: form.name, email: form.email, role: form.role };
      if (form.password) body.password = form.password;
      const res = await fetch(`/api/users/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setEditTarget(null);
      fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (u: UserRecord) => {
    await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    fetchUsers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchUsers();
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const UserForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name" required>
          <input value={form.name} onChange={set("name")} className={inputClass} placeholder="Pastor John Doe" required />
        </FormField>
        <FormField label="Email Address" required>
          <input type="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="john@church.com" required />
        </FormField>
      </div>

      <FormField label={isEdit ? "New Password (leave blank to keep current)" : "Password"} required={!isEdit}>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            className={`${inputClass} pr-10`}
            placeholder={isEdit ? "Leave blank to keep current" : "Min 8 characters"}
            required={!isEdit}
            minLength={8}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </FormField>

      <FormField label="Role" required>
        <select value={form.role} onChange={set("role")} className={selectClass} required>
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]} — {ROLE_DESCRIPTIONS[r]}</option>
          ))}
        </select>
      </FormField>

      {/* Role preview */}
      <div className={`rounded-lg p-3 text-sm ${ROLE_COLORS[form.role as keyof typeof ROLE_COLORS] ?? "bg-slate-100 text-slate-600"}`}>
        <p className="font-semibold">{ROLE_LABELS[form.role as keyof typeof ROLE_LABELS]}</p>
        <p className="text-xs mt-0.5 opacity-75">{ROLE_DESCRIPTIONS[form.role as keyof typeof ROLE_DESCRIPTIONS]}</p>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button type="button" onClick={() => { setShowCreate(false); setEditTarget(null); }}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="User Management"
        description="Control who can access the system and what they can do"
        action={
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add User
          </button>
        }
      />

      {/* Role legend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {ROLES.map((role) => (
          <div key={role} className="bg-white rounded-xl border border-slate-200 p-4">
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${ROLE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </span>
            <p className="text-xs text-slate-500">{ROLE_DESCRIPTIONS[role]}</p>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              {users.filter((u) => u.role === role && u.isActive).length} active
            </p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">System Users ({users.length})</h2>
        </div>

        {users.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No users yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  u.isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"
                }`}>
                  {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${u.isActive ? "text-slate-900" : "text-slate-400"}`}>
                      {u.name}
                    </p>
                    {currentUser?.id === u.id && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">You</span>
                    )}
                    {!u.isActive && (
                      <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  <p className="text-xs text-slate-400">Added {formatDate(u.createdAt)}</p>
                </div>

                {/* Role badge */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${ROLE_COLORS[u.role as keyof typeof ROLE_COLORS] ?? "bg-slate-100 text-slate-600"}`}>
                  {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(u)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit user"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {currentUser?.id !== u.id && (
                    <>
                      <button
                        onClick={() => handleToggleActive(u)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title={u.isActive ? "Deactivate" : "Activate"}
                      >
                        {u.isActive
                          ? <ToggleRight className="w-4 h-4 text-green-500" />
                          : <ToggleLeft className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New User" size="md">
        <UserForm onSubmit={handleCreate} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User" size="md">
        <UserForm onSubmit={handleEdit} isEdit />
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" size="sm">
        <div className="text-center py-2">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-slate-700 font-medium">Delete <span className="font-bold">{deleteTarget?.name}</span>?</p>
          <p className="text-sm text-slate-500 mt-1">This will permanently remove their account. They will not be able to log in.</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
