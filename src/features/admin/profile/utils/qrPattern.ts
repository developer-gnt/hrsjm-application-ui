/**
 * Real QR encoding shared by the on-screen ID card preview (React
 * Native views) and the generated PDF (jsPDF rects), so both always
 * render the identical, scannable pattern for a given payload.
 *
 * Uses the pure-JS `qrcode` encoder (no DOM, Hermes-safe). Rendering
 * stays view/rect based, so no extra native or SVG dependency exists.
 */
import { create as createQr, QRCodeErrorCorrectionLevel } from 'qrcode';

const qrCache = new Map<string, boolean[][]>();

/**
 * Renders the QR for verification URLs/IDs at the highest error
 * correction level so the code survives printing and glare on a card.
 */
export const getQrMatrix = (data: string): boolean[][] => {
  if (qrCache.has(data)) {
    return qrCache.get(data)!;
  }
  const qr = createQr(data, {
    errorCorrectionLevel: 'H' as QRCodeErrorCorrectionLevel,
  });
  const size = qr.modules.size;
  const bytes = qr.modules.data;
  const matrix: boolean[][] = [];
  for (let row = 0; row < size; row += 1) {
    const line: boolean[] = [];
    for (let col = 0; col < size; col += 1) {
      line.push(Boolean(bytes[row * size + col]));
    }
    matrix.push(line);
  }
  qrCache.set(data, matrix);
  return matrix;
};
