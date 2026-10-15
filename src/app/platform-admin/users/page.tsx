"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Users,
  Search,
  Building2,
  ShieldCheck,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Edit2,
  Check,
  X,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  tenantId?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  college?: string;
  department?: string;
  createdAt: string;
}

interface TenantOption {
  _id: string;
  name: string;
  slug: string;
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Quick edit modal / state
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newTenantId, setNewTenantId] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/platform-admin/tenants");
      if (res.ok) {
        const data = await res.json();
        setTenants(data.organizations || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      if (tenantFilter) params.append("tenantId", tenantFilter);

      const res = await fetch(`/api/platform-admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
      setPagination({
        total: data.pagination.total,
        pages: data.pagination.pages,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, tenantFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openEditRoleModal = (user: UserItem) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewTenantId(user.tenantId?._id || "");
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      setUpdating(true);
      const res = await fetch("/api/platform-admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          role: newRole,
          tenantId: newTenantId || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update user");
      }

      toast.success("User role updated successfully");
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Error updating user");
    } finally {
      setUpdating(false);
    }
  };

  const roleColors: Record<string, string> = {
    "platform-admin": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    "super-admin": "bg-purple-500/15 text-purple-400 border-purple-500/30",
    "club-admin": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "faculty-coordinator": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    user: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-400" />
          Platform User Directory
        </h1>
        <p className="text-zinc-400 text-xs">
          Search and manage user roles, permissions, and institution assignments across Clubly.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Tenant Filter */}
          <select
            value={tenantFilter}
            onChange={(e) => {
              setTenantFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Colleges</option>
            {tenants.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="platform-admin">Platform Admin</option>
            <option value="super-admin">Super Admin (Tenant)</option>
            <option value="club-admin">Club Admin</option>
            <option value="faculty-coordinator">Faculty Coordinator</option>
            <option value="user">Student User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#111419] border-b border-zinc-800/80 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Assigned College</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-800/20 transition-colors">
                    {/* User profile */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-800 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {u.name?.[0] || "U"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-white block truncate max-w-[200px]">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-zinc-500 truncate block">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Tenant */}
                    <td className="px-5 py-3.5">
                      {u.tenantId ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-medium text-zinc-200 truncate max-w-[160px]">
                            {u.tenantId.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic text-[11px]">Unassigned / Global</span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5 text-zinc-400 truncate max-w-[150px]">
                      {u.department || "-"}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider font-mono border ${
                          roleColors[u.role] || "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openEditRoleModal(u)}
                        className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                      >
                        Manage Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-[#111419] flex items-center justify-between text-xs text-zinc-400">
          <span>
            Total: <strong className="text-white font-mono">{pagination.total}</strong> users
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs">
              Page {page} of {pagination.pages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#14171d] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Modify User Permissions</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-zinc-400 block mb-1">Target User:</span>
                <span className="font-semibold text-white">{selectedUser.name}</span>{" "}
                <span className="text-zinc-500 font-mono">({selectedUser.email})</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Assign Platform / Tenant Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="user">User (Student)</option>
                  <option value="club-admin">Club Admin</option>
                  <option value="faculty-coordinator">Faculty Coordinator</option>
                  <option value="super-admin">Super Admin (Tenant Head)</option>
                  <option value="platform-admin">Platform Admin (Global Root)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Assign Institution (Tenant)</label>
                <select
                  value={newTenantId}
                  onChange={(e) => setNewTenantId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">No Tenant (Global)</option>
                  {tenants.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all disabled:opacity-50"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Role</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
