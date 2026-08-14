"use client";

import {
  CERTIFICATE_FONT_OPTIONS,
  CERTIFICATE_VARIABLE_KEYS,
  CertificateFontCategory,
  CertificateLayout,
  CertificateTextToken,
  CertificateVariableKey,
} from "@/lib/certificate";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  Bold,
  Italic,
  Trash2,
  Search,
  ChevronDown,
  Sparkles,
  Check,
  X,
  Plus,
  Copy,
  Layers,
  Type,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Grid,
  Sliders,
  Move,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface CertificateLayoutEditorProps {
  templatePreviewUrl: string | null;
  layout: CertificateLayout;
  onChange: (layout: CertificateLayout) => void;
  certificateName?: string;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  isDraft?: boolean;
  onBackToUpload?: () => void;
}

const SAMPLE_TEXT: Record<string, string> = {
  $name: "Aarav S. Patil",
  $year: "Third Year (TE)",
  $rank: "1st Place Winner",
  $event: "HackNova Hackathon 2026",
  $club: "Developers Club",
  $date: "August 15, 2026",
  $custom: "Certificate of Appreciation",
};

const COLOR_PRESETS = [
  "#111111",
  "#1E293B",
  "#D97706", // Gold
  "#B45309", // Deep Gold
  "#047857", // Emerald
  "#1E40AF", // Navy Blue
  "#6B21A8", // Purple
  "#BE123C", // Crimson
  "#FFFFFF",
  "#64748B",
];

const PRESET_STYLES = [
  {
    name: "Luxury Gold Script",
    fontFamily: "Great Vibes",
    fontSize: 56,
    colorHex: "#D97706",
    bold: false,
    italic: false,
  },
  {
    name: "Classic Formal Serif",
    fontFamily: "Cinzel",
    fontSize: 44,
    colorHex: "#111111",
    bold: true,
    italic: false,
  },
  {
    name: "Modern Clean Sans",
    fontFamily: "Montserrat",
    fontSize: 40,
    colorHex: "#1E293B",
    bold: true,
    italic: false,
  },
  {
    name: "Elegant Calligraphy",
    fontFamily: "Alex Brush",
    fontSize: 52,
    colorHex: "#1E40AF",
    bold: false,
    italic: false,
  },
];

const SYSTEM_FONT_STACK: Record<string, string> = {
  helvetica: "Helvetica, Arial, sans-serif",
  times: "'Times New Roman', Times, serif",
  courier: "'Courier New', Courier, monospace",
  georgia: "Georgia, serif",
  arial: "Arial, sans-serif",
  verdana: "Verdana, sans-serif",
  impact: "Impact, sans-serif",
  trebuchet: "'Trebuchet MS', sans-serif",
};

const getFontFamilyCss = (fontFamily: string) => {
  const normalized = (fontFamily || "helvetica").toLowerCase().trim();
  if (SYSTEM_FONT_STACK[normalized]) {
    return SYSTEM_FONT_STACK[normalized];
  }
  return `"${fontFamily}", cursive, serif, sans-serif`;
};

const loadGoogleFont = (fontFamily: string) => {
  if (typeof document === "undefined" || !fontFamily) return;
  const lower = fontFamily.toLowerCase().trim();
  if (SYSTEM_FONT_STACK[lower]) return;

  const fontId = `gfont-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    document.head.appendChild(link);
  }
};

const createToken = (
  variable: CertificateVariableKey,
  x: number = 0.5,
  y: number = 0.5,
): CertificateTextToken => ({
  id: `${variable.replace("$", "")}-${Math.random().toString(36).slice(2, 8)}`,
  variable,
  x,
  y,
  fontSize: 46,
  colorHex: "#111111",
  fontFamily: variable === "$name" ? "Great Vibes" : "Cinzel",
  bold: variable !== "$name",
  italic: false,
  align: "center",
});

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const measureTextMetrics = (
  text: string,
  token: CertificateTextToken,
  fontSizePx: number,
) => {
  if (typeof document === "undefined") {
    return {
      width: Math.max(1, text.length * fontSizePx * 0.55),
      ascent: fontSizePx * 0.8,
    };
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return {
      width: Math.max(1, text.length * fontSizePx * 0.55),
      ascent: fontSizePx * 0.8,
    };
  }

  const weight = token.bold ? "700" : "400";
  const style = token.italic ? "italic" : "normal";
  ctx.font = `${style} ${weight} ${fontSizePx}px ${getFontFamilyCss(token.fontFamily)}`;

  const metrics = ctx.measureText(text);
  const ascent =
    metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxAscent > 0
      ? metrics.actualBoundingBoxAscent
      : fontSizePx * 0.8;

  return {
    width: Math.max(1, metrics.width),
    ascent,
  };
};

type RenderBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
};

const FALLBACK_RENDER_BOX: RenderBox = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  scale: 1,
};

const FONT_CATEGORIES: Array<"All" | CertificateFontCategory> = [
  "All",
  "Calligraphy / Script",
  "Serif & Luxury",
  "Sans-Serif & Clean",
  "Display & Modern",
  "Standard / System",
];

export default function CertificateLayoutEditor({
  templatePreviewUrl,
  layout,
  onChange,
  certificateName,
  onSaveDraft,
  onPublish,
  isSaving,
  isDraft,
  onBackToUpload,
}: CertificateLayoutEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragTokenRef = useRef<{ id: string; startX: number; startY: number } | null>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const fontButtonRef = useRef<HTMLButtonElement>(null);

  const [activeTab, setActiveTab] = useState<"text" | "layers" | "styles">("text");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showSampleText, setShowSampleText] = useState<boolean>(true);
  const [snapLines, setSnapLines] = useState<{ x?: number; y?: number }>({});

  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });
  const [renderBox, setRenderBox] = useState<RenderBox>(FALLBACK_RENDER_BOX);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(
    layout.tokens[0]?.id ?? null,
  );

  // Font Picker State
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [fontSearch, setFontSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | CertificateFontCategory>("All");
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Load Google Fonts for active tokens
  useEffect(() => {
    layout.tokens.forEach((token) => {
      if (token.fontFamily) {
        loadGoogleFont(token.fontFamily);
      }
    });
  }, [layout.tokens]);

  const updatePopoverPosition = () => {
    if (fontButtonRef.current) {
      const rect = fontButtonRef.current.getBoundingClientRect();
      const popoverWidth = Math.min(384, window.innerWidth - 32);
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - popoverWidth - 16);
      }
      setPopoverCoords({
        top: rect.bottom + 8,
        left: Math.max(16, left),
      });
    }
  };

  // Close font picker on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        fontDropdownRef.current &&
        !fontDropdownRef.current.contains(e.target as Node) &&
        fontButtonRef.current &&
        !fontButtonRef.current.contains(e.target as Node)
      ) {
        setIsFontPickerOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFontPickerOpen(false);
      }
    };

    if (isFontPickerOpen) {
      updatePopoverPosition();
      const handleReposition = () => updatePopoverPosition();
      window.addEventListener("resize", handleReposition);
      window.addEventListener("scroll", handleReposition, true);
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("resize", handleReposition);
        window.removeEventListener("scroll", handleReposition, true);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isFontPickerOpen]);

  // Keep selected token valid
  useEffect(() => {
    if (!layout.tokens.length) {
      setSelectedTokenId(null);
      return;
    }

    if (
      !selectedTokenId ||
      !layout.tokens.some((token) => token.id === selectedTokenId)
    ) {
      setSelectedTokenId(layout.tokens[0].id);
    }
  }, [layout.tokens, selectedTokenId]);

  const selectedToken = useMemo(
    () => layout.tokens.find((token) => token.id === selectedTokenId),
    [layout.tokens, selectedTokenId],
  );

  const updateToken = useCallback(
    (tokenId: string, patch: Partial<CertificateTextToken>) => {
      onChange({
        tokens: layout.tokens.map((token) =>
          token.id === tokenId ? { ...token, ...patch } : token,
        ),
      });
    },
    [layout.tokens, onChange],
  );

  const removeToken = (tokenId: string) => {
    onChange({ tokens: layout.tokens.filter((token) => token.id !== tokenId) });
  };

  const duplicateToken = (tokenId: string) => {
    const target = layout.tokens.find((t) => t.id === tokenId);
    if (!target) return;
    const newToken: CertificateTextToken = {
      ...target,
      id: `${target.variable.replace("$", "")}-${Math.random().toString(36).slice(2, 8)}`,
      x: clamp01(target.x + 0.04),
      y: clamp01(target.y - 0.04),
    };
    onChange({ tokens: [...layout.tokens, newToken] });
    setSelectedTokenId(newToken.id);
  };

  // Keyboard navigation & deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedToken) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const step = e.shiftKey ? 0.05 : 0.01;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        updateToken(selectedToken.id, { x: clamp01(selectedToken.x - step) });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        updateToken(selectedToken.id, { x: clamp01(selectedToken.x + step) });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        updateToken(selectedToken.id, { y: clamp01(selectedToken.y + step) });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        updateToken(selectedToken.id, { y: clamp01(selectedToken.y - step) });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeToken(selectedToken.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedToken, updateToken]);

  // Compute canvas render dimensions
  useEffect(() => {
    const computeRenderBox = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      if (containerWidth <= 0 || containerHeight <= 0) return;

      const naturalWidth = imageNaturalSize.width || 1920;
      const naturalHeight = imageNaturalSize.height || 1080;
      const baseScale = Math.min(
        containerWidth / naturalWidth,
        containerHeight / naturalHeight,
      );

      const zoomMultiplier = zoomLevel / 100;
      const scale = baseScale * zoomMultiplier;

      const width = naturalWidth * scale;
      const height = naturalHeight * scale;
      const x = (containerWidth - width) / 2;
      const y = (containerHeight - height) / 2;

      setRenderBox({ x, y, width, height, scale });
    };

    computeRenderBox();
    window.addEventListener("resize", computeRenderBox);

    return () => {
      window.removeEventListener("resize", computeRenderBox);
    };
  }, [imageNaturalSize, templatePreviewUrl, zoomLevel]);

  // Mouse Dragging with smart center snapping
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!dragTokenRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const activeBox = renderBox.width > 1 ? renderBox : FALLBACK_RENDER_BOX;

      let rawX = (localX - activeBox.x) / activeBox.width;
      let rawY = 1 - (localY - activeBox.y) / activeBox.height;

      // Smart Snapping to Center (horizontal 0.5 & vertical 0.5)
      const newSnap: { x?: number; y?: number } = {};
      if (Math.abs(rawX - 0.5) < 0.018) {
        rawX = 0.5;
        newSnap.x = activeBox.x + 0.5 * activeBox.width;
      }
      if (Math.abs(rawY - 0.5) < 0.018) {
        rawY = 0.5;
        newSnap.y = activeBox.y + 0.5 * activeBox.height;
      }

      setSnapLines(newSnap);
      updateToken(dragTokenRef.current.id, {
        x: clamp01(rawX),
        y: clamp01(rawY),
      });
    };

    const onUp = () => {
      dragTokenRef.current = null;
      setSnapLines({});
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [renderBox, updateToken]);

  const [customVariableInput, setCustomVariableInput] = useState("");

  const variableCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    layout.tokens.forEach((token) => {
      counts[token.variable] = (counts[token.variable] || 0) + 1;
    });
    return counts;
  }, [layout.tokens]);

  const filteredFonts = useMemo(() => {
    const query = fontSearch.toLowerCase().trim();
    return CERTIFICATE_FONT_OPTIONS.filter((f) => {
      const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      const matchesSearch = !query || f.label.toLowerCase().includes(query) || f.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [fontSearch, selectedCategory]);

  return (
    <div className="w-full bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[780px]">
      {/* ── Studio Top Command Bar (Light Mode) ── */}
      <div className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        {/* Left branding & certificate info */}
        <div className="flex items-center gap-3">
          {onBackToUpload && (
            <button
              type="button"
              onClick={onBackToUpload}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Back to Step 1"
            >
              ←
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-[320px]">
                {certificateName || "Untitled Certificate"}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  isDraft
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isDraft ? "Draft Studio" : "Published"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Canva-style Design Editor</p>
          </div>
        </div>

        {/* Center Canvas View Controls */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setShowSampleText(!showSampleText)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              showSampleText ? "bg-emerald-100 text-emerald-800" : "text-slate-500 hover:text-slate-800"
            }`}
            title="Toggle between sample data and variable tokens"
          >
            {showSampleText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showSampleText ? "Preview" : "Variables"}</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-200" />

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showGrid ? "bg-slate-200 text-slate-800" : "text-slate-500 hover:text-slate-800"
            }`}
            title="Toggle Studio Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200" />

          {/* Zoom Stepper */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-md"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 w-9 text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-md"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold ml-1"
              title="Reset Zoom"
            >
              Fit
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </button>
          )}

          {onPublish && (
            <button
              type="button"
              onClick={onPublish}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Check className="w-4 h-4" />
              {isDraft ? "Publish Certificate" : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* ── Studio Floating Context Toolbar (Light Mode) ── */}
      {selectedToken && (
        <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3 overflow-x-auto scrollbar-hide shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider shrink-0 bg-emerald-100 border border-emerald-300/80 px-2.5 py-1 rounded-lg">
            {selectedToken.variable}
          </span>

          {/* Canva Font Selector Dropdown */}
          <div className="relative shrink-0">
            <button
              ref={fontButtonRef}
              type="button"
              onClick={() => {
                setIsFontPickerOpen(!isFontPickerOpen);
                CERTIFICATE_FONT_OPTIONS.slice(0, 15).forEach((f) => loadGoogleFont(f.value));
              }}
              className="flex items-center justify-between gap-2 min-w-[160px] h-[36px] px-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:border-emerald-500 shadow-2xs transition-all text-left cursor-pointer"
            >
              <span
                className="truncate max-w-[110px]"
                style={{ fontFamily: getFontFamilyCss(selectedToken.fontFamily) }}
              >
                {selectedToken.fontFamily}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Popover / Modal (Fixed Positioning via Portal to escape parent overflow clipping) */}
            {isFontPickerOpen && typeof document !== 'undefined' && createPortal(
              <>
                <div
                  className="fixed inset-0 z-[9990] bg-slate-900/10 backdrop-blur-[0.5px]"
                  onClick={() => setIsFontPickerOpen(false)}
                />
                <div
                  ref={fontDropdownRef}
                  style={{
                    position: "fixed",
                    top: `${popoverCoords.top}px`,
                    left: `${popoverCoords.left}px`,
                  }}
                  className="z-[9999] w-[calc(100vw-32px)] sm:w-96 max-h-[460px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10"
                >
                  <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fontSearch}
                        onChange={(e) => setFontSearch(e.target.value)}
                        placeholder="Search 50+ Canva & Google Fonts..."
                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-800 placeholder:text-slate-400 shadow-inner"
                        autoFocus
                      />
                      {fontSearch && (
                        <button
                          type="button"
                          onClick={() => setFontSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-hide">
                      {FONT_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
                            selectedCategory === cat
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
                          }`}
                        >
                          {cat === "Calligraphy / Script"
                            ? "Script"
                            : cat === "Sans-Serif & Clean"
                            ? "Sans"
                            : cat === "Serif & Luxury"
                            ? "Serif"
                            : cat === "Standard / System"
                            ? "System"
                            : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-[340px] p-2 divide-y divide-slate-50">
                    {filteredFonts.length === 0 ? (
                      <div className="p-5 text-center">
                        <p className="text-xs text-slate-500 mb-2">No fonts matched "{fontSearch}"</p>
                        {fontSearch.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              const customName = fontSearch.trim();
                              loadGoogleFont(customName);
                              updateToken(selectedToken.id, { fontFamily: customName });
                              setIsFontPickerOpen(false);
                            }}
                            className="px-3.5 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            Use "{fontSearch.trim()}" from Google Fonts
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredFonts.map((font) => {
                        const isSelected = selectedToken.fontFamily.toLowerCase() === font.value.toLowerCase();
                        return (
                          <button
                            key={font.value}
                            type="button"
                            onMouseEnter={() => loadGoogleFont(font.value)}
                            onClick={() => {
                              loadGoogleFont(font.value);
                              updateToken(selectedToken.id, { fontFamily: font.value });
                              setIsFontPickerOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                              isSelected
                                ? "bg-emerald-50 text-emerald-800 font-semibold"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div
                                className="text-base truncate"
                                style={{ fontFamily: getFontFamilyCss(font.value) }}
                              >
                                {font.label}
                              </div>
                              <span className="text-[10px] text-slate-400 font-sans">
                                {font.category}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>,
              document.body
            )}
          </div>

          {/* Font Size Stepper */}
          <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden h-[36px] shrink-0 shadow-2xs">
            <button
              type="button"
              className="px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold"
              onClick={() =>
                updateToken(selectedToken.id, {
                  fontSize: Math.max(16, selectedToken.fontSize - 2),
                })
              }
            >
              -
            </button>
            <input
              type="number"
              min={16}
              max={120}
              value={selectedToken.fontSize}
              onChange={(event) =>
                updateToken(selectedToken.id, {
                  fontSize: Number(event.target.value || 44),
                })
              }
              className="w-10 text-center text-xs font-semibold text-slate-800 bg-transparent outline-none border-x border-slate-200 h-full"
            />
            <button
              type="button"
              className="px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold"
              onClick={() =>
                updateToken(selectedToken.id, {
                  fontSize: Math.min(120, selectedToken.fontSize + 2),
                })
              }
            >
              +
            </button>
          </div>

          {/* Color Picker & Preset Swatches */}
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="color"
              value={selectedToken.colorHex}
              onChange={(e) => updateToken(selectedToken.id, { colorHex: e.target.value })}
              className="h-[36px] w-10 rounded-xl border border-slate-300 bg-white cursor-pointer p-0.5 shadow-2xs"
              title="Pick custom color"
            />
            <div className="hidden xl:flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              {COLOR_PRESETS.slice(0, 6).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateToken(selectedToken.id, { colorHex: c })}
                  className={`w-5 h-5 rounded-full border transition-transform ${
                    selectedToken.colorHex.toLowerCase() === c.toLowerCase()
                      ? "scale-110 border-slate-800 ring-2 ring-emerald-500"
                      : "border-slate-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Bold, Italic */}
          <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden h-[36px] shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { bold: !selectedToken.bold })}
              className={`px-3 h-full flex items-center justify-center border-r border-slate-200 transition-colors ${
                selectedToken.bold ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-600 hover:bg-slate-50"
              }`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { italic: !selectedToken.italic })}
              className={`px-3 h-full flex items-center justify-center transition-colors ${
                selectedToken.italic ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-600 hover:bg-slate-50"
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden h-[36px] shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { align: "left" })}
              className={`px-3 h-full flex items-center justify-center border-r border-slate-200 transition-colors ${
                selectedToken.align === "left" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { align: "center" })}
              className={`px-3 h-full flex items-center justify-center border-r border-slate-200 transition-colors ${
                selectedToken.align === "center" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { align: "right" })}
              className={`px-3 h-full flex items-center justify-center transition-colors ${
                selectedToken.align === "right" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Center Helpers */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { x: 0.5 })}
              className="p-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-600 hover:text-slate-900 text-xs shadow-2xs"
              title="Center Horizontally (X: 50%)"
            >
              <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { y: 0.5 })}
              className="p-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-600 hover:text-slate-900 text-xs shadow-2xs"
              title="Center Vertically (Y: 50%)"
            >
              <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-[1px] h-5 bg-slate-300 shrink-0" />

          {/* Duplicate & Delete */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <button
              type="button"
              onClick={() => duplicateToken(selectedToken.id)}
              className="p-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 shadow-2xs"
              title="Duplicate variable"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => removeToken(selectedToken.id)}
              className="p-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 shadow-2xs"
              title="Delete variable"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Studio Workspace Body (Left Sidebar + Center Canvas + Right Inspector) ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[640px]">
        {/* ── Left Tools Sidebar (Light Mode) ── */}
        <div className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/70">
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "text"
                  ? "border-emerald-600 text-emerald-700 bg-white shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Type className="w-3.5 h-3.5" /> Variables
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("layers")}
              className={`py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "layers"
                  ? "border-emerald-600 text-emerald-700 bg-white shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Layers ({layout.tokens.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("styles")}
              className={`py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "styles"
                  ? "border-emerald-600 text-emerald-700 bg-white shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Presets
            </button>
          </div>

          {/* Left Panel Content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {activeTab === "text" && (
              <div className="space-y-4">
                {/* Standard Variables Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      Dynamic Variables
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {layout.tokens.length}/30 tokens
                    </span>
                  </div>

                  <div className="space-y-2">
                    {CERTIFICATE_VARIABLE_KEYS.map((variable) => {
                      const count = variableCounts[variable] || 0;
                      const label =
                        variable === "$name"
                          ? "Participant / Winner Name"
                          : variable === "$year"
                          ? "Academic Year (e.g. SE, TE)"
                          : variable === "$rank"
                          ? "Rank / Award Position"
                          : variable === "$event"
                          ? "Event Name / Title"
                          : variable === "$club"
                          ? "Club / Organization"
                          : variable === "$date"
                          ? "Issue Date (Formatted)"
                          : "Custom Text Heading";

                      const isLimitReached = layout.tokens.length >= 30;

                      return (
                        <button
                          key={variable}
                          type="button"
                          disabled={isLimitReached}
                          onClick={() => {
                            if (isLimitReached) return;
                            const token = createToken(variable, 0.5, 0.5);
                            onChange({ tokens: [...layout.tokens, token] });
                            setSelectedTokenId(token.id);
                          }}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            isLimitReached
                              ? "border-slate-200 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed"
                              : "border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 text-slate-800 shadow-2xs group cursor-pointer"
                          }`}
                        >
                          <div>
                            <div className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" /> {variable}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
                          </div>
                          {count > 0 ? (
                            <span className="text-[10px] bg-emerald-100/70 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                              {count} on canvas
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white font-bold px-2.5 py-1 rounded-lg transition-colors">
                              + Add
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Text / Custom Variable Input */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Add Custom Text / Field
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const trimmed = customVariableInput.trim();
                      if (!trimmed || layout.tokens.length >= 30) return;
                      const token = createToken(trimmed, 0.5, 0.5);
                      onChange({ tokens: [...layout.tokens, token] });
                      setSelectedTokenId(token.id);
                      setCustomVariableInput("");
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={customVariableInput}
                      onChange={(e) => setCustomVariableInput(e.target.value)}
                      placeholder="e.g. Certificate of Merit, $mentor..."
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!customVariableInput.trim() || layout.tokens.length >= 30}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </form>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                    <Move className="w-3.5 h-3.5 text-emerald-600" /> Canvas Shortcuts:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                    <li>Drag elements to position them</li>
                    <li>Arrow keys to nudge 1%</li>
                    <li>Shift + Arrow keys to nudge 5%</li>
                    <li>Duplicate button in top toolbar</li>
                    <li>Delete / Backspace to remove</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "layers" && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Layer Hierarchy
                </div>
                {layout.tokens.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No variables placed yet.</p>
                ) : (
                  layout.tokens.map((token, index) => {
                    const isSelected = selectedTokenId === token.id;
                    return (
                      <div
                        key={token.id}
                        onClick={() => setSelectedTokenId(token.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-2xs font-medium"
                            : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono text-slate-400 w-4">{index + 1}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-emerald-700 font-mono truncate">
                              {token.variable}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate font-sans">
                              {token.fontFamily} · {token.fontSize}px
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeToken(token.id);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "styles" && (
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Quick Style Presets
                </div>
                <div className="space-y-2">
                  {PRESET_STYLES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        if (!selectedToken) return;
                        loadGoogleFont(preset.fontFamily);
                        updateToken(selectedToken.id, {
                          fontFamily: preset.fontFamily,
                          fontSize: preset.fontSize,
                          colorHex: preset.colorHex,
                          bold: preset.bold,
                          italic: preset.italic,
                        });
                      }}
                      disabled={!selectedToken}
                      className="w-full p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs text-left disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <div className="text-xs font-semibold text-slate-800">{preset.name}</div>
                      <div
                        className="text-base text-slate-800 mt-1 truncate"
                        style={{ fontFamily: getFontFamilyCss(preset.fontFamily), color: preset.colorHex }}
                      >
                        Sample Preview Text
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Center Studio Canvas Area (Light Mode Drafting Studio) ── */}
        <div
          className={`flex-1 relative bg-slate-100 flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none ${
            showGrid
              ? "bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]"
              : ""
          }`}
        >
          {/* Canvas Wrapper (The Certificate Page) */}
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/10] max-h-[580px] rounded-2xl overflow-hidden border-2 border-slate-300 shadow-xl bg-white transition-all"
          >
            {/* Background Template */}
            {templatePreviewUrl ? (
              <img
                src={templatePreviewUrl}
                alt="Certificate Template"
                onLoad={(event) => {
                  const image = event.currentTarget;
                  setImageNaturalSize({
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                  });
                }}
                className="w-full h-full object-contain pointer-events-none"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 px-4 text-center bg-slate-50">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center mb-3">
                  <span className="text-2xl">🖼️</span>
                </div>
                <p className="font-semibold text-slate-600">No template background loaded</p>
              </div>
            )}

            {/* Smart Snap Alignment Lines */}
            {snapLines.x !== undefined && (
              <div
                className="absolute top-0 bottom-0 w-[1.5px] bg-pink-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(236,72,153,0.6)]"
                style={{ left: `${snapLines.x}px` }}
              />
            )}
            {snapLines.y !== undefined && (
              <div
                className="absolute left-0 right-0 h-[1.5px] bg-pink-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(236,72,153,0.6)]"
                style={{ top: `${snapLines.y}px` }}
              />
            )}

            {/* Render Draggable Variables Tokens */}
            {layout.tokens.map((token) => {
              const activeBox = renderBox.width > 1 ? renderBox : FALLBACK_RENDER_BOX;
              const anchorX = activeBox.x + token.x * activeBox.width;
              const baselineY = activeBox.y + (1 - token.y) * activeBox.height;
              const fontSizePx = Math.max(8, token.fontSize * activeBox.scale);
              const displayText = showSampleText ? SAMPLE_TEXT[token.variable] || token.variable : token.variable;
              const metrics = measureTextMetrics(displayText, token, fontSizePx);

              let leftPx = anchorX;
              if (token.align === "center") {
                leftPx = anchorX - metrics.width / 2;
              } else if (token.align === "right") {
                leftPx = anchorX - metrics.width;
              }

              const topPx = baselineY - metrics.ascent;
              const isSelected = selectedTokenId === token.id;

              return (
                <div
                  key={token.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    dragTokenRef.current = { id: token.id, startX: event.clientX, startY: event.clientY };
                    setSelectedTokenId(token.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTokenId(token.id);
                  }}
                  className={`absolute select-none whitespace-nowrap leading-none cursor-move transition-shadow group ${
                    isSelected
                      ? "outline-2 outline-emerald-500 ring-4 ring-emerald-500/20 z-20"
                      : "hover:outline hover:outline-1 hover:outline-emerald-400 z-10"
                  }`}
                  style={{
                    left: `${leftPx}px`,
                    top: `${topPx}px`,
                    color: token.colorHex,
                    fontFamily: getFontFamilyCss(token.fontFamily),
                    fontWeight: token.bold ? 700 : 400,
                    fontStyle: token.italic ? "italic" : "normal",
                    fontSize: `${fontSizePx}px`,
                    lineHeight: 1.1,
                    background: isSelected ? "rgba(16, 185, 129, 0.08)" : "transparent",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    marginLeft: "-6px",
                    marginTop: "-3px",
                  }}
                >
                  {displayText}

                  {/* Coordinate / Info Badge on Selection */}
                  {isSelected && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white border border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-mono shadow-md pointer-events-none whitespace-nowrap">
                      X: {Math.round(token.x * 100)}% | Y: {Math.round(token.y * 100)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Inspector Panel (Light Mode) ── */}
        {selectedToken && (
          <div className="w-full lg:w-72 bg-white border-l border-slate-200 p-4 space-y-4 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Properties
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {selectedToken.variable}
              </span>
            </div>

            {/* Position Sliders */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Exact Coordinates
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                  <span>Horizontal (X):</span>
                  <span className="text-emerald-700 font-bold">{Math.round(selectedToken.x * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(selectedToken.x * 100)}
                  onChange={(e) => updateToken(selectedToken.id, { x: clamp01(Number(e.target.value) / 100) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                  <span>Vertical (Y):</span>
                  <span className="text-emerald-700 font-bold">{Math.round(selectedToken.y * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(selectedToken.y * 100)}
                  onChange={(e) => updateToken(selectedToken.id, { y: clamp01(Number(e.target.value) / 100) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Center buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateToken(selectedToken.id, { x: 0.5 })}
                  className="py-1.5 px-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs transition-colors"
                >
                  Center X
                </button>
                <button
                  type="button"
                  onClick={() => updateToken(selectedToken.id, { y: 0.5 })}
                  className="py-1.5 px-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs transition-colors"
                >
                  Center Y
                </button>
              </div>
            </div>

            {/* Typography overview */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Typography
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Font Family</label>
                <div className="text-xs font-bold text-slate-800 bg-white border border-slate-200 p-2 rounded-xl truncate shadow-2xs">
                  {selectedToken.fontFamily}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500">Size (px)</label>
                  <input
                    type="number"
                    min={16}
                    max={120}
                    value={selectedToken.fontSize}
                    onChange={(e) => updateToken(selectedToken.id, { fontSize: Number(e.target.value || 44) })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Color Hex</label>
                  <input
                    type="text"
                    value={selectedToken.colorHex}
                    onChange={(e) => updateToken(selectedToken.id, { colorHex: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
