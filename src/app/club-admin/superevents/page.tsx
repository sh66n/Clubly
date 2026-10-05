"use client";
import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";

export default function ClubAdminSuperEventsPage() {
  const [superEvents, setSuperEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  
  async function fetchSuperEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/superevents");
      if (res.ok) {
        const data = await res.json();
        setSuperEvents(data || []);
      } else {
        toast.error("Failed to fetch super events");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSuperEvents();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this super event?")) return;
    try {
      const res = await fetch(`/api/superevents/` + id, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchSuperEvents();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("An error occurred");
    }
  }

  function openCreate() {
    setEditItem(null);
    setDrawerOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Super Events</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your club's overarching events</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Super Event
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <ClublyLoader />
        </div>
      ) : superEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200">
          <Calendar size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No super events</h3>
          <p className="text-slate-500 text-sm mt-1">Create one to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {superEvents.map((se) => (
            <div key={se._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group">
              {se.image ? (
                <div className="h-40 w-full bg-slate-100 relative">
                  <img src={se.image} alt={se.name} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="h-40 w-full bg-slate-100 flex items-center justify-center">
                  <Calendar size={32} className="text-slate-300" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{se.name}</h3>
                {se.description && <p className="text-sm text-slate-500 line-clamp-2 mb-4">{se.description}</p>}
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button onClick={() => openEdit(se)} className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(se._id)} className="flex items-center justify-center p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {drawerOpen && (
        <CreateEditDrawer 
          open={drawerOpen} 
          editItem={editItem} 
          onClose={() => setDrawerOpen(false)} 
          onSuccess={() => {
            setDrawerOpen(false);
            fetchSuperEvents();
          }}
        />
      )}
    </div>
  );
}

function CreateEditDrawer({ open, editItem, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editItem?.name || "");
  const [description, setDescription] = useState(editItem?.description || "");
  const [startDate, setStartDate] = useState(editItem?.startDate ? new Date(editItem.startDate).toISOString().split('T')[0] : "");
  const [endDate, setEndDate] = useState(editItem?.endDate ? new Date(editItem.endDate).toISOString().split('T')[0] : "");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setName(editItem?.name || "");
      setDescription(editItem?.description || "");
      setStartDate(editItem?.startDate ? new Date(editItem.startDate).toISOString().split('T')[0] : "");
      setEndDate(editItem?.endDate ? new Date(editItem.endDate).toISOString().split('T')[0] : "");
      setImage(null);
    }
  }, [open, editItem]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (description) formData.append("description", description);
      if (startDate) formData.append("startDate", startDate);
      if (endDate) formData.append("endDate", endDate);
      if (image) formData.append("image", image);
      
      const url = editItem ? `/api/superevents/${editItem._id}` : "/api/superevents";
      const method = editItem ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        body: formData,
      });
      
      if (res.ok) {
        toast.success(editItem ? "Updated successfully" : "Created successfully");
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.message || err.error || "Failed to save super event");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{editItem ? 'Edit Super Event' : 'Create Super Event'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
             &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <form id="super-event-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white" placeholder="e.g. Techfest 2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white" placeholder="About this super event..."></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image (Optional)</label>
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 bg-slate-100 font-medium rounded-lg transition-colors">Cancel</button>
          <button type="submit" form="super-event-form" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : 'Save Super Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
