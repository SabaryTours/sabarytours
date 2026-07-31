"use client";

import { useEffect, useState } from "react";
import { Settings02Icon, UserAdd01Icon } from "hugeicons-react";
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_OPTIONS,
  ADMIN_ROLE_PRESETS,
  type AdminPermission,
} from "../../lib/adminPermissions";

type AdminTeamMember = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  permissions: AdminPermission[];
  created_at: string;
};

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  role: "support",
};

export default function AdminSettingsPage() {
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    void fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      const json = await res.json();
      if (json.success) setMembers(json.members);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          permissions: ADMIN_ROLE_PRESETS[form.role] || [],
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add admin member");
      }
      setForm(emptyForm);
      setFormSuccess(json.message || "Team member added.");
      await fetchMembers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to add admin member");
    } finally {
      setAdding(false);
    }
  };

  const updateMember = async (
    member: AdminTeamMember,
    updates: { role?: string; permissions?: AdminPermission[] },
  ) => {
    setSavingId(member.id);
    try {
      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, ...updates }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update admin member");
      }
      setMembers((prev) => prev.map((row) => (row.id === member.id ? json.member : row)));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update admin member");
    } finally {
      setSavingId(null);
    }
  };

  const removeAccess = async (member: AdminTeamMember) => {
    if (!confirm(`Remove admin access for ${member.email}?`)) return;

    setSavingId(member.id);
    try {
      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, removeAccess: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to remove admin access");
      }
      setMembers((prev) => prev.filter((row) => row.id !== member.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove admin access");
    } finally {
      setSavingId(null);
    }
  };

  const togglePermission = (member: AdminTeamMember, permission: AdminPermission, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...member.permissions, permission]))
      : member.permissions.filter((item) => item !== permission);
    void updateMember(member, { permissions: next });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2 text-[#ff5e00]">
          <Settings02Icon size={22} />
          <span className="text-sm font-semibold uppercase tracking-wide font-sans">Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans mt-2">Admin Team</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">
          Manage who can access the admin dashboard. Customer accounts are listed separately under Platform Users.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 font-sans flex items-center gap-2">
          <UserAdd01Icon size={20} />
          Add or invite team member
        </h2>
        <p className="text-sm text-gray-500 font-sans mt-1 mb-4">
          If they already have an account, we grant admin access immediately. If not, we create their account and email them a link to set their password.
        </p>
        <form onSubmit={addMember} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input
            type="email"
            required
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
          />
          <input
            type="text"
            placeholder="First name (required for new invites)"
            value={form.firstName}
            onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
          />
          <input
            type="text"
            placeholder="Last name (optional)"
            value={form.lastName}
            onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
          />
          <select
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-sans"
          >
            {ADMIN_ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role[0].toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-[#ff5e00] text-white px-4 py-2 text-sm font-semibold font-sans disabled:opacity-60 md:col-span-2 xl:col-span-1"
          >
            {adding ? "Saving..." : "Grant access / Send invite"}
          </button>
        </form>
        {formError ? <p className="text-sm text-red-600 font-sans mt-3">{formError}</p> : null}
        {formSuccess ? <p className="text-sm text-green-700 font-sans mt-3">{formSuccess}</p> : null}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 font-sans">Current team</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-gray-500 font-sans">Loading team...</p>
        ) : members.length === 0 ? (
          <p className="px-6 py-8 text-gray-500 font-sans">No admin team members yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div key={member.id} className="px-6 py-5 space-y-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-bold text-gray-800 font-sans">
                      {member.display_name || member.email}
                    </p>
                    <p className="text-sm text-gray-500 font-sans">{member.email}</p>
                    <p className="text-xs text-gray-400 font-sans mt-1">
                      Added {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={member.role}
                      disabled={savingId === member.id}
                      onChange={(e) => {
                        const role = e.target.value;
                        void updateMember(member, {
                          role,
                          permissions: ADMIN_ROLE_PRESETS[role] || [],
                        });
                      }}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-sans"
                    >
                      {ADMIN_ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role[0].toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={savingId === member.id}
                      onClick={() => void removeAccess(member)}
                      className="rounded-lg border border-red-200 text-red-600 px-3 py-2 text-sm font-semibold font-sans hover:bg-red-50"
                    >
                      Remove access
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ADMIN_PERMISSIONS.map((permission) => (
                    <label
                      key={permission}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-[11px] text-gray-600 border border-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={member.permissions.includes(permission)}
                        disabled={
                          savingId === member.id || member.role === "admin" || member.role === "owner"
                        }
                        onChange={(e) => togglePermission(member, permission, e.target.checked)}
                      />
                      {permission}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
