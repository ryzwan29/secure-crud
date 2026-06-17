import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usersApi } from "../api/users.api";
import { extractErrorMessage } from "../api/client";
import { SafeUser, UserRole } from "../types";
import { Badge, Select, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUsers() {
    setIsLoading(true);
    try {
      setUsers(await usersApi.list());
    } catch (error) {
      toast.error(extractErrorMessage(error, "Gagal memuat daftar user"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRoleChange(id: number, role: UserRole) {
    try {
      const updated = await usersApi.updateRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success("Role berhasil diubah");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Gagal mengubah role"));
    }
  }

  async function handleToggleActive(id: number, isActive: boolean) {
    try {
      const updated = await usersApi.setActive(id, isActive);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(isActive ? "User diaktifkan" : "User dinonaktifkan");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Gagal mengubah status user"));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Manajemen User</h1>
        <p className="text-sm text-ink-500">Kelola role dan status aktif setiap user (khusus admin).</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-border bg-white shadow-card">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-subtle text-xs uppercase text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Username</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td className="px-5 py-3 font-medium text-ink-900">
                      {u.username} {isSelf && <Badge tone="brand">Kamu</Badge>}
                    </td>
                    <td className="px-5 py-3 text-ink-700">{u.email}</td>
                    <td className="px-5 py-3">
                      <Select
                        label=""
                        aria-label={`Role untuk ${u.username}`}
                        options={[
                          { value: "user", label: "User" },
                          { value: "admin", label: "Admin" },
                        ]}
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="!min-h-[36px] !py-1.5"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <button
                        disabled={isSelf}
                        onClick={() => handleToggleActive(u.id, !u.is_active)}
                        className="disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Badge tone={u.is_active ? "success" : "danger"}>
                          {u.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
