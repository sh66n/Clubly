import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Certificate } from "@/models/certificate.model";
import { CertificateFolder } from "@/models/certificateFolder.model";
import { Event } from "@/models/event.model";
import { redirect } from "next/navigation";
import CertificateFolderClient from "./CertificateFolderClient";

export default async function CertificatesPage() {
  const session = await auth();
  if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
    redirect("/login");
  }

  await connectToDb();
  const [certificates, clubEvents, folders] = await Promise.all([
    Certificate.find({ club: session.user.adminClub })
      .select("_id folder isDraft createdAt name url uploadedAt")
      .lean(),
    Event.find({ organizingClub: session.user.adminClub })
      .select("_id name date certificate certificatesByPosition numberOfWinners providesCertificate")
      .sort({ date: -1 })
      .lean(),
    CertificateFolder.find({ club: session.user.adminClub })
      .populate("event", "name date image")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const eventOptions = clubEvents.map((ev: any) => ({
    _id: ev._id.toString(),
    name: ev.name,
    date: ev.date ? new Date(ev.date).toISOString() : undefined,
    numberOfWinners: ev.numberOfWinners || 1,
    providesCertificate: ev.providesCertificate,
  }));

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

  // Group certificates statistics per folder
  const folderStats: Record<
    string,
    { total: number; published: number; draft: number }
  > = {};

  folders.forEach((f: any) => {
    folderStats[f._id.toString()] = { total: 0, published: 0, draft: 0 };
  });
  folderStats.unassigned = { total: 0, published: 0, draft: 0 };

  certificates.forEach((c: any) => {
    const fId = c.folder ? c.folder.toString() : "unassigned";
    if (!folderStats[fId]) {
      folderStats[fId] = { total: 0, published: 0, draft: 0 };
    }
    folderStats[fId].total += 1;
    if (c.isDraft) {
      folderStats[fId].draft += 1;
    } else {
      folderStats[fId].published += 1;
    }
  });

  const totalFoldersCount = folders.length; // Don't count unassigned folder anymore
  const totalCertificatesCount = certificates.length;
  const totalPublishedCount = certificates.filter((c: any) => !c.isDraft).length;
  const totalDraftCount = certificates.filter((c: any) => c.isDraft).length;

  return (
    <CertificateFolderClient
      folders={JSON.parse(JSON.stringify(folders))}
      certificates={JSON.parse(JSON.stringify(certificates))}
      eventOptions={JSON.parse(JSON.stringify(eventOptions))}
      folderStats={folderStats}
      totalFoldersCount={totalFoldersCount}
      totalCertificatesCount={totalCertificatesCount}
      totalPublishedCount={totalPublishedCount}
      totalDraftCount={totalDraftCount}
      eventsByCertificate={eventsByCertificate}
    />
  );
}
