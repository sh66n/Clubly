"use client";

import {
  CERTIFICATE_FONT_OPTIONS,
  CERTIFICATE_VARIABLE_KEYS,
  CertificateLayout,
  CertificateTextToken,
  CertificateVariableKey,
} from "@/lib/certificate";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface CertificateLayoutEditorProps {
  templatePreviewUrl: string | null;
  layout: CertificateLayout;
  onChange: (layout: CertificateLayout) => void;
}

const SAMPLE_TEXT: Record<CertificateVariableKey, string> = {
  $name: "Aarav Patil",
  $year: "SE",
  $rank: "Winner",
};

const FONT_STACK: Record<CertificateTextToken["fontFamily"], string> = {
  helvetica: "Helvetica, Arial, sans-serif",
  times: "'Times New Roman', Times, serif",
  courier: "'Courier New', Courier, monospace",
  georgia: "Georgia, serif",
  arial: "Arial, sans-serif",
  verdana: "Verdana, sans-serif",
  impact: "Impact, sans-serif",
  trebuchet: "'Trebuchet MS', sans-serif",
};

const createToken = (
  variable: CertificateVariableKey,
): CertificateTextToken => ({
  id: `${variable.replace("$", "")}-${Math.random().toString(36).slice(2, 8)}`,
  variable,
  x: 0.5,
  y: 0.5,
  fontSize: 44,
  colorHex: "#111111",
  fontFamily: "helvetica",
  bold: true,
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
  ctx.font = `${style} ${weight} ${fontSizePx}px ${FONT_STACK[token.fontFamily]}`;

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

export default function CertificateLayoutEditor({
  templatePreviewUrl,
  layout,
  onChange,
}: CertificateLayoutEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragTokenRef = useRef<string | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });
  const [renderBox, setRenderBox] = useState<RenderBox>(FALLBACK_RENDER_BOX);

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(
    layout.tokens[0]?.id ?? null,
  );

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

  const updateToken = (
    tokenId: string,
    patch: Partial<CertificateTextToken>,
  ) => {
    onChange({
      tokens: layout.tokens.map((token) =>
        token.id === tokenId ? { ...token, ...patch } : token,
      ),
    });
  };

  const removeToken = (tokenId: string) => {
    onChange({ tokens: layout.tokens.filter((token) => token.id !== tokenId) });
  };

  useEffect(() => {
    const computeRenderBox = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      if (containerWidth <= 0 || containerHeight <= 0) return;

      const naturalWidth = imageNaturalSize.width || containerWidth;
      const naturalHeight = imageNaturalSize.height || containerHeight;
      const scale = Math.min(
        containerWidth / naturalWidth,
        containerHeight / naturalHeight,
      );

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
  }, [imageNaturalSize, templatePreviewUrl]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!dragTokenRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const activeBox = renderBox.width > 1 ? renderBox : FALLBACK_RENDER_BOX;

      const x = clamp01((localX - activeBox.x) / activeBox.width);
      const y = clamp01(1 - (localY - activeBox.y) / activeBox.height);

      updateToken(dragTokenRef.current, { x, y });
    };

    const onUp = () => {
      dragTokenRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [renderBox, updateToken]);

  const usedVariables = new Set(layout.tokens.map((token) => token.variable));

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 p-4 bg-slate-50 flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
            Available Variables
          </label>
          <div className="flex flex-wrap gap-2">
            {CERTIFICATE_VARIABLE_KEYS.map((variable) => {
              const isUsed = usedVariables.has(variable);
              return (
                <button
                  key={variable}
                  type="button"
                  disabled={isUsed}
                  onClick={() => {
                    if (isUsed) return;
                    const token = createToken(variable, 0.5, 0.5);
                    onChange({ tokens: [...layout.tokens, token] });
                    setSelectedTokenId(token.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    isUsed
                      ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-sm"
                  }`}
                >
                  {isUsed ? "✓ Added" : "+ Add"} {variable}
                </button>
              );
            })}
          </div>
        </div>

        {selectedToken ? (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Edit {selectedToken.variable}
              </label>
              <button
                type="button"
                onClick={() => removeToken(selectedToken.id)}
                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors"
                title="Remove variable"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedToken.fontFamily}
                onChange={(event) =>
                  updateToken(selectedToken.id, {
                    fontFamily: event.target.value as CertificateTextToken["fontFamily"],
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                {CERTIFICATE_FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden h-[38px]">
                <button
                  type="button"
                  className="px-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
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
                  className="w-12 text-center text-sm font-medium text-slate-700 border-x border-slate-200 outline-none h-full"
                />
                <button
                  type="button"
                  className="px-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
                  onClick={() =>
                    updateToken(selectedToken.id, {
                      fontSize: Math.min(120, selectedToken.fontSize + 2),
                    })
                  }
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-2 relative group">
                <input
                  type="color"
                  value={selectedToken.colorHex}
                  onChange={(event) =>
                    updateToken(selectedToken.id, {
                      colorHex: event.target.value,
                    })
                  }
                  className="h-[38px] w-12 rounded-lg border border-slate-300 bg-white cursor-pointer shadow-sm p-1"
                  title="Text color"
                />
              </div>

              <div className="flex items-center rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden h-[38px]">
                <button
                  type="button"
                  onClick={() => updateToken(selectedToken.id, { bold: !selectedToken.bold })}
                  className={`px-3 flex items-center justify-center border-r border-slate-200 transition-colors ${selectedToken.bold ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateToken(selectedToken.id, { italic: !selectedToken.italic })}
                  className={`px-3 flex items-center justify-center transition-colors ${selectedToken.italic ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden h-[38px]">
                <button
                  type="button"
                  onClick={() => updateToken(selectedToken.id, { align: "left" })}
                  className={`px-3 flex items-center justify-center border-r border-slate-200 transition-colors ${selectedToken.align === "left" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  title="Align left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateToken(selectedToken.id, { align: "center" })}
                  className={`px-3 flex items-center justify-center border-r border-slate-200 transition-colors ${selectedToken.align === "center" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  title="Align center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateToken(selectedToken.id, { align: "right" })}
                  className={`px-3 flex items-center justify-center transition-colors ${selectedToken.align === "right" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  title="Align right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-200 text-sm text-slate-500 italic">
            Select a variable on the canvas to edit its properties.
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-100">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Interactive Canvas</span>
          <span className="text-xs text-slate-400">Drag items to position them</span>
        </div>
        
        <div
          ref={containerRef}
          className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border-2 border-slate-300 bg-white shadow-inner"
        >
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 px-4 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-3">
                <span className="text-2xl">🖼️</span>
              </div>
              <p className="font-medium">Upload a template image first</p>
              <p className="text-xs mt-1">Variables will be placed on top of it</p>
            </div>
          )}

          {layout.tokens.map((token) => {
            const activeBox = renderBox.width > 1 ? renderBox : FALLBACK_RENDER_BOX;
            const anchorX = activeBox.x + token.x * activeBox.width;
            const baselineY = activeBox.y + (1 - token.y) * activeBox.height;
            const fontSizePx = Math.max(8, token.fontSize * activeBox.scale);
            const sample = SAMPLE_TEXT[token.variable];
            const metrics = measureTextMetrics(sample, token, fontSizePx);

            let leftPx = anchorX;
            if (token.align === "center") {
              leftPx = anchorX - metrics.width / 2;
            } else if (token.align === "right") {
              leftPx = anchorX - metrics.width;
            }

            const topPx = baselineY - metrics.ascent;
            const isSelected = selectedTokenId === token.id;

            return (
              <button
                key={token.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  dragTokenRef.current = token.id;
                  setSelectedTokenId(token.id);
                }}
                onClick={() => setSelectedTokenId(token.id)}
                className={`absolute select-none whitespace-nowrap leading-none cursor-move transition-shadow ${
                  isSelected 
                    ? "outline outline-2 outline-emerald-500 shadow-lg ring-4 ring-emerald-500/20 z-10" 
                    : "hover:outline hover:outline-1 hover:outline-emerald-300"
                }`}
                style={{
                  left: `${leftPx}px`,
                  top: `${topPx}px`,
                  color: token.colorHex,
                  fontFamily: FONT_STACK[token.fontFamily],
                  fontWeight: token.bold ? 700 : 400,
                  fontStyle: token.italic ? "italic" : "normal",
                  fontSize: `${fontSizePx}px`,
                  lineHeight: 1.1,
                  background: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  marginLeft: "-4px",
                  marginTop: "-2px",
                }}
              >
                {sample}
              </button>
            );
          })}
        </div>

        {selectedToken && (
          <div className="mt-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-4">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-2 w-full">
                <span className="w-4">X:</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(selectedToken.x * 100)}
                  onChange={(event) =>
                    updateToken(selectedToken.id, {
                      x: clamp01(Number(event.target.value || 0) / 100),
                    })
                  }
                  className="flex-1 accent-emerald-500"
                />
                <span className="w-8 text-right text-slate-700">{Math.round(selectedToken.x * 100)}%</span>
              </label>
            </div>
            <div className="flex-1 flex items-center gap-4">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-2 w-full">
                <span className="w-4">Y:</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(selectedToken.y * 100)}
                  onChange={(event) =>
                    updateToken(selectedToken.id, {
                      y: clamp01(Number(event.target.value || 0) / 100),
                    })
                  }
                  className="flex-1 accent-emerald-500"
                />
                <span className="w-8 text-right text-slate-700">{Math.round(selectedToken.y * 100)}%</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
