"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminLayout } from "@/components/admin/AdminLayout";

type User = {
  id: string;
  email: string;
  publicId: string;
  displayName: string | null;
  role: string;
  createdAt: string;
  lastSeenAt: string | null;
};

const roleColors: Record<string, string> = {
  user: "bg-[var(--nx-bg-surface-deep)] text-[var(--nx-text-secondary-updated)]",
  staff: "bg-[var(--nx-accent)]/10 text-[var(--nx-accent)]",
  senior_admin: "bg-[var(--nx-warning)]/10 text-[var(--nx-warning)]",
  super_admin: "bg-[var(--nx-error)]/10 text-[var(--nx-error)]",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setUsers(data.data);
        else setMessage("❌ " + data.error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Change this user's role to "${newRole}"?`)) return;
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setMessage("✅ Role updated!");
      fetchUsers();
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString();
  };

  const isSuperAdmin = session?.user?.role === "super_admin";

  return (
    <AdminLayout title="User Management">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--nx-text-primary)]">All Users ({users.length})</h2>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">
              {isSuperAdmin ? "You can change user roles" : "Only Super Admin can change roles"}
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-sm text-center text-[var(--nx-text-primary)]">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-[var(--nx-text-primary)]">Loading...</p>
        ) : (
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--nx-bg-surface-deep)]">
                <tr>
                  <th className="text-left px-4 py-3 text-[var(--nx-text-muted-updated)] font-semibold text-xs uppercase">User</th>
                  <th className="text-left px-4 py-3 text-[var(--nx-text-muted-updated)] font-semibold text-xs uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-[var(--nx-text-muted-updated)] font-semibold text-xs uppercase hidden sm:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-[var(--nx-text-muted-updated)] font-semibold text-xs uppercase hidden sm:table-cell">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-[var(--nx-border-updated)]">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[var(--nx-text-primary)]">{u.displayName || "Unnamed"}</p>
                      <p className="text-xs text-[var(--nx-text-muted-updated)]">{u.email}</p>
                      <p className="text-[10px] font-mono text-[var(--nx-accent)]">{u.publicId}</p>
                    </td>
                    <td className="px-4 py-3">
                      {isSuperAdmin && u.id !== session?.user?.id && u.role !== "super_admin" ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={updating === u.id}
                          className={`px-2 py-1 text-xs font-bold rounded-md ${roleColors[u.role]} border border-[var(--nx-border-updated)]`}
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="senior_admin">Senior Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${roleColors[u.role]}`}>
                          {u.role.replace("_", " ").toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--nx-text-muted-updated)] hidden sm:table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--nx-text-muted-updated)] hidden sm:table-cell">
                      {formatDate(u.lastSeenAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
