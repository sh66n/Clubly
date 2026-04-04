import { auth } from "@/auth";
import {
  convertLegacyNameConfigToLayout,
  formatYearLabel,
  hexColorToRgb,
  inferYearFromEmail,
} from "@/lib/certificate";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group, Registration, User } from "@/models";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();

const isPng = (bytes: Uint8Array) =>
  bytes.length > 8 &&
  bytes[0] === 0x89 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x4e &&
  bytes[3] === 0x47;

const isJpeg = (bytes: Uint8Array) =>
  bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8;

export const runtime = "nodejs";

const toCloudinaryJpgUrl = (url: string) => {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  return url.replace("/upload/", "/upload/f_jpg/");
};

const getPdfFontName = (
  fontFamily: "helvetica" | "times" | "courier",
  bold: boolean,
  italic: boolean,
) => {
  if (fontFamily === "times") {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }

  if (fontFamily === "courier") {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }

  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDb();

    const event = await Event.findById(id).select(
      "name eventType providesCertificate certificateTemplate winner winnerGroup",
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.providesCertificate) {
      return NextResponse.json(
        { error: "Certificates are not enabled for this event" },
        { status: 400 },
      );
    }

    if (!event.certificateTemplate?.url) {
      return NextResponse.json(
        { error: "Certificate template is not published yet" },
        { status: 400 },
      );
    }

    const legacyLayout = convertLegacyNameConfigToLayout(
      event.certificateTemplate?.nameConfig,
    );
    const layoutTokens =
      event.certificateTemplate?.layout?.tokens ?? legacyLayout?.tokens ?? [];
    if (!layoutTokens.length) {
      return NextResponse.json(
        { error: "Certificate variable layout is not configured" },
        { status: 400 },
      );
    }

    let isEligible = false;

    if (event.eventType === "individual") {
      const reg = await Registration.exists({
        eventId: event._id,
        userId: session.user.id,
        status: "attended",
      });
      isEligible = !!reg;
    } else {
      const group = await Group.findOne({
        event: event._id,
        members: session.user.id,
      }).select("_id");

      if (group?._id) {
        const reg = await Registration.exists({
          eventId: event._id,
          groupId: group._id,
          status: "attended",
        });
        isEligible = !!reg;
      }
    }

    if (!isEligible) {
      return NextResponse.json(
        { error: "Certificate is available only after attendance is marked" },
        { status: 403 },
      );
    }

    const templateRes = await fetch(event.certificateTemplate.url, {
      cache: "no-store",
    });
    if (!templateRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch certificate template" },
        { status: 502 },
      );
    }

    let templateBuffer = await templateRes.arrayBuffer();
    let templateBytes = new Uint8Array(templateBuffer);

    if (!isPng(templateBytes) && !isJpeg(templateBytes)) {
      const transformedUrl = toCloudinaryJpgUrl(event.certificateTemplate.url);
      const transformedRes = await fetch(transformedUrl, { cache: "no-store" });
      if (!transformedRes.ok) {
        return NextResponse.json(
          { error: "Unsupported certificate template format" },
          { status: 400 },
        );
      }
      templateBuffer = await transformedRes.arrayBuffer();
      templateBytes = new Uint8Array(templateBuffer);
    }

    const pdfDoc = await PDFDocument.create();
    const embeddedImage = isPng(templateBytes)
      ? await pdfDoc.embedPng(templateBuffer)
      : await pdfDoc.embedJpg(templateBuffer);

    const width = embeddedImage.width;
    const height = embeddedImage.height;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, { x: 0, y: 0, width, height });

    const participantName = (session.user.name || "Participant").trim();
    const user = await User.findById(session.user.id)
      .select("year email")
      .lean<{ year?: number; email?: string }>();
    const yearValue =
      formatYearLabel(user?.year) !== "N/A"
        ? formatYearLabel(user?.year)
        : inferYearFromEmail(user?.email);

    let rankValue = "Participant";
    if (event.winner?.toString() === session.user.id.toString()) {
      rankValue = "Winner";
    } else if (event.winnerGroup) {
      const isWinnerGroupMember = await Group.exists({
        _id: event.winnerGroup,
        members: session.user.id,
      });
      if (isWinnerGroupMember) {
        rankValue = "Winner";
      }
    }

    const valueMap: Record<string, string> = {
      $name: participantName,
      $year: yearValue,
      $rank: rankValue,
    };

    for (const token of layoutTokens) {
      const text = valueMap[token.variable] || "";
      const fontSize = token.fontSize || 44;
      const fontName = getPdfFontName(
        token.fontFamily || "helvetica",
        Boolean(token.bold),
        Boolean(token.italic),
      );
      const font = await pdfDoc.embedFont(fontName);
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const color = hexColorToRgb(token.colorHex || "#111111");

      const xBase = (token.x || 0.5) * width;
      const yBase = (token.y || 0.5) * height;

      let drawX = xBase;
      if (token.align === "center") drawX = xBase - textWidth / 2;
      if (token.align === "right") drawX = xBase - textWidth;

      page.drawText(text, {
        x: drawX,
        y: yBase,
        size: fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
      });
    }

    const pdfBytes = await pdfDoc.save();

    const safeEventName = sanitizeFilenamePart(event.name || "event");
    const safeUserName = sanitizeFilenamePart(participantName || "participant");
    const filename = `${safeEventName}-${safeUserName}-certificate.pdf`;

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Certificate generation failed", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 },
    );
  }
}
