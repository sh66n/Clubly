import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Certificate } from "@/models/certificate.model";
import { CertificateFolder } from "@/models/certificateFolder.model";
import { Event } from "@/models/event.model";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Award, Pencil, FileEdit, Folder, ArrowLeft, FileText } from "lucide-react";
import DeleteCertificateButton from "../../DeleteCertificateButton";
import LinkEventsModal from "../../LinkEventsModal";

export default async function CertificateFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
    redirect("/login");
  }

  const { id } = await params;
  await connectToDb();

  let folder: any = null;
  const isUnassigned = id === "unassigned";

  if (isUnassigned) {
    folder = {
      _id: "unassigned",
      name: "Unassigned Templates",
    };
  } else {
    folder = await CertificateFolder.findById(id).lean();
    if (!folder || folder.club.toString() !== session.user.adminClub.toString()) {
      notFound();
    }
  }

  const certificatesFilter = isUnassigned
    ? { club: session.user.adminClub, $or: [{ folder: { $exists: false } }, { folder: null }] }
    : { club: session.user.adminClub, folder: folder._id };

  const [certificates, clubEvents] = await Promise.all([
    Certificate.find(certificatesFilter).sort({ createdAt: -1 }).lean(),
    Event.find({ organizingClub: session.user.adminClub })
      .select("_id name date certificate certificatesByPosition numberOfWinners providesCertificate")
      .sort({ date: -1 })
      .lean(),
  ]);

  const eventsByCertificate: Record<string, { _id: string; name: string; date: string }[]> = {};
  clubEvents.forEach((ev: any) => {
    const certIds = new Set<string>();
    if (ev.certificate) certIds.add(ev.certificate.toString());
    if (ev.certificatesByPosition?.participation) certIds.add(ev.certificatesByPosition.participation.toString());
    if (ev.certificatesByPosition?.first) certIds.add(ev.certificatesByPosition.first.toString());
    if (ev.certificatesByPosition?.second) certIds.add(ev.certificatesByPosition.second.toString());
    if (ev.certificatesByPosition?.third) certIds.add(ev.certificatesByPosition.third.toString());

    certIds.forEach((certIdStr) => {
      if (!eventsByCertificate[certIdStr]) {
        eventsByCertificate[certIdStr] = [];
      }
      eventsByCertificate[certIdStr].push({
        _id: ev._id.toString(),
        name: ev.name,
        date: ev.date ? new Date(ev.date).toISOString() : "",
      });
    });
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <Link
            href="/club-admin/certificates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#7CB342] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Folders
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0f7e6] text-[#7CB342] border border-[#c5d6a8] flex items-center justify-center font-bold">
              <Folder className="w-5 h-5 fill-[#7CB342]/20" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {folder.name ? folder.name.replace(/^Event:\s*/i, "") : "Untitled"}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {certificates.length} certificate template{certificates.length === 1 ? "" : "s"} inside this folder
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/club-admin/certificates/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-xl font-semibold transition-all shadow-sm text-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Certificate
          </Link>
        </div>
      </div>

      {/* Grid of Certificates inside this folder */}
      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/80 rounded-2xl text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 text-slate-400">
            <FileText className="w-7 h-7 opacity-60" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No templates in this folder</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-5">
            Create a new certificate template or link existing certificates to this folder.
          </p>
          <Link
            href="/club-admin/certificates/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-xl font-semibold transition-all text-xs shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Create Certificate
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert: any) => (
            <CertificateCard key={cert._id.toString()} cert={cert} eventsByCertificate={eventsByCertificate} />
          ))}
        </div>
      )}
    </div>
  );
}

function CertificateCard({ cert, eventsByCertificate }: { cert: any; eventsByCertificate: any }) {
  const isDraft = cert.isDraft === true;
  const certIdStr = cert._id.toString();
  const linkedEvents = eventsByCertificate[certIdStr] || [];

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col group shadow-sm ${
        isDraft ? "border-amber-200 hover:border-amber-300" : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden border-b border-slate-100 p-4">
        {cert.url ? (
          <img
            src={cert.url}
            alt={cert.name}
            className="w-full h-full object-contain drop-shadow-sm"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <Award className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-medium uppercase tracking-wider">Empty Slot</span>
          </div>
        )}
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
          <p className="text-xs text-slate-505">
            {isDraft ? "Draft saved" : "Added"} {new Date(cert.uploadedAt || cert.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href={`/club-admin/certificates/${cert._id}`}
            className={`p-2 border rounded-lg transition-colors ${
              isDraft
                ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-650"
            }`}
            title={isDraft ? "Resume editing draft" : "Edit certificate layout"}
          >
            {isDraft ? <FileEdit className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </Link>
          <DeleteCertificateButton id={certIdStr} isDraft={isDraft} />
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5 border-t border-slate-100 bg-white">
        {linkedEvents.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Used in:</span>
            {linkedEvents.slice(0, 2).map((ev: any) => (
              <span
                key={ev._id}
                className="px-2 py-0.5 rounded-md bg-[#f0f7e6] text-[#689F38] text-[11px] font-semibold truncate max-w-[130px] border border-[#c5d6a8]"
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
}
