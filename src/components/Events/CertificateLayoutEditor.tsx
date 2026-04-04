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
    <div className="rounded-xl border border-gray-700 bg-gray-900/70 overflow-hidden">
      <div className="border-b border-gray-700 p-3 bg-gray-950/80">
        <div className="flex flex-wrap gap-2">
          {CERTIFICATE_VARIABLE_KEYS.map((variable) => (
            <button
              key={variable}
              type="button"
              disabled={usedVariables.has(variable)}
              onClick={() => {
                if (usedVariables.has(variable)) return;
                const token = createToken(variable);
                onChange({ tokens: [...layout.tokens, token] });
                setSelectedTokenId(token.id);
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-600 text-xs text-gray-100 hover:border-gray-400 disabled:opacity-40"
            >
              Add {variable}
            </button>
          ))}
        </div>

        {selectedToken && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={selectedToken.fontFamily}
              onChange={(event) =>
                updateToken(selectedToken.id, {
                  fontFamily: event.target
                    .value as CertificateTextToken["fontFamily"],
                })
              }
              className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-1.5 text-sm"
            >
              {CERTIFICATE_FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>

            <div className="inline-flex items-center rounded-lg border border-gray-600 overflow-hidden">
              <button
                type="button"
                className="px-2 py-1.5 text-sm hover:bg-gray-800"
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
                className="w-16 bg-gray-900 text-center text-sm py-1.5 outline-none"
              />
              <button
                type="button"
                className="px-2 py-1.5 text-sm hover:bg-gray-800"
                onClick={() =>
                  updateToken(selectedToken.id, {
                    fontSize: Math.min(120, selectedToken.fontSize + 2),
                  })
                }
              >
                +
              </button>
            </div>

            <input
              type="color"
              value={selectedToken.colorHex}
              onChange={(event) =>
                updateToken(selectedToken.id, {
                  colorHex: event.target.value,
                })
              }
              className="h-9 w-12 rounded border border-gray-600 bg-gray-900"
              title="Text color"
            />

            <button
              type="button"
              onClick={() =>
                updateToken(selectedToken.id, {
                  bold: !selectedToken.bold,
                })
              }
              className={`h-9 w-9 rounded border ${selectedToken.bold ? "border-blue-500 bg-blue-500/20" : "border-gray-600"} flex items-center justify-center`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                updateToken(selectedToken.id, {
                  italic: !selectedToken.italic,
                })
              }
              className={`h-9 w-9 rounded border ${selectedToken.italic ? "border-blue-500 bg-blue-500/20" : "border-gray-600"} flex items-center justify-center`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { align: "left" })}
              className={`h-9 w-9 rounded border ${selectedToken.align === "left" ? "border-blue-500 bg-blue-500/20" : "border-gray-600"} flex items-center justify-center`}
              title="Align left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { align: "center" })}
              className={`h-9 w-9 rounded border ${selectedToken.align === "center" ? "border-blue-500 bg-blue-500/20" : "border-gray-600"} flex items-center justify-center`}
              title="Align center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => updateToken(selectedToken.id, { align: "right" })}
              className={`h-9 w-9 rounded border ${selectedToken.align === "right" ? "border-blue-500 bg-blue-500/20" : "border-gray-600"} flex items-center justify-center`}
              title="Align right"
            >
              <AlignRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => removeToken(selectedToken.id)}
              className="h-9 w-9 rounded border border-red-500/60 text-red-300 flex items-center justify-center hover:bg-red-500/10"
              title="Remove variable"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        <div
          ref={containerRef}
          className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-gray-700 bg-gray-800"
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
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 px-4 text-center">
              Upload certificate template to start placing text
            </div>
          )}

          {layout.tokens.map((token) => {
            const activeBox =
              renderBox.width > 1 ? renderBox : FALLBACK_RENDER_BOX;
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
                className={`absolute select-none whitespace-nowrap leading-none ${selectedTokenId === token.id ? "outline outline-blue-500" : ""}`}
                style={{
                  left: `${leftPx}px`,
                  top: `${topPx}px`,
                  color: token.colorHex,
                  fontFamily: FONT_STACK[token.fontFamily],
                  fontWeight: token.bold ? 700 : 400,
                  fontStyle: token.italic ? "italic" : "normal",
                  fontSize: `${fontSizePx}px`,
                  lineHeight: 1.1,
                  background: "transparent",
                }}
              >
                {sample}
              </button>
            );
          })}
        </div>

        {selectedToken && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <label className="text-xs text-gray-400">
              X (%)
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(selectedToken.x * 100)}
                onChange={(event) =>
                  updateToken(selectedToken.id, {
                    x: clamp01(Number(event.target.value || 0) / 100),
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-400">
              Y (%)
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(selectedToken.y * 100)}
                onChange={(event) =>
                  updateToken(selectedToken.id, {
                    y: clamp01(Number(event.target.value || 0) / 100),
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-400">
              Variable
              <input
                value={selectedToken.variable}
                readOnly
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-gray-200"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
