import { auth } from "@/auth";
import {
  convertLegacyNameConfigToLayout,
  formatYearLabel,
  hexColorToRgb,
  inferYearFromEmail,
} from "@/lib/certificate";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group, Registration, User, Certificate, Feedback } from "@/models";
import { PDFDocument, StandardFonts, rgb, PDFImage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { NextResponse } from "next/server";

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();

const sanitizePdfText = (str: string) => {
  if (!str) return "";
  return String(str)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E]/g, "");
};

const safeHexColorToRgb = (hexColor?: string) => {
  if (!hexColor || typeof hexColor !== "string") return { r: 0.06, g: 0.06, b: 0.06 };
  let normalized = hexColor.trim().replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized.split("").map((c) => c + c).join("");
  }
  if (normalized.length !== 6) return { r: 0.06, g: 0.06, b: 0.06 };
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  return {
    r: isNaN(r) ? 0.06 : Math.max(0, Math.min(1, r)),
    g: isNaN(g) ? 0.06 : Math.max(0, Math.min(1, g)),
    b: isNaN(b) ? 0.06 : Math.max(0, Math.min(1, b)),
  };
};

const fontTtfCache = new Map<string, Uint8Array>();

const fetchGoogleFontTtf = async (fontFamily: string, bold?: boolean, italic?: boolean): Promise<Uint8Array | null> => {
  const key = `${fontFamily.toLowerCase()}-${bold ? 'bold' : 'normal'}-${italic ? 'italic' : 'normal'}`;
  if (fontTtfCache.has(key)) {
    return fontTtfCache.get(key)!;
  }

  try {
    const familyParam = encodeURIComponent(fontFamily);
    const weightParam = bold ? "700" : "400";
    const italicParam = italic ? "1" : "0";
    const url = `https://fonts.googleapis.com/css2?family=${familyParam}:ital,wght@${italicParam},${weightParam}&display=swap`;
    
    // User-Agent requesting TTF format from Google Fonts
    let cssRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
      },
    });

    if (!cssRes.ok) {
      cssRes = await fetch(`https://fonts.googleapis.com/css?family=${familyParam}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
        },
      });
    }

    if (!cssRes.ok) return null;

    const cssText = await cssRes.text();
    const match = cssText.match(/url\((https:\/\/[^)]+\.ttf)\)/i) || cssText.match(/url\((https:\/\/[^)]+)\)/i);
    if (!match) return null;

    const fontUrl = match[1].replace(/['"]/g, "");
    const ttfRes = await fetch(fontUrl);
    if (!ttfRes.ok) return null;
    const buffer = await ttfRes.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    fontTtfCache.set(key, bytes);
    return bytes;
  } catch (err) {
    console.error(`Failed to fetch TTF font for ${fontFamily}:`, err);
    return null;
  }
};

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
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }
  const withoutExt = url.replace(/\.[a-zA-Z0-9]+$/, ".jpg");
  if (withoutExt.includes("/upload/")) {
    return withoutExt.replace("/upload/", "/upload/f_jpg,fl_lossy,q_auto/");
  }
  return withoutExt;
};

const SERIF_AND_SCRIPT_FONTS = new Set([
  "times", "georgia", "playfair display", "cinzel", "cinzel decorative",
  "cormorant garamond", "bodoni moda", "eb garamond", "merriweather", "prata",
  "lora", "libre baskerville", "spectral", "marcellus", "noto serif",
  "great vibes", "alex brush", "dancing script", "allura", "pinyon script",
  "parisienne", "pacifico", "sacramento", "satisfy", "tangerine",
  "montecarlo", "courgette", "caveat", "italianno", "marck script",
  "herr von muellerhoff"
]);

const MONO_FONTS = new Set([
  "courier", "courier new", "space mono", "courier prime", "fira code", "source code pro"
]);

const getPdfFontName = (
  fontFamily: string,
  bold: boolean,
  italic: boolean,
) => {
  const normalized = (fontFamily || "helvetica").toLowerCase().trim();

  if (MONO_FONTS.has(normalized)) {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }

  if (SERIF_AND_SCRIPT_FONTS.has(normalized)) {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
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

    const event = await Event.findById(id)
      .select("name eventType providesCertificate certificate winner winnerGroup startDate organizingClub feedbackForm certificatesByPosition winners certificateTemplate")
      .populate("certificate")
      .populate("organizingClub", "name");

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let isEligible = false;
    let group = null;

    if (event.eventType === "individual") {
      const reg = await Registration.exists({
        eventId: event._id,
        userId: session.user.id,
      });
      isEligible = !!reg;
    } else {
      group = await Group.findOne({
        event: event._id,
        members: session.user.id,
      }).select("_id");

      if (group?._id) {
        const reg = await Registration.exists({
          eventId: event._id,
          groupId: group._id,
        });
        isEligible = !!reg;
      }
    }

    // Check organizer admin preview access
    const isOrganizerAdmin =
      session.user.role === "club-admin" &&
      session.user.adminClub?.toString() === (event.organizingClub?._id || event.organizingClub)?.toString();

    if (!isEligible && !isOrganizerAdmin) {
      return NextResponse.json(
        { error: "You must be registered for this event to view the certificate" },
        { status: 403 },
      );
    }

    if (event.feedbackForm && !isOrganizerAdmin) {
      const hasFeedback = await Feedback.exists({
        eventId: event._id,
        userId: session.user.id,
      });
      if (!hasFeedback) {
        return NextResponse.json(
          { error: "Please complete the feedback form before downloading your certificate", requiresFeedback: true },
          { status: 403 }
        );
      }
    }

    let position = 0;
    const userIdStr = session.user.id.toString();

    if (event.eventType === "individual") {
      const match = (event.winners || []).find(
        (w: any) => (w.user?._id || w.user)?.toString() === userIdStr
      );
      if (match) position = match.position;
      else if ((event.winner?._id || event.winner)?.toString() === userIdStr) position = 1;
    } else if (group) {
      const groupIdStr = (group._id || group).toString();
      const match = (event.winners || []).find(
        (w: any) => (w.group?._id || w.group)?.toString() === groupIdStr
      );
      if (match) position = match.position;
      else if ((event.winnerGroup?._id || event.winnerGroup)?.toString() === groupIdStr) position = 1;
    }

    const posCerts: any = event.certificatesByPosition;
    let certId: any = null;

    if (position === 1 && posCerts?.first) {
      certId = posCerts.first;
    } else if (position === 2 && posCerts?.second) {
      certId = posCerts.second;
    } else if (position === 3 && posCerts?.third) {
      certId = posCerts.third;
    } else {
      certId = posCerts?.participation || (event.certificate as any)?._id || event.certificate;
    }

    let certObj: any = null;
    if (certId) {
      certObj = await Certificate.findById(certId).lean();
    }
    if (!certObj && event.certificate) {
      if (typeof event.certificate === "object" && (event.certificate as any).url) {
        certObj = event.certificate;
      } else {
        certObj = await Certificate.findById(event.certificate).lean();
      }
    }
    if (!certObj && (event as any).certificateTemplate?.url) {
      certObj = (event as any).certificateTemplate;
    }

    if (!certObj || !certObj.url) {
      return NextResponse.json(
        { error: "Certificate template is not published yet" },
        { status: 400 },
      );
    }

    const legacyLayout = convertLegacyNameConfigToLayout(certObj.nameConfig);
    const layoutTokens = certObj.layout?.tokens ?? legacyLayout?.tokens ?? [];
    if (!layoutTokens.length) {
      return NextResponse.json(
        { error: "Certificate variable layout is not configured" },
        { status: 400 },
      );
    }

    let templateRes = await fetch(certObj.url, { cache: "no-store" });
    if (!templateRes.ok) {
      const fallbackUrl = toCloudinaryJpgUrl(certObj.url);
      templateRes = await fetch(fallbackUrl, { cache: "no-store" });
    }

    if (!templateRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch certificate template image" },
        { status: 502 },
      );
    }

    let templateBuffer = await templateRes.arrayBuffer();
    let templateBytes = new Uint8Array(templateBuffer);

    const pdfDoc = await PDFDocument.create();
    let embeddedImage: PDFImage;

    try {
      if (isPng(templateBytes)) {
        embeddedImage = await pdfDoc.embedPng(templateBytes);
      } else if (isJpeg(templateBytes)) {
        embeddedImage = await pdfDoc.embedJpg(templateBytes);
      } else {
        const transformedUrl = toCloudinaryJpgUrl(certObj.url);
        const transformedRes = await fetch(transformedUrl, { cache: "no-store" });
        if (transformedRes.ok) {
          templateBuffer = await transformedRes.arrayBuffer();
          templateBytes = new Uint8Array(templateBuffer);
          if (isPng(templateBytes)) {
            embeddedImage = await pdfDoc.embedPng(templateBytes);
          } else {
            embeddedImage = await pdfDoc.embedJpg(templateBytes);
          }
        } else {
          throw new Error("Unsupported image format");
        }
      }
    } catch (e: any) {
      console.error("Image embedding failed, attempting jpg conversion fallback", e);
      const transformedUrl = toCloudinaryJpgUrl(certObj.url);
      const transformedRes = await fetch(transformedUrl, { cache: "no-store" });
      const transformedBuffer = await transformedRes.arrayBuffer();
      const transformedBytes = new Uint8Array(transformedBuffer);
      if (isPng(transformedBytes)) {
        embeddedImage = await pdfDoc.embedPng(transformedBytes);
      } else {
        embeddedImage = await pdfDoc.embedJpg(transformedBytes);
      }
    }

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
    if (position === 1) rankValue = "Winner";
    else if (position === 2) rankValue = "Runner-up";
    else if (position === 3) rankValue = "Third Place";

    const clubObj = event.organizingClub as { name?: string } | null;
    const clubName = clubObj?.name || "Club";
    const dateFormatted = event.startDate
      ? new Date(event.startDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const valueMap: Record<string, string> = {
      $name: participantName,
      $year: yearValue,
      $rank: rankValue,
      $event: event.name || "Event",
      $club: clubName,
      $date: dateFormatted,
    };

    pdfDoc.registerFontkit(fontkit);

    for (const token of layoutTokens) {
      const rawText = valueMap[token.variable] ?? (token.variable.startsWith("$") ? token.variable.slice(1) : token.variable);
      const text = sanitizePdfText(rawText);
      const fontSize = token.fontSize || 44;
      
      let font: any = null;
      const fontFamily = token.fontFamily?.trim();
      if (fontFamily && !["helvetica", "arial", "times", "courier"].includes(fontFamily.toLowerCase())) {
        try {
          const ttfBytes = await fetchGoogleFontTtf(fontFamily, Boolean(token.bold), Boolean(token.italic));
          if (ttfBytes) {
            font = await pdfDoc.embedFont(ttfBytes, { subset: true });
          }
        } catch (fontErr) {
          console.warn(`Could not embed custom font ${fontFamily}, falling back to standard font:`, fontErr);
        }
      }

      if (!font) {
        const fontName = getPdfFontName(
          token.fontFamily || "helvetica",
          Boolean(token.bold),
          Boolean(token.italic),
        );
        font = await pdfDoc.embedFont(fontName);
      }

      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const color = safeHexColorToRgb(token.colorHex);

      const xBase = (token.x || 0.5) * width;
      const yBase = (token.y || 0.5) * height - fontSize * 0.2;

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
  } catch (error: any) {
    console.error("Certificate generation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate certificate" },
      { status: 500 },
    );
  }
}
