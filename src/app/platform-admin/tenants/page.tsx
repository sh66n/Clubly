"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Plus,
  ExternalLink,
  Edit,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Loader2,
  Globe,
  Layers,
  Users,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface OrganizationData {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  allowedEmailDomains: string[];
  departments: string[];
  contactEmail?: string;
  plan?: "free" | "starter" | "enterprise";
  primaryColor?: string;
  status: "active" | "suspended" | "trial";
  userCount?: number;
  clubCount?: number;
  eventCount?: number;
  createdAt: string;
}

function TenantsManagementContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tenants, setTenants] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<OrganizationData | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
    allowedEmailDomains: "",
    departments: "",
    contactEmail: "",
    plan: "free" as "free" | "starter" | "enterprise",
    status: "active" as "active" | "suspended" | "trial",
  });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/platform-admin/tenants");
      if (!res.ok) throw new Error("Failed to load organizations");
      const data = await res.json();
      setTenants(data.organizations || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Handle URL query parameters for modal opening (e.g. ?action=new or ?edit=ID)
  useEffect(() => {
    const action = searchParams.get("action");
    const editId = searchParams.get("edit");

    if (action === "new") {
      openCreateModal();
    } else if (editId && tenants.length > 0) {
      const tenantToEdit = tenants.find((t) => t._id === editId);
      if (tenantToEdit) {
        openEditModal(tenantToEdit);
      }
    }
  }, [searchParams, tenants]);

  const openCreateModal = () => {
    setEditingTenant(null);
    setFormData({
      name: "",
      slug: "",
      logo: "",
      allowedEmailDomains: "",
      departments: "Computer Engineering, Information Technology, Electronics, Mechanical",
      contactEmail: "",
      plan: "free",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tenant: OrganizationData) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      logo: tenant.logo || "",
      allowedEmailDomains: (tenant.allowedEmailDomains || []).join(", "),
      departments: (tenant.departments || []).join(", "),
      contactEmail: tenant.contactEmail || "",
      plan: tenant.plan || "free",
      status: tenant.status || "active",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTenant(null);
    router.replace("/platform-admin/tenants");
  };

  const handleSlugAutoGenerate = (name: string) => {
    if (!editingTenant) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20);
      setFormData((prev) => ({ ...prev, name, slug: generated }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Institution name and subdomain slug are required");
      return;
    }

    try {
      setSaving(true);
      const url = editingTenant
        ? `/api/platform-admin/tenants/${editingTenant._id}`
        : "/api/platform-admin/tenants";
      const method = editingTenant ? "PATCH" : "POST";

      const payload = {
        name: formData.name,
        slug: formData.slug,
        logo: formData.logo,
        allowedEmailDomains: formData.allowedEmailDomains
          .split(",")
          .map((d) => d.trim().replace(/^@/, ""))
          .filter(Boolean),
        departments: formData.departments
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
        contactEmail: formData.contactEmail,
        plan: formData.plan,
        status: formData.status,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save organization");
      }

      toast.success(
        editingTenant ? "Organization updated successfully" : "New college onboarded successfully!"
      );
      closeModal();
      fetchTenants();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (tenant: OrganizationData) => {
    const newStatus = tenant.status === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/platform-admin/tenants/${tenant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`${tenant.name} is now ${newStatus}`);
      fetchTenants();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.allowedEmailDomains || []).some((d) => d.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Colleges & Institutions
          </h1>
          <p className="text-zinc-400 text-xs">
            Manage institution tenants, subdomain routing, and institutional email authorization.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision College</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by college name, slug, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {["all", "active", "trial", "suspended"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#111419] border-b border-zinc-800/80 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Institution</th>
                <th className="px-5 py-3.5">Subdomain</th>
                <th className="px-5 py-3.5">Allowed Domains</th>
                <th className="px-5 py-3.5 text-center">Members</th>
                <th className="px-5 py-3.5 text-center">Clubs / Events</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading institutions...
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                    No colleges match your filter.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr
                    key={tenant._id}
                    className="hover:bg-zinc-800/20 transition-colors group"
                  >
                    {/* Institution */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {tenant.logo ? (
                          <img
                            src={tenant.logo}
                            alt={tenant.name}
                            className="w-9 h-9 rounded-xl object-contain bg-zinc-950 p-1 border border-zinc-800 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center font-bold text-indigo-300 text-xs shrink-0">
                            {tenant.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-white block truncate max-w-[200px]">
                            {tenant.name}
                          </span>
                          <span className="text-[11px] text-zinc-500 truncate block">
                            {tenant.contactEmail || "No contact email"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Subdomain */}
                    <td className="px-5 py-4 font-mono text-[11px]">
                      <a
                        href={`http://${tenant.slug}.localhost:3000`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 hover:underline"
                        title="Open college portal"
                      >
                        <span>{tenant.slug}.clubly.app</span>
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </td>

                    {/* Allowed Domains */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {(tenant.allowedEmailDomains || []).map((dom) => (
                          <span
                            key={dom}
                            className="px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-[10px] font-mono text-zinc-300"
                          >
                            @{dom}
                          </span>
                        ))}
                        {(!tenant.allowedEmailDomains || tenant.allowedEmailDomains.length === 0) && (
                          <span className="text-[10px] text-zinc-500 italic">Open to all</span>
                        )}
                      </div>
                    </td>

                    {/* Members */}
                    <td className="px-5 py-4 text-center font-mono font-semibold text-zinc-200">
                      {tenant.userCount ?? 0}
                    </td>

                    {/* Clubs / Events */}
                    <td className="px-5 py-4 text-center font-mono text-zinc-400">
                      <span className="text-zinc-200 font-semibold">{tenant.clubCount ?? 0}</span>
                      <span className="text-zinc-600 mx-1">/</span>
                      <span className="text-zinc-200 font-semibold">{tenant.eventCount ?? 0}</span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider font-mono border ${
                          tenant.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : tenant.status === "trial"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tenant.status === "active"
                              ? "bg-emerald-400"
                              : tenant.status === "trial"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                        {tenant.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(tenant)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="Edit Institution"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tenant)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            tenant.status === "active"
                              ? "border-rose-900/40 bg-rose-950/20 text-rose-400 hover:bg-rose-900/40"
                              : "border-emerald-900/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/40"
                          }`}
                          title={tenant.status === "active" ? "Suspend Tenant" : "Activate Tenant"}
                        >
                          {tenant.status === "active" ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#14171d] border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingTenant ? `Edit ${editingTenant.name}` : "Onboard New College Tenant"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Institution Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">College / Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Veermata Jijabai Technological Institute"
                  value={formData.name}
                  onChange={(e) => handleSlugAutoGenerate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Subdomain Slug */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Subdomain Slug *</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      placeholder="vjti"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 font-mono placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-zinc-400 font-mono text-xs">.clubly.app</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Used for tenant routing. Accessible via <code className="text-indigo-400">{formData.slug || "slug"}.clubly.app</code> or <code className="text-indigo-400">{formData.slug || "slug"}.localhost:3000</code>.
                </p>
              </div>

              {/* Allowed Email Domains */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">
                  Allowed Email Domains (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="vjti.ac.in, alumni.vjti.ac.in"
                  value={formData.allowedEmailDomains}
                  onChange={(e) => setFormData({ ...formData, allowedEmailDomains: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[11px] text-zinc-500">
                  Only students with matching emails can log in to this college portal.
                </p>
              </div>

              {/* Departments */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">
                  Academic Departments (Comma-separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="Computer Engineering, Information Technology, Electronics, Mechanical"
                  value={formData.departments}
                  onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Contact Email & Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Contact Email</label>
                  <input
                    type="email"
                    placeholder="admin@college.ac.in"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Logo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://.../logo.png"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Plan & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) =>
                      setFormData({ ...formData, plan: e.target.value as any })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="free">Free / Community</option>
                    <option value="starter">Starter</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTenant ? "Save Changes" : "Create Tenant"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TenantsManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-zinc-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading college management...
        </div>
      }
    >
      <TenantsManagementContent />
    </Suspense>
  );
}
