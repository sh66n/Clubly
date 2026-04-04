export const CERTIFICATE_MAX_SIZE_BYTES = 4 * 1024 * 1024;
export const CERTIFICATE_MAX_TOKENS = 10;

export const CERTIFICATE_VARIABLE_KEYS = ["$name", "$year", "$rank"] as const;
export type CertificateVariableKey = (typeof CERTIFICATE_VARIABLE_KEYS)[number];

export const CERTIFICATE_FONT_KEYS = ["helvetica", "times", "courier"] as const;
export type CertificateFontKey = (typeof CERTIFICATE_FONT_KEYS)[number];

export type CertificateTextAlign = "left" | "center" | "right";

export interface CertificateTextToken {
  id: string;
  variable: CertificateVariableKey;
  x: number;
  y: number;
  fontSize: number;
  colorHex: string;
  fontFamily: CertificateFontKey;
  bold: boolean;
  italic: boolean;
  align: CertificateTextAlign;
}

export interface CertificateLayout {
  tokens: CertificateTextToken[];
}

export interface LegacyCertificateNameConfig {
  preset: "center" | "lower-third" | "top-center";
  xOffset: number;
  yOffset: number;
  fontSize: number;
  colorHex: string;
}

export const convertLegacyNameConfigToLayout = (
  legacy?: LegacyCertificateNameConfig,
): CertificateLayout | null => {
  if (!legacy) return null;

  const baseY =
    legacy.preset === "top-center"
      ? 0.72
      : legacy.preset === "lower-third"
        ? 0.34
        : 0.5;
  const convertedX = clamp(0.5 + legacy.xOffset / 1200, 0, 1);
  const convertedY = clamp(baseY + legacy.yOffset / 1200, 0, 1);

  return {
    tokens: [
      {
        id: "name-legacy",
        variable: "$name",
        x: convertedX,
        y: convertedY,
        fontSize: clamp(legacy.fontSize || 44, 16, 120),
        colorHex: legacy.colorHex || "#111111",
        fontFamily: "helvetica",
        bold: true,
        italic: false,
        align: "center",
      },
    ],
  };
};

export const CERTIFICATE_FONT_OPTIONS: Array<{
  value: CertificateFontKey;
  label: string;
}> = [
  { value: "helvetica", label: "Helvetica" },
  { value: "times", label: "Times" },
  { value: "courier", label: "Courier" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toSafeNumber = (value: FormDataEntryValue | null, fallback: number) => {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const createToken = (
  variable: CertificateVariableKey,
  x: number,
  y: number,
): CertificateTextToken => ({
  id: `${variable.replace("$", "")}-${Math.random().toString(36).slice(2, 9)}`,
  variable,
  x,
  y,
  fontSize: 44,
  colorHex: "#111111",
  fontFamily: "helvetica",
  bold: true,
  italic: false,
  align: "center",
});

export const getDefaultCertificateLayout = (): CertificateLayout => ({
  tokens: [
    createToken("$name", 0.5, 0.52),
    createToken("$year", 0.2, 0.28),
    createToken("$rank", 0.8, 0.28),
  ],
});

const isValidId = (id: string) => /^[a-zA-Z0-9$-_.]{2,40}$/.test(id);

const isValidVariable = (
  variable: string,
): variable is CertificateVariableKey =>
  CERTIFICATE_VARIABLE_KEYS.includes(variable as CertificateVariableKey);

const isValidFont = (font: string): font is CertificateFontKey =>
  CERTIFICATE_FONT_KEYS.includes(font as CertificateFontKey);

const isValidAlign = (align: string): align is CertificateTextAlign =>
  ["left", "center", "right"].includes(align);

export const validateCertificateLayout = (
  layout: unknown,
):
  | { valid: true; layout: CertificateLayout }
  | { valid: false; error: string } => {
  if (!layout || typeof layout !== "object") {
    return { valid: false, error: "Invalid certificate layout" };
  }

  const tokens = (layout as { tokens?: unknown }).tokens;
  if (!Array.isArray(tokens)) {
    return {
      valid: false,
      error: "Certificate layout must include tokens array",
    };
  }

  if (tokens.length < 1) {
    return { valid: false, error: "Add at least one certificate variable" };
  }

  if (tokens.length > CERTIFICATE_MAX_TOKENS) {
    return {
      valid: false,
      error: `Maximum ${CERTIFICATE_MAX_TOKENS} certificate variables are allowed`,
    };
  }

  const seenVariables = new Set<string>();
  const normalizedTokens: CertificateTextToken[] = [];

  for (const rawToken of tokens) {
    if (!rawToken || typeof rawToken !== "object") {
      return { valid: false, error: "Invalid certificate token" };
    }

    const token = rawToken as Record<string, unknown>;
    const id = String(token.id ?? "").trim();
    const variable = String(token.variable ?? "").trim();
    const fontFamily = String(token.fontFamily ?? "helvetica").trim();
    const align = String(token.align ?? "center").trim();
    const colorHex = String(token.colorHex ?? "#111111").trim();

    if (!isValidId(id)) {
      return { valid: false, error: "Invalid certificate token id" };
    }

    if (!isValidVariable(variable)) {
      return {
        valid: false,
        error: `Unsupported certificate variable: ${variable}`,
      };
    }

    if (seenVariables.has(variable)) {
      return {
        valid: false,
        error: `Duplicate variable placement for ${variable}`,
      };
    }
    seenVariables.add(variable);

    if (!isValidFont(fontFamily)) {
      return { valid: false, error: "Invalid certificate font" };
    }

    if (!isValidAlign(align)) {
      return { valid: false, error: "Invalid certificate text alignment" };
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(colorHex)) {
      return { valid: false, error: "Invalid certificate text color" };
    }

    const x = clamp(Number(token.x), 0, 1);
    const y = clamp(Number(token.y), 0, 1);
    const fontSize = clamp(Number(token.fontSize), 16, 120);

    normalizedTokens.push({
      id,
      variable,
      x: Number.isFinite(x) ? x : 0.5,
      y: Number.isFinite(y) ? y : 0.5,
      fontSize: Number.isFinite(fontSize) ? fontSize : 44,
      colorHex: colorHex.toUpperCase(),
      fontFamily,
      bold: Boolean(token.bold),
      italic: Boolean(token.italic),
      align,
    });
  }

  return { valid: true, layout: { tokens: normalizedTokens } };
};

export const parseCertificateLayoutFromFormData = (
  formData: FormData,
):
  | { valid: true; provided: boolean; layout?: CertificateLayout }
  | { valid: false; error: string } => {
  const rawLayout = formData.get("certificateLayout");
  if (typeof rawLayout === "string" && rawLayout.trim()) {
    try {
      const parsed = JSON.parse(rawLayout);
      const validated = validateCertificateLayout(parsed);
      if (!validated.valid) return validated;
      return { valid: true, provided: true, layout: validated.layout };
    } catch {
      return { valid: false, error: "Invalid certificateLayout payload" };
    }
  }

  const hasLegacyFields =
    formData.has("certificateNamePreset") ||
    formData.has("certificateNameXOffset") ||
    formData.has("certificateNameYOffset") ||
    formData.has("certificateNameFontSize") ||
    formData.has("certificateNameColor");

  if (!hasLegacyFields) {
    return { valid: true, provided: false };
  }

  const presetRaw = formData.get("certificateNamePreset");
  const preset = typeof presetRaw === "string" ? presetRaw : "center";

  if (!["center", "lower-third", "top-center"].includes(preset)) {
    return { valid: false, error: "Invalid certificate name preset" };
  }

  const xOffset = clamp(
    toSafeNumber(formData.get("certificateNameXOffset"), 0),
    -500,
    500,
  );
  const yOffset = clamp(
    toSafeNumber(formData.get("certificateNameYOffset"), 0),
    -500,
    500,
  );
  const fontSize = clamp(
    toSafeNumber(formData.get("certificateNameFontSize"), 44),
    16,
    120,
  );

  const colorRaw = formData.get("certificateNameColor");
  const colorHex = typeof colorRaw === "string" ? colorRaw.trim() : "#111111";
  if (!/^#[0-9a-fA-F]{6}$/.test(colorHex)) {
    return { valid: false, error: "Invalid certificate text color" };
  }

  const layout = convertLegacyNameConfigToLayout({
    preset: preset as LegacyCertificateNameConfig["preset"],
    xOffset,
    yOffset,
    fontSize,
    colorHex: colorHex.toUpperCase(),
  });

  return { valid: true, provided: true, layout: layout ?? undefined };
};

export const validateCertificateTemplateFile = (
  file: File,
): { valid: true } | { valid: false; error: string } => {
  if (!file.type?.startsWith("image/")) {
    return { valid: false, error: "Certificate template must be an image" };
  }

  if (file.size > CERTIFICATE_MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: "Certificate template must be less than 4MB",
    };
  }

  return { valid: true };
};

export const hexColorToRgb = (hexColor: string) => {
  const normalized = hexColor.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  return { r, g, b };
};

export const formatYearLabel = (year?: number | null): string => {
  const map: Record<number, string> = {
    1: "FE",
    2: "SE",
    3: "TE",
    4: "BE",
  };

  if (!year || !map[year]) return "N/A";
  return map[year];
};

export const inferYearFromEmail = (email?: string | null): string => {
  if (!email || !email.endsWith("@pvppcoe.ac.in")) return "N/A";

  const match = email.match(/\d{4}/);
  if (!match) return "N/A";

  const isDSE = email.substring(0, 4).toLowerCase().endsWith("s");
  const startYearShort = parseInt(match[0].substring(0, 2), 10);
  const currentYearShort = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth();
  const adjustedCurrentYear =
    currentMonth < 6 ? currentYearShort - 1 : currentYearShort;

  let diff = adjustedCurrentYear - startYearShort + 1;
  if (isDSE) diff += 1;

  const yearMap: Record<number, string> = {
    1: "FE",
    2: "SE",
    3: "TE",
    4: "BE",
  };

  return yearMap[diff] || "N/A";
};
