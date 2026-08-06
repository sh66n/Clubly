"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, ScanLine, CameraOff } from "lucide-react";

type ScanResult = {
  id: string;
  timestamp: Date;
  status: "success" | "already_marked" | "error";
  message: string;
  name?: string;
  details?: string;
};

export default function ScanAttendancePage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [resultsFeed, setResultsFeed] = useState<ScanResult[]>([]);
  const [attendedCount, setAttendedCount] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef<{ data: string; time: number } | null>(null);

  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    // Inject custom CSS to override html5-qrcode styles for light theme
    const style = document.createElement("style");
    style.innerHTML = `
      #qr-reader {
        border: none !important;
        border-radius: 1rem;
        overflow: hidden;
        background-color: white;
      }
      #qr-reader video {
        border-radius: 0.5rem;
        object-fit: cover;
        width: 100% !important;
      }
    `;
    document.head.appendChild(style);

    const onScanSuccess = async (decodedText: string) => {
      if (isProcessingRef.current) return;

      const now = Date.now();
      const lastScanned = lastScannedRef.current;
      
      // Prevent duplicate scan within 3 seconds
      if (lastScanned && lastScanned.data === decodedText && now - lastScanned.time < 3000) {
        return;
      }

      isProcessingRef.current = true;
      lastScannedRef.current = { data: decodedText, time: now };

      try {
        const response = await fetch("/api/club-admin/attendance/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrData: decodedText }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.alreadyMarked) {
            toast.info(data.message || "Already marked");
            addResultToFeed({
              id: Math.random().toString(),
              timestamp: new Date(),
              status: "already_marked",
              message: "Already marked",
              name: data.userName || data.groupName,
              details: data.userEmail || (data.memberCount ? `${data.memberCount} members` : undefined)
            });
          } else {
            toast.success("Attendance marked successfully");
            setAttendedCount((prev) => prev + 1);
            addResultToFeed({
              id: Math.random().toString(),
              timestamp: new Date(),
              status: "success",
              message: "Attendance marked",
              name: data.userName || data.groupName,
              details: data.userEmail || (data.memberCount ? `${data.memberCount} members` : undefined)
            });
          }
        } else {
          toast.error(data.error || "Failed to mark attendance");
          addResultToFeed({
            id: Math.random().toString(),
            timestamp: new Date(),
            status: "error",
            message: data.error || "Failed to process QR",
          });
        }
      } catch (error) {
        console.error("Error processing QR:", error);
        toast.error("Network error");
        addResultToFeed({
          id: Math.random().toString(),
          timestamp: new Date(),
          status: "error",
          message: "Network error",
        });
      } finally {
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1500); // Small buffer before allowing next totally different scan
      }
    };

    const onScanFailure = (error: any) => {
      // Html5Qrcode frequently calls this on non-QR frames, just ignore
    };

    let isMounted = true;

    const startScanner = async () => {
      setHasCameraPermission(null);
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          onScanSuccess,
          onScanFailure
        );

        if (!isMounted) {
          // If the component unmounted while we were asking for permissions/starting
          await html5QrCode.stop();
          html5QrCode.clear();
          return;
        }

        setHasCameraPermission(true);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to start scanner:", err);
        setHasCameraPermission(false);
        toast.error("Camera access denied or unavailable.");
      }
    };

    const timeoutId = setTimeout(() => {
      startScanner();
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
      if (scannerRef.current) {
        // If it's already scanning, stop it
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          }).catch(console.error);
        } else {
          // It might be in the middle of starting, or failed to start
          scannerRef.current.clear();
        }
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [retryTrigger]);

  const addResultToFeed = (result: ScanResult) => {
    setResultsFeed((prev) => [result, ...prev].slice(0, 50)); // Keep last 50
  };

  return (
    <div className="pb-10 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/club-admin/events/${eventId}`}
          className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Scan Attendance</h1>
          <p className="text-sm text-slate-500">Scan participant QR codes to mark attendance instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner View */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaeaea] h-fit">
          <div className="flex items-center gap-2 mb-4">
            <ScanLine className="text-[#7CB342] w-5 h-5" />
            <h2 className="text-lg font-semibold text-slate-800">Scanner</h2>
          </div>
          
          <div className="relative rounded-xl overflow-hidden bg-[#f8fafc] border border-slate-100 min-h-[300px] flex flex-col items-center justify-center">
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500 z-10 p-6 text-center">
                <CameraOff className="w-12 h-12 mb-3 text-slate-300" />
                <p className="font-semibold text-slate-700">Camera access denied</p>
                <p className="text-sm mt-1 mb-4">Please allow camera access in your browser settings to scan QR codes.</p>
                <button
                  onClick={() => setRetryTrigger(prev => prev + 1)}
                  className="px-4 py-2 bg-[#7CB342] hover:bg-[#689f38] text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Request Camera Permission
                </button>
              </div>
            )}
            {hasCameraPermission === null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500 z-10">
                <div className="w-8 h-8 border-4 border-[#7CB342]/30 border-t-[#7CB342] rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium">Requesting camera...</p>
              </div>
            )}
            <div id="qr-reader" className="w-full h-full relative z-0"></div>
          </div>
        </div>

        {/* Results Feed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaeaea] flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Scans</h2>
            <div className="bg-[#f0f7e6] text-[#7CB342] px-3 py-1 rounded-full text-xs font-bold border border-[#c5e1a5]">
              {attendedCount} Attended
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {resultsFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                <ScanLine className="w-10 h-10 opacity-20" />
                <p className="text-sm text-center">No scans yet.<br/>Point camera at a QR code to begin.</p>
              </div>
            ) : (
              resultsFeed.map((result) => (
                <div
                  key={result.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="mt-0.5">
                    {result.status === "success" && <CheckCircle2 className="w-5 h-5 text-[#7CB342]" />}
                    {result.status === "already_marked" && <AlertCircle className="w-5 h-5 text-amber-500" />}
                    {result.status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800 text-sm">
                        {result.name || result.message}
                      </p>
                      <span className="text-xs text-slate-400 font-medium">
                        {result.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {result.name && (
                      <p className="text-xs text-slate-500 mt-1">
                        {result.status === "already_marked" ? "Already marked" : "Marked attended"}
                        {result.details ? ` • ${result.details}` : ""}
                      </p>
                    )}
                    {!result.name && result.status === "error" && (
                      <p className="text-xs text-red-500 mt-1">{result.message}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
