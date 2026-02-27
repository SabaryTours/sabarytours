"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { UserCircleIcon } from "hugeicons-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.success) {
        setUsers(json.users);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Manage Users</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">View registered customers and users.</p>
        </div>
      </div>

      {/* Mobile: cards */}
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
                  {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="h-10 w-10 rounded-full object-cover" /> : <UserCircleIcon size={24} />}
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
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 font-sans capitalize">{user.role || "User"}</span>
                <span className="text-sm text-gray-600 font-sans">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">Joined</th>
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
                        {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="h-10 w-10 rounded-full object-cover" /> : <UserCircleIcon size={24} />}
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
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 font-sans capitalize">{user.role || "User"}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-600 font-sans">{new Date(user.created_at).toLocaleDateString()}</span>
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
