"use client";

import { useEffect, useState } from "react";
import { Check, X, Shield, User as UserIcon, Loader2, ChevronDown, Trash2, Eye, EyeOff } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  isApproved: boolean;
  createdAt: string;
  passwordHash?: string;
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
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      alert("Error deleting user");
    } finally {
      setDeleting(false);
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">Approve, reject, change roles, or delete users.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-4 py-4 font-medium">User</th>
                <th className="px-4 py-4 font-medium">Password (Hash)</th>
                <th className="px-4 py-4 font-medium">Role</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4">
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
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        const newPass = prompt(`သင့် User ${user.email} အတွက် Password အသစ် ရိုက်ထည့်ပါ (အနည်းဆုံး ၆ လုံး)`);
                        if (newPass && newPass.length >= 6) {
                          fetch("/api/admin/users/reset-password", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: user.id, newPassword: newPass }),
                          }).then(r => r.json()).then(d => {
                            if (d.ok) alert("✅ Password ပြောင်းပြီးပါပြီ");
                            else alert("❌ " + (d.error || "မအောင်မြင်ပါ"));
                          });
                        } else if (newPass) {
                          alert("Password က အနည်းဆုံး ၆ လုံး ရှိရပါမယ်");
                        }
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      Reset Password
                    </button>
                  </td>
                  <td className="px-4 py-4 relative">
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
                  <td className="px-4 py-4">
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
                  <td className="px-4 py-4 text-right">
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
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg text-xs font-medium transition border border-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete User?</h3>
            <p className="text-sm text-slate-400 mb-6">
              <strong>{deleteTarget.email}</strong> ကို အပြီးဖျက်ပစ်မည်။ ဤအီးမေးလ်နဲ့ ပြန် Register လုပ်လို့ရပါမည်။
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
