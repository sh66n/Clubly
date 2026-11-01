import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";

export function patchPdfFontCmap(font: any) {
  if (!font?.embedder?.embedUnicodeCmap || !font.embedder.font) return;
  
  font.embedder.embedUnicodeCmap = function(context: any) {
    const glyphMap = new Map();
    // 1. Unicode code points in standard characterSet
    if (font.embedder.font.characterSet) {
      for (const cp of font.embedder.font.characterSet) {
        const g = font.embedder.font.glyphForCodePoint(cp);
        if (g) glyphMap.set(g.id, { id: g.id, codePoints: [cp] });
      }
    }
    // 2. OpenType stylistic ligatures and alternates (e.g. h.ss01, a.ss01)
    const numGlyphs = font.embedder.font.numGlyphs || 0;
    for (let i = 0; i < numGlyphs; i++) {
      if (!glyphMap.has(i)) {
        try {
          const g = font.embedder.font.getGlyph(i);
          if (g && g.codePoints && g.codePoints.length > 0) {
            glyphMap.set(i, { id: i, codePoints: g.codePoints });
          }
        } catch (_) {}
      }
    }

    const bfchars: string[] = [];
    for (const [gid, item] of glyphMap.entries()) {
      const gidHex = gid.toString(16).padStart(4, "0").toUpperCase();
      const cpVal = item.codePoints[0] || 0;
      const cpHex = cpVal.toString(16).padStart(4, "0").toUpperCase();
      bfchars.push(`<${gidHex}> <${cpHex}>`);
    }

    let cmap = "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo <<\n  /Registry (Adobe)\n  /Ordering (UCS)\n  /Supplement 0\n>> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000><ffff>\nendcodespacerange\n";

    for (let i = 0; i < bfchars.length; i += 100) {
      const chunk = bfchars.slice(i, i + 100);
      cmap += `${chunk.length} beginbfchar\n${chunk.join("\n")}\nendbfchar\n`;
    }

    cmap += "endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend\n";
    return context.register(context.flateStream(cmap));
  };
}
