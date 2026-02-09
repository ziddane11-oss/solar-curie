'use client';

/**
 * Client-side Korean name stamp (도장) image generator.
 * Renders a red rectangular seal with centered name text on transparent PNG.
 */

const SIZES = { S: 40, M: 60, L: 80 };
const BORDER = 2;
const RED = '#c23616';
const DPR = 2; // retina quality

/**
 * Generate a stamp as a data URL (PNG, transparent background).
 * For 2-char names: vertical layout. Otherwise: horizontal shrink-to-fit.
 */
export function generateStampDataURL(name, size = 'M') {
  if (!name || typeof document === 'undefined') return null;

  const dim = SIZES[size] || SIZES.M;
  const canvas = document.createElement('canvas');
  canvas.width = dim * DPR;
  canvas.height = dim * DPR;

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);
  ctx.clearRect(0, 0, dim, dim);

  // Border
  ctx.strokeStyle = RED;
  ctx.lineWidth = BORDER;
  const off = BORDER / 2;
  ctx.strokeRect(off, off, dim - BORDER, dim - BORDER);

  // Text
  ctx.fillStyle = RED;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxW = dim - BORDER * 4;

  if (name.length <= 2) {
    // Vertical layout
    const fs = dim * 0.35;
    ctx.font = `bold ${fs}px serif`;
    const lh = fs * 1.15;
    const chars = name.split('');
    const startY = (dim - chars.length * lh) / 2 + lh / 2;
    chars.forEach((ch, i) => ctx.fillText(ch, dim / 2, startY + i * lh));
  } else {
    // Horizontal shrink-to-fit
    let fs = dim * 0.35;
    ctx.font = `bold ${fs}px serif`;
    while (ctx.measureText(name).width > maxW && fs > 8) {
      fs -= 1;
      ctx.font = `bold ${fs}px serif`;
    }
    ctx.fillText(name, dim / 2, dim / 2);
  }

  return canvas.toDataURL('image/png');
}

/** Convert a data URL to a Uint8Array for pdf-lib. */
export function dataURLtoBytes(dataURL) {
  if (!dataURL) return null;
  const base64 = dataURL.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export { SIZES as STAMP_SIZES };
