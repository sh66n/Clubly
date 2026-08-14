import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Certificate } from "@/models/certificate.model";
import { Event } from "@/models/event.model";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Award, Pencil, FileEdit } from "lucide-react";
import DeleteCertificateButton from "./DeleteCertificateButton";
import LinkEventsModal from "./LinkEventsModal";

export default async function CertificatesPage() {
  const session = await auth();
  if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
    redirect("/login");
  }

  await connectToDb();
  const [certificates, clubEvents] = await Promise.all([
    Certificate.find({ club: session.user.adminClub })
      .sort({ createdAt: -1 })
      .lean(),
    Event.find({ organizingClub: session.user.adminClub })
      .select("_id name date certificate")
      .lean(),
  ]);

  const eventsByCertificate: Record<string, { _id: string; name: string; date: string }[]> = {};
  clubEvents.forEach((ev: any) => {
    if (ev.certificate) {
      const certIdStr = ev.certificate.toString();
      if (!eventsByCertificate[certIdStr]) {
        eventsByCertificate[certIdStr] = [];
      }
      eventsByCertificate[certIdStr].push({
        _id: ev._id.toString(),
        name: ev.name,
        date: ev.date ? new Date(ev.date).toISOString() : "",
      });
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Certificates</h1>
          <p className="text-sm text-slate-500">
            Manage your certificate templates and assign them to one or more events.
          </p>
        </div>
        <Link
          href="/club-admin/certificates/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-xl font-semibold transition-all shadow-sm text-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Certificate
        </Link>
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
            <Award className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No certificates yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Upload your certificate template to automatically create a draft, customize variable layouts, and link it to your events.
          </p>
          <Link
            href="/club-admin/certificates/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" /> Create Certificate
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert: any) => {
            const isDraft = cert.isDraft === true;
            const certIdStr = cert._id.toString();
            const linkedEvents = eventsByCertificate[certIdStr] || [];

            return (
              <div
                key={certIdStr}
                className={`bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col group shadow-sm ${
                  isDraft ? "border-amber-200 hover:border-amber-300" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden border-b border-slate-100 p-4">
                  <img
                    src={cert.url}
                    alt={cert.name}
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border shadow-sm ${
                        isDraft
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      }`}
                    >
                      {isDraft ? "Draft" : "Published"}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between bg-white">
                  <div className="min-w-0 pr-2">
                    <h3
                      className="font-semibold text-slate-800 mb-0.5 truncate text-sm"
                      title={cert.name}
                    >
                      {cert.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isDraft ? "Draft saved" : "Added"} {new Date(cert.uploadedAt || cert.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/club-admin/certificates/${cert._id}`}
                      className={`p-2 border rounded-lg transition-colors ${
                        isDraft
                          ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                      title={isDraft ? "Resume editing draft" : "Edit certificate layout"}
                    >
                      {isDraft ? <FileEdit className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </Link>
                    <DeleteCertificateButton id={certIdStr} isDraft={isDraft} />
                  </div>
                </div>

                {/* Tied Events Section & Link Modal Trigger */}
                <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5 border-t border-slate-100 bg-white">
                  {linkedEvents.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">Used in:</span>
                      {linkedEvents.slice(0, 2).map((ev) => (
                        <span
                          key={ev._id}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold truncate max-w-[130px] border border-emerald-200/60"
                          title={ev.name}
                        >
                          {ev.name}
                        </span>
                      ))}
                      {linkedEvents.length > 2 && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          +{linkedEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Not tied to any event yet
                    </div>
                  )}

                  <LinkEventsModal
                    certificateId={certIdStr}
                    certificateName={cert.name}
                    isDraft={isDraft}
                    initialLinkedCount={linkedEvents.length}
                    initialLinkedEvents={linkedEvents}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

