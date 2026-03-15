"use client";

import React, { useEffect, useState } from "react";
import { X, Users, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import GroupCard from "./GroupCard";
import { motion, AnimatePresence } from "framer-motion";

interface ContinueWithGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  user: any;
}

export default function ContinueWithGroupModal({
  isOpen,
  onClose,
  event,
  user,
}: ContinueWithGroupModalProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cloningGroupId, setCloningGroupId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen && user) {
      fetchGroups();
    }
  }, [isOpen, user]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}/groups`);
      if (!res.ok) throw new Error("Failed to fetch past groups");
      const data = await res.json();
      setGroups(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneGroup = async (pastGroupId: string) => {
    setCloningGroupId(pastGroupId);
    try {
      const res = await fetch(`/api/events/${event._id}/groups/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pastGroupId }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to clone group");
      
      toast.success("Group cloned successfully!");
      onClose();
      // Refresh the page to show the group in EventDetails
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCloningGroupId(null);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Uses fixed positioning with high z-index to cover everything including sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Select a Past Group</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Choose a group you previously led to register for {event.name}.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-black">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p className="text-sm font-medium">Loading your previous groups...</p>
                  </div>
                ) : groups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                    <Users className="mb-4 opacity-50" size={40} />
                    <p className="text-sm font-medium text-white mb-1">No past groups found</p>
                    <p className="text-xs">You haven't led any groups in previous events.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groups.map((group) => {
                      const isCurrentEventGroup = group.event?._id === event._id;
                      if (isCurrentEventGroup) return null;

                      const memberCount = group.members?.length || 0;
                      let isEligible = false;
                      let reason = "";

                      if (event.teamSize) {
                        isEligible = memberCount === event.teamSize;
                        if (!isEligible) reason = `Requires exactly ${event.teamSize} members`;
                      } else if (event.teamSizeRange) {
                        isEligible = memberCount >= event.teamSizeRange.min && memberCount <= event.teamSizeRange.max;
                        if (!isEligible) reason = `Requires ${event.teamSizeRange.min}-${event.teamSizeRange.max} members`;
                      }

                      return (
                        <div key={group._id} className="relative group">
                          {/* Disable Overlay for Ineligible Groups */}
                          {!isEligible && (
                            <div className="absolute inset-0 z-10 bg-black/40 rounded-xl cursor-not-allowed flex items-center justify-center">
                              <div className="bg-black/80 px-4 py-2 rounded-full border border-red-500/20 text-xs font-semibold text-red-400 backdrop-blur-sm">
                                {reason}
                              </div>
                            </div>
                          )}
                          
                          <div className={`transition-opacity duration-300 ${!isEligible ? 'opacity-50' : ''}`}>
                            {/* Reusing existing GroupCard */}
                            <div className="mb-3">
                              <GroupCard group={group} eventId={group.event?._id || ""} />
                            </div>
                            
                            <div className="flex items-center justify-between mt-2 pl-1 pr-1">
                                <div className="text-xs font-medium text-gray-500">
                                  From: <span className="text-gray-300">{group.event?.name || "Previous Event"}</span>
                                </div>
                                <button
                                  onClick={() => handleCloneGroup(group._id)}
                                  disabled={!isEligible || cloningGroupId === group._id}
                                  className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${
                                    isEligible && cloningGroupId !== group._id
                                      ? "bg-white text-black hover:bg-gray-200"
                                      : "bg-white/10 text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  {cloningGroupId === group._id ? (
                                    <>
                                      <Loader2 className="animate-spin" size={16} />
                                      Cloning...
                                    </>
                                  ) : (
                                    <>
                                      Continue
                                      <ArrowRight size={16} />
                                    </>
                                  )}
                                </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
