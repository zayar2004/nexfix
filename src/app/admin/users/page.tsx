"use client";

import { useEffect, useState } from "react";
import { Check, X, Shield, User as UserIcon, Loader2, ChevronDown } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

const ROLES = [
  { value: "user", label: "User" },
  { value: "staff", label: "Staff" },
  { value: "senior_admin", label: "Senior Admin" },
  { value: "super_admin", label: "Super Admin" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.ok) setUsers(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (id: string, updates: Partial<UserData>) => {
    setActionId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
      } else {
        alert("Failed to update user");
      }
    } catch (err) {
      alert("Error updating user");
    } finally {
      setActionId(null);
      setRoleDropdown(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">Approve, reject, or change roles of users.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.displayName || "No Name"}</div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 relative">
                    {/* Role Dropdown */}
                    <button
                      onClick={() => setRoleDropdown(roleDropdown === user.id ? null : user.id)}
                      disabled={actionId === user.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 transition disabled:opacity-50"
                    >
                      {user.role === "super_admin" || user.role === "senior_admin" ? (
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                      ) : null}
                      {user.role}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {roleDropdown === user.id && (
                      <div className="absolute z-50 mt-2 w-40 bg-slate-950 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                        {ROLES.map((r) => (
                          <button
                            key={r.value}
                            onClick={() => handleUpdate(user.id, { role: r.value })}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition ${
                              user.role === r.value ? "text-blue-400 font-bold" : "text-slate-300"
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.isApproved ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-400/20">
                        <Check className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full text-xs font-medium border border-amber-400/20">
                        <Loader2 className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!user.isApproved ? (
                        <button
                          onClick={() => handleUpdate(user.id, { isApproved: true })}
                          disabled={actionId === user.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                        >
                          {actionId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdate(user.id, { isApproved: false })}
                          disabled={actionId === user.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition disabled:opacity-50 border border-slate-700"
                        >
                          {actionId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
