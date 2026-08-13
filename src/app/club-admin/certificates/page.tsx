import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Certificate } from "@/models/certificate.model";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Award, MoreVertical, Pencil, Trash } from "lucide-react";
import DeleteCertificateButton from "./DeleteCertificateButton";

export default async function CertificatesPage() {
  const session = await auth();
  if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
    redirect("/login");
  }

  await connectToDb();
  const certificates = await Certificate.find({ club: session.user.adminClub })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Certificates</h1>
          <p className="text-sm text-slate-500">Manage your reusable certificate templates.</p>
        </div>
        <Link
          href="/club-admin/certificates/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" /> New Certificate
        </Link>
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
            <Award className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No certificates yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Create your first certificate template to use across your events.
          </p>
          <Link
            href="/club-admin/certificates/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" /> Create Certificate
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert: any) => (
            <div key={cert._id.toString()} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all flex flex-col group shadow-sm">
              <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden border-b border-slate-100 p-4">
                <img src={cert.url} alt={cert.name} className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div className="p-4 flex items-center justify-between flex-1 bg-white">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-0.5 truncate max-w-[200px]" title={cert.name}>{cert.name}</h3>
                  <p className="text-xs text-slate-500">
                    Added {new Date(cert.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/club-admin/certificates/${cert._id}`} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <DeleteCertificateButton id={cert._id.toString()} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
