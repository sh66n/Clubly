import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { VPP_OFFICIAL_LOGO_BASE64 } from "./attendanceSheetAssets";

export interface AttendanceUser {
  _id?: string;
  name?: string;
  email?: string;
  department?: string;
  year?: number;
}

export interface AttendanceGroup {
  _id?: string;
  name: string;
  leader?: AttendanceUser;
  members?: AttendanceUser[];
}

export interface AttendanceRegistration {
  _id: string;
  userId?: AttendanceUser;
  groupId?: AttendanceGroup;
  status: "registered" | "attended" | "absent";
  registeredAt?: string;
}

export interface AttendanceEvent {
  _id: string;
  name: string;
  date: string;
  eventType: "team" | "individual";
  image?: string;
  organizingClub?: {
    name?: string;
    fullName?: string;
    department?: string;
    logo?: string;
  };
}

export const formatYearLabel = (user?: AttendanceUser | null): string => {
  if (!user) return "";
  const yearMap: Record<number, string> = {
    1: "FE",
    2: "SE",
    3: "TE",
    4: "BE",
  };
  if (user.year && yearMap[user.year]) {
    return yearMap[user.year];
  }

  const email = user.email?.trim().toLowerCase();
  if (!email || !email.endsWith("@pvppcoe.ac.in")) return "";

  const match = email.match(/\d{4}/);
  if (!match) return "";

  const isDSE = email.substring(0, 4).endsWith("s");
  const startYearShort = parseInt(match[0].substring(0, 2), 10);
  const currentYearShort = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth();
  const adjustedCurrentYear =
    currentMonth < 6 ? currentYearShort - 1 : currentYearShort;

  let diff = adjustedCurrentYear - startYearShort + 1;
  if (isDSE) diff += 1;

  return yearMap[diff] || "";
};

export const formatDepartmentLabel = (user?: AttendanceUser | null): string => {
  if (!user) return "";
  const deptStr = (user.department || "").trim().toLowerCase();
  if (deptStr.includes("computer") && !deptStr.includes("science")) return "CE";
  if (
    deptStr.includes("ai") ||
    deptStr.includes("data science") ||
    deptStr.includes("ml") ||
    deptStr.includes("artificial intelligence")
  ) {
    return "AI & DS";
  }
  if (deptStr.includes("information technology") || deptStr === "it") {
    return "IT";
  }
  if (deptStr.includes("electronic") && deptStr.includes("computer")) {
    return "ECS";
  }
  if (
    deptStr.includes("telecommunication") ||
    deptStr.includes("extc") ||
    deptStr.includes("electronics & telecommunication")
  ) {
    return "EXTC";
  }
  if (
    deptStr.includes("mechatronic") ||
    deptStr.includes("mechanical") ||
    deptStr.includes("mech")
  ) {
    return "MECH";
  }

  const email = user.email?.trim().toLowerCase();
  if (email && email.endsWith("@pvppcoe.ac.in")) {
    const prefix3 = email.substring(0, 3);
    const prefixMap: Record<string, string> = {
      vu1: "CE",
      vu2: "AI & DS",
      vu3: "ECS",
      vu4: "IT",
      vu5: "EXTC",
      vu7: "MECH",
    };
    if (prefixMap[prefix3]) return prefixMap[prefix3];
  }

  return user.department || "";
};

export const formatStudentId = (user?: AttendanceUser | null): string => {
  if (!user || !user.email) return "";
  const email = user.email.trim();
  if (email.includes("@")) {
    return email.split("@")[0];
  }
  return email;
};

export const formatEventDate = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getDepartmentHeader = (event: AttendanceEvent): string => {
  const clubDept = event.organizingClub?.department;
  if (clubDept && typeof clubDept === "string" && clubDept.trim().length > 0) {
    const cleaned = clubDept.trim().toUpperCase();
    if (cleaned.startsWith("DEPARTMENT OF")) return cleaned;
    return `DEPARTMENT OF ${cleaned}`;
  }
  return "DEPARTMENT OF COMPUTER ENGINEERING";
};

const imageToDataUrl = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const cropImageToCardAspect = async (
  url: string,
  targetAspect = 1.6,
): Promise<string | null> => {
  // First obtain data URL or direct image to avoid CORS canvas taint
  const rawDataUrl = await imageToDataUrl(url);
  const srcToLoad = rawDataUrl || url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;
        if (!imgWidth || !imgHeight) {
          resolve(rawDataUrl);
          return;
        }

        const currentAspect = imgWidth / imgHeight;
        let cropX = 0;
        let cropY = 0;
        let cropWidth = imgWidth;
        let cropHeight = imgHeight;

        if (currentAspect > targetAspect) {
          cropWidth = imgHeight * targetAspect;
          cropX = (imgWidth - cropWidth) / 2;
        } else {
          cropHeight = imgWidth / targetAspect;
          cropY = (imgHeight - cropHeight) / 2;
        }

        const canvas = document.createElement("canvas");
        const exportWidth = 640;
        const exportHeight = Math.round(640 / targetAspect);
        canvas.width = exportWidth;
        canvas.height = exportHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          exportWidth,
          exportHeight,
        );

        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch (err) {
        console.error("Failed to crop image on canvas:", err);
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = srcToLoad;
  });
};

interface TeamMemberRow {
  name: string;
  year: string;
  department: string;
  id: string;
}

interface FormattedTeam {
  teamNo: number;
  teamName: string;
  members: TeamMemberRow[];
}

interface FormattedIndividual {
  srNo: number;
  name: string;
  year: string;
  department: string;
  id: string;
}

export async function generateAttendancePDF(
  event: AttendanceEvent,
  registrations: AttendanceRegistration[],
): Promise<void> {
  let coverDataUrl: string | null = null;
  if (event.image) {
    coverDataUrl = await cropImageToCardAspect(event.image);
  }

  const isTeam = event.eventType === "team";
  const deptHeaderText = getDepartmentHeader(event);
  const formattedDate = formatEventDate(event.date);

  // Prepare data structures
  let teams: FormattedTeam[] = [];
  let individuals: FormattedIndividual[] = [];

  if (isTeam) {
    teams = registrations.map((reg, idx) => {
      const teamName = reg.groupId?.name || `Team ${idx + 1}`;
      const leader = reg.groupId?.leader;
      const otherMembers = (reg.groupId?.members || []).filter(
        (m) =>
          m.email?.toLowerCase() !== leader?.email?.toLowerCase() &&
          m._id?.toString() !== leader?._id?.toString(),
      );

      const allUsers = leader ? [leader, ...otherMembers] : otherMembers;
      const memberRows: TeamMemberRow[] =
        allUsers.length > 0
          ? allUsers.map((u) => ({
              name: u.name || "Unknown",
              year: formatYearLabel(u),
              department: formatDepartmentLabel(u),
              id: formatStudentId(u),
            }))
          : [
              {
                name: "No members registered",
                year: "",
                department: "",
                id: "",
              },
            ];

      return {
        teamNo: idx + 1,
        teamName,
        members: memberRows,
      };
    });
  } else {
    individuals = registrations.map((reg, idx) => ({
      srNo: idx + 1,
      name: reg.userId?.name || "Unknown",
      year: formatYearLabel(reg.userId),
      department: formatDepartmentLabel(reg.userId),
      id: formatStudentId(reg.userId),
    }));
  }

  // Pagination planning:
  // Page 1 budget: ~22 member rows (accounts for header, event card image, title, and padded rows)
  // Page 2+ budget: ~30 member rows
  const PAGE1_ROW_BUDGET = 22;
  const SUBSEQUENT_PAGE_ROW_BUDGET = 30;

  const pagesData: {
    teams?: FormattedTeam[];
    individuals?: FormattedIndividual[];
  }[] = [];

  if (isTeam) {
    let currentPageTeams: FormattedTeam[] = [];
    let currentRowsCount = 0;
    let isFirstPage = true;

    for (const team of teams) {
      const budget = isFirstPage
        ? PAGE1_ROW_BUDGET
        : SUBSEQUENT_PAGE_ROW_BUDGET;
      const teamRows = team.members.length;

      if (
        currentRowsCount > 0 &&
        currentRowsCount + teamRows > budget
      ) {
        pagesData.push({ teams: currentPageTeams });
        currentPageTeams = [team];
        currentRowsCount = teamRows;
        isFirstPage = false;
      } else {
        currentPageTeams.push(team);
        currentRowsCount += teamRows;
      }
    }
    if (currentPageTeams.length > 0) {
      pagesData.push({ teams: currentPageTeams });
    }
  } else {
    let currentPageInd: FormattedIndividual[] = [];
    let currentRowsCount = 0;
    let isFirstPage = true;

    for (const ind of individuals) {
      const budget = isFirstPage
        ? PAGE1_ROW_BUDGET
        : SUBSEQUENT_PAGE_ROW_BUDGET;
      if (currentRowsCount >= budget) {
        pagesData.push({ individuals: currentPageInd });
        currentPageInd = [ind];
        currentRowsCount = 1;
        isFirstPage = false;
      } else {
        currentPageInd.push(ind);
        currentRowsCount += 1;
      }
    }
    if (currentPageInd.length > 0) {
      pagesData.push({ individuals: currentPageInd });
    }
  }

  if (pagesData.length === 0) {
    pagesData.push(isTeam ? { teams: [] } : { individuals: [] });
  }

  // Construct HTML
  const renderHeader = (pageNumber: number) => {
    if (pageNumber === 1) {
      return `
        <div class="header-box">
          <div class="header-left">
            <img src="${VPP_OFFICIAL_LOGO_BASE64}" class="college-logo" />
          </div>

          <div class="header-center">
            <div class="inst-line-1">VASANTDADA PATIL PRATISHTHAN'S</div>
            <div class="inst-line-2">COLLEGE OF ENGINEERING & VISUAL ARTS</div>
            <div class="inst-line-3">|| NAAC ACCREDITED WITH "A" GRADE || ISO 9001:2015 CERTIFIED INSTITUTE ||</div>
            <div class="inst-line-4">(AN AUTONOMOUS INSTITUTE AFFILIATED TO UNIVERSITY OF MUMBAI)</div>
            <div class="inst-line-5">${deptHeaderText}</div>
            <div class="inst-line-6">NBA ACCREDITED (Dated 01/07/2024 to 30/06/2027)</div>
          </div>

          <div class="header-right-spacer"></div>
        </div>

        ${
          coverDataUrl
            ? `
          <div class="cover-wrapper">
            <div class="cover-box">
              <img src="${coverDataUrl}" class="cover-img" />
            </div>
          </div>
        `
            : `
          <div class="cover-wrapper">
            <div class="cover-box fallback-cover">
              <div class="fallback-title">${event.name}</div>
            </div>
          </div>
        `
        }

        <div class="title-section">
          <div class="attendance-title">Attendance</div>
          <div class="attendance-date">Date: ${formattedDate}</div>
        </div>
      `;
    }

    return "";
  };

  const renderTableHead = () => {
    if (isTeam) {
      return `
        <thead>
          <tr>
            <th style="width: 7%;">Team No</th>
            <th style="width: 16%;">Team Name</th>
            <th style="width: 28%;">Name</th>
            <th style="width: 7%;">Year</th>
            <th style="width: 13%;">Department</th>
            <th style="width: 15%;">ID</th>
            <th style="width: 14%;">Signature</th>
          </tr>
        </thead>
      `;
    }

    return `
      <thead>
        <tr>
          <th style="width: 7%;">Sr No</th>
          <th style="width: 33%;">Name</th>
          <th style="width: 8%;">Year</th>
          <th style="width: 16%;">Department</th>
          <th style="width: 18%;">ID</th>
          <th style="width: 18%;">Signature</th>
        </tr>
      </thead>
    `;
  };

  const renderTableBody = (pageIndex: number) => {
    const pageItem = pagesData[pageIndex];

    if (isTeam) {
      const pageTeams = pageItem.teams || [];
      if (pageTeams.length === 0) {
        return `
          <tbody>
            <tr>
              <td colspan="7" style="text-align: center; padding: 20px;">No registrations recorded.</td>
            </tr>
          </tbody>
        `;
      }

      return `
        <tbody>
          ${pageTeams
            .map((t) => {
              return t.members
                .map((m, mIdx) => {
                  return `
                  <tr>
                    ${
                      mIdx === 0
                        ? `<td rowspan="${t.members.length}" class="cell-center font-medium">${t.teamNo}</td>`
                        : ""
                    }
                    <td class="cell-left font-medium">${t.teamName}</td>
                    <td class="cell-left">${m.name}</td>
                    <td class="cell-center">${m.year}</td>
                    <td class="cell-center">${m.department}</td>
                    <td class="cell-left id-text">${m.id}</td>
                    <td class="signature-cell"></td>
                  </tr>
                `;
                })
                .join("");
            })
            .join("")}
        </tbody>
      `;
    }

    const pageInds = pageItem.individuals || [];
    if (pageInds.length === 0) {
      return `
        <tbody>
          <tr>
            <td colspan="6" style="text-align: center; padding: 20px;">No registrations recorded.</td>
          </tr>
        </tbody>
      `;
    }

    return `
      <tbody>
        ${pageInds
          .map((ind) => {
            return `
            <tr>
              <td class="cell-center font-medium">${ind.srNo}</td>
              <td class="cell-left">${ind.name}</td>
              <td class="cell-center">${ind.year}</td>
              <td class="cell-center">${ind.department}</td>
              <td class="cell-left id-text">${ind.id}</td>
              <td class="signature-cell"></td>
            </tr>
          `;
          })
          .join("")}
      </tbody>
    `;
  };

  const pagesHtml = pagesData
    .map((_, idx) => {
      const pageNum = idx + 1;
      return `
      <div class="pdf-page" id="pdf-page-${pageNum}">
        ${renderHeader(pageNum)}
        <table class="attendance-table">
          ${renderTableHead()}
          ${renderTableBody(idx)}
        </table>
      </div>
    `;
    })
    .join("");

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            background: #ffffff;
            color: #000000;
            font-family: "Times New Roman", Times, Georgia, serif;
          }
          .pdf-page {
            width: 794px;
            min-height: 1123px;
            max-height: 1123px;
            height: 1123px;
            padding: 28px 36px;
            background: #ffffff;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
          }
          .header-box {
            border: 1.5px solid #000000;
            padding: 6px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .header-left {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 75px;
            flex-shrink: 0;
          }
          .college-logo {
            height: 56px;
            max-width: 72px;
            object-fit: contain;
          }
          .header-center {
            flex: 1;
            text-align: center;
            padding: 0 8px;
          }
          .inst-line-1 {
            font-size: 13.5px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            line-height: 1.2;
          }
          .inst-line-2 {
            font-size: 14.5px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-top: 1px;
            line-height: 1.2;
          }
          .inst-line-3 {
            font-size: 7.5px;
            font-weight: bold;
            margin-top: 2px;
            letter-spacing: 0.2px;
            line-height: 1.2;
          }
          .inst-line-4 {
            font-size: 8px;
            font-weight: 600;
            margin-top: 1px;
            line-height: 1.2;
          }
          .inst-line-5 {
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-top: 2px;
            text-transform: uppercase;
            line-height: 1.2;
          }
          .inst-line-6 {
            font-size: 8.5px;
            font-weight: bold;
            font-style: italic;
            margin-top: 1px;
            line-height: 1.2;
          }
          .header-right-spacer {
            width: 75px;
            flex-shrink: 0;
          }
          .cover-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 9px 0 6px;
          }
          .cover-box {
            width: 256px;
            height: 160px;
            border: 1.5px solid #000000;
            overflow: hidden;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .cover-img {
            width: 256px;
            height: 160px;
            display: block;
          }
          .fallback-cover {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #111827;
            padding: 12px;
            text-align: center;
          }
          .fallback-title {
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .title-section {
            text-align: center;
            margin: 6px 0 9px;
          }
          .attendance-title {
            font-size: 15px;
            font-weight: bold;
          }
          .attendance-date {
            font-size: 13px;
            margin-top: 1px;
          }

          .attendance-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #000000;
            font-size: 11px;
          }
          .attendance-table th,
          .attendance-table td {
            border: 1px solid #000000;
          }
          .attendance-table th {
            padding: 6px 4px;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
            background-color: #ffffff;
            line-height: 1.25;
          }
          .attendance-table td {
            padding: 5.5px 6px;
            line-height: 1.35;
            vertical-align: middle;
            word-break: break-word;
            box-sizing: border-box;
          }
          .cell-center {
            text-align: center;
          }
          .cell-left {
            text-align: left;
          }
          .font-medium {
            font-weight: bold;
          }
          .id-text {
            font-size: 10.5px;
            word-break: break-all;
            line-height: 1.25;
          }
          .signature-cell {
            background-color: #ffffff;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `;

  // Create isolated iframe to guarantee immunity from Next.js / Tailwind CSS
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "820px";
  iframe.style.height = "1200px";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Could not access iframe document");
    }

    iframeDoc.open();
    iframeDoc.write(fullHtml);
    iframeDoc.close();

    // Allow time for images to settle in DOM
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pageElements = iframeDoc.querySelectorAll(".pdf-page");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pageElements.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      const element = pageElements[i] as HTMLElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    }

    const safeName = (event.name || "Event").trim().replace(/\s+/g, "_");
    pdf.save(`${safeName}_Attendance.pdf`);
  } finally {
    document.body.removeChild(iframe);
  }
}
