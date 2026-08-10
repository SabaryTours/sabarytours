"use client";

import { useEffect, useState } from "react";
import { UserCircleIcon } from "hugeicons-react";

type PlatformUserRow = {
  id: string;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  role?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  avatar_url?: string | null;
};

function formatTimestamp(value?: string | null): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success) setUsers(json.users);
      })
      .catch((error: unknown) => console.error(error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Platform Users</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            Registered customers on the site. Admin access is managed separately under Settings.
          </p>
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">No users found.</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                  {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name || ""} className="h-10 w-10 rounded-full object-cover" /> : <UserCircleIcon size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-800 font-sans">
                    {user.full_name || user.email || "No name"}
                  </p>
                  <p className="text-xs text-gray-500 font-sans truncate">{user.email || "No email"}</p>
                  {user.phone && <p className="text-xs text-gray-500 font-sans">{user.phone}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs uppercase tracking-wide text-gray-500 font-sans">
                  {user.role || "subscriber"}
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-600 font-sans">Joined {formatTimestamp(user.created_at)}</p>
                  <p className="text-xs text-gray-500 font-sans">Last sign-in {formatTimestamp(user.last_sign_in_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Account type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">Activity timestamps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">No users found.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                        {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name || ""} className="h-10 w-10 rounded-full object-cover" /> : <UserCircleIcon size={24} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 font-sans">
                          {user.full_name || user.email || "No name"}
                        </p>
                        <p className="text-xs text-gray-500 font-sans">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800 font-sans">{user.email || "No email"}</p>
                    <p className="text-xs text-gray-500 font-sans">{user.phone || "No phone"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 font-sans">
                      {user.role || "subscriber"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-sans">Joined {formatTimestamp(user.created_at)}</p>
                      <p className="text-xs text-gray-500 font-sans">Last sign-in {formatTimestamp(user.last_sign_in_at)}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
