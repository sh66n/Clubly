export const CERTIFICATE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const CERTIFICATE_MAX_TOKENS = 30;

export const CERTIFICATE_VARIABLE_KEYS = [
  "$name",
  "$year",
  "$rank",
  "$event",
  "$club",
  "$date",
  "$custom",
] as const;
export type CertificateVariableKey = (typeof CERTIFICATE_VARIABLE_KEYS)[number] | string;

export type CertificateFontCategory = "Calligraphy / Script" | "Serif & Luxury" | "Sans-Serif & Clean" | "Display & Modern" | "Standard / System";

export interface CertificateFontOption {
  value: string;
  label: string;
  category: CertificateFontCategory;
  googleFont?: boolean;
}

export const CERTIFICATE_FONT_OPTIONS: CertificateFontOption[] = [
  // Calligraphy & Script (Most popular for Certificates)
  { value: "Great Vibes", label: "Great Vibes", category: "Calligraphy / Script", googleFont: true },
  { value: "Alex Brush", label: "Alex Brush", category: "Calligraphy / Script", googleFont: true },
  { value: "Dancing Script", label: "Dancing Script", category: "Calligraphy / Script", googleFont: true },
  { value: "Allura", label: "Allura", category: "Calligraphy / Script", googleFont: true },
  { value: "Pinyon Script", label: "Pinyon Script", category: "Calligraphy / Script", googleFont: true },
  { value: "Parisienne", label: "Parisienne", category: "Calligraphy / Script", googleFont: true },
  { value: "Pacifico", label: "Pacifico", category: "Calligraphy / Script", googleFont: true },
  { value: "Sacramento", label: "Sacramento", category: "Calligraphy / Script", googleFont: true },
  { value: "Satisfy", label: "Satisfy", category: "Calligraphy / Script", googleFont: true },
  { value: "Tangerine", label: "Tangerine", category: "Calligraphy / Script", googleFont: true },
  { value: "MonteCarlo", label: "MonteCarlo", category: "Calligraphy / Script", googleFont: true },
  { value: "Courgette", label: "Courgette", category: "Calligraphy / Script", googleFont: true },
  { value: "Caveat", label: "Caveat", category: "Calligraphy / Script", googleFont: true },
  { value: "Italianno", label: "Italianno", category: "Calligraphy / Script", googleFont: true },
  { value: "Marck Script", label: "Marck Script", category: "Calligraphy / Script", googleFont: true },
  { value: "Herr Von Muellerhoff", label: "Herr Von Muellerhoff", category: "Calligraphy / Script", googleFont: true },

  // Serif & Luxury
  { value: "Cinzel", label: "Cinzel", category: "Serif & Luxury", googleFont: true },
  { value: "Cinzel Decorative", label: "Cinzel Decorative", category: "Serif & Luxury", googleFont: true },
  { value: "Playfair Display", label: "Playfair Display", category: "Serif & Luxury", googleFont: true },
  { value: "Cormorant Garamond", label: "Cormorant Garamond", category: "Serif & Luxury", googleFont: true },
  { value: "Bodoni Moda", label: "Bodoni Moda", category: "Serif & Luxury", googleFont: true },
  { value: "EB Garamond", label: "EB Garamond", category: "Serif & Luxury", googleFont: true },
  { value: "Merriweather", label: "Merriweather", category: "Serif & Luxury", googleFont: true },
  { value: "Prata", label: "Prata", category: "Serif & Luxury", googleFont: true },
  { value: "Lora", label: "Lora", category: "Serif & Luxury", googleFont: true },
  { value: "Libre Baskerville", label: "Libre Baskerville", category: "Serif & Luxury", googleFont: true },
  { value: "Spectral", label: "Spectral", category: "Serif & Luxury", googleFont: true },
  { value: "Marcellus", label: "Marcellus", category: "Serif & Luxury", googleFont: true },
  { value: "Noto Serif", label: "Noto Serif", category: "Serif & Luxury", googleFont: true },

  // Sans-Serif & Clean
  { value: "Montserrat", label: "Montserrat", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Poppins", label: "Poppins", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Inter", label: "Inter", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Roboto", label: "Roboto", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Open Sans", label: "Open Sans", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Lato", label: "Lato", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Raleway", label: "Raleway", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Oswald", label: "Oswald", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Bebas Neue", label: "Bebas Neue", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", category: "Sans-Serif & Clean", googleFont: true },
  { value: "DM Sans", label: "DM Sans", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Work Sans", label: "Work Sans", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Nunito", label: "Nunito", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Quicksand", label: "Quicksand", category: "Sans-Serif & Clean", googleFont: true },
  { value: "Urbanist", label: "Urbanist", category: "Sans-Serif & Clean", googleFont: true },

  // Display & Modern
  { value: "Anton", label: "Anton", category: "Display & Modern", googleFont: true },
  { value: "Righteous", label: "Righteous", category: "Display & Modern", googleFont: true },
  { value: "Abril Fatface", label: "Abril Fatface", category: "Display & Modern", googleFont: true },
  { value: "Bungee", label: "Bungee", category: "Display & Modern", googleFont: true },
  { value: "Comfortaa", label: "Comfortaa", category: "Display & Modern", googleFont: true },
  { value: "Lobster", label: "Lobster", category: "Display & Modern", googleFont: true },
  { value: "Alfa Slab One", label: "Alfa Slab One", category: "Display & Modern", googleFont: true },
  { value: "Shrikhand", label: "Shrikhand", category: "Display & Modern", googleFont: true },

  // Standard / System
  { value: "helvetica", label: "Helvetica", category: "Standard / System" },
  { value: "times", label: "Times New Roman", category: "Standard / System" },
  { value: "courier", label: "Courier New", category: "Standard / System" },
  { value: "georgia", label: "Georgia", category: "Standard / System" },
  { value: "arial", label: "Arial", category: "Standard / System" },
  { value: "verdana", label: "Verdana", category: "Standard / System" },
  { value: "impact", label: "Impact", category: "Standard / System" },
  { value: "trebuchet", label: "Trebuchet MS", category: "Standard / System" },
];

export type CertificateFontKey = string;

export type CertificateTextAlign = "left" | "center" | "right";

export interface CertificateTextToken {
  id: string;
  variable: CertificateVariableKey;
  x: number;
  y: number;
  fontSize: number;
  colorHex: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: CertificateTextAlign;
}

export interface CertificateLayout {
  tokens: CertificateTextToken[];
}

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
  id: `${variable.replace(/[^a-zA-Z0-9]/g, "") || "var"}-${Math.random().toString(36).slice(2, 9)}`,
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

const isValidVariable = (variable: string): boolean =>
  typeof variable === "string" && variable.trim().length >= 1 && variable.trim().length <= 50;

const isValidFont = (font: string): boolean =>
  typeof font === "string" && font.trim().length >= 1 && font.trim().length <= 80;

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

export interface LegacyCertificateNameConfig {
  preset: "center" | "lower-third" | "top-center";
  xOffset: number;
  yOffset: number;
  fontSize: number;
  colorHex: string;
}

export const convertLegacyNameConfigToLayout = (
  config?: LegacyCertificateNameConfig
): CertificateLayout | null => {
  if (!config) return null;

  let y = 0.5;
  if (config.preset === "lower-third") y = 0.7;
  else if (config.preset === "top-center") y = 0.3;

  return {
    tokens: [
      {
        id: "legacy-name",
        variable: "$name",
        x: 0.5 + (config.xOffset || 0) / 1000,
        y: y + (config.yOffset || 0) / 1000,
        fontSize: config.fontSize || 44,
        colorHex: config.colorHex || "#111111",
        fontFamily: "Great Vibes",
        bold: false,
        italic: false,
        align: "center",
      },
    ],
  };
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
