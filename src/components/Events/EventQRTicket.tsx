import React, { useEffect } from "react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { format } from "date-fns";

interface EventQRTicketProps {
  eventId: string;
  eventName: string;
  userId: string;
  userName: string;
  eventDate: string;
  clubName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventQRTicket({
  eventId,
  eventName,
  userId,
  userName,
  eventDate,
  clubName,
  isOpen,
  onClose,
}: EventQRTicketProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const qrValue = `clubly:att:${eventId}:${userId}`;

  // Format date nicely if it's a valid date string
  let formattedDate = eventDate;
  try {
    const d = new Date(eventDate);
    if (!isNaN(d.getTime())) {
      formattedDate = format(d, "MMM do, yyyy • h:mm a");
    }
  } catch (e) {
    // Ignore date format error and keep original string
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/5 p-2 text-gray-500 transition-colors hover:bg-black/10 hover:text-black"
            >
              <X size={20} />
            </button>

            {/* Ticket Header */}
            <div className="bg-gray-50 p-6 pb-8 text-center border-b border-dashed border-gray-300 relative">
              {/* Semi-circle cutouts for ticket effect */}
              <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-black/60 (shadow-inner)" />
              <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-black/60" />
              
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                {clubName}
              </h3>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900">
                {eventName}
              </h2>
            </div>

            {/* Ticket Body / QR Section */}
            <div className="flex flex-col items-center p-8">
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <QRCode
                  value={qrValue}
                  size={200}
                  level="Q"
                />
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Attendee</p>
                <p className="text-lg font-bold text-gray-900">{userName}</p>
                
                <div className="mt-4 rounded-lg bg-blue-50 px-4 py-2">
                  <p className="text-sm font-medium text-blue-700">
                    Show this to volunteers at entry
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
              <p className="text-sm font-medium text-gray-600">
                {formattedDate}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
