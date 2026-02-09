'use client';

/**
 * Client-side PDF post-processing with pdf-lib.
 *
 * 1. Career overflow: appends additional page(s) with structured table.
 * 2. Stamp overlay: embeds stamp PNG at template-defined coordinates.
 */

import { PDFDocument, rgb } from 'pdf-lib';

// ─── Constants ──────────────────────────────────────────────────
const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 50;
const ROW_H = 22;
const HEADER_H = 28;
const TITLE_SIZE = 16;
const HEADER_SIZE = 10;
const CELL_SIZE = 9;
const LINE_COLOR = rgb(0.3, 0.3, 0.3);
const HEADER_BG = rgb(0.93, 0.94, 0.96);

// Career table column definitions
const COLUMNS = [
  { label: '기관명',    key: 'institution', flex: 2.5 },
  { label: '직위',      key: 'position',    flex: 1 },
  { label: '담당과목',  key: 'subject',     flex: 1.5 },
  { label: '시작일',    key: 'start_date',  flex: 1.2 },
  { label: '종료일',    key: 'end_date',    flex: 1.2 },
  { label: '비고',      key: 'notes',       flex: 1.5 },
];

// ─── Main entry point ───────────────────────────────────────────

/**
 * Post-process a PDF: add overflow pages + stamp overlay.
 * @param {Object} opts
 * @param {Uint8Array} opts.pdfBytes - original PDF bytes
 * @param {Array} opts.overflowEntries - career entries that didn't fit
 * @param {Uint8Array|null} opts.stampPngBytes - stamp image bytes (or null)
 * @param {Array} opts.stampAnchors - [{pageIndex, x, y, w, h}]
 * @returns {Promise<Uint8Array>} modified PDF bytes
 */
export async function postProcessPDF({ pdfBytes, overflowEntries, stampPngBytes, stampAnchors }) {
  const pdf = await PDFDocument.load(pdfBytes);

  // 1. Append career overflow page(s)
  if (overflowEntries && overflowEntries.length > 0) {
    await appendOverflowPages(pdf, overflowEntries);
  }

  // 2. Overlay stamp
  if (stampPngBytes && stampAnchors && stampAnchors.length > 0) {
    await overlayStamp(pdf, stampPngBytes, stampAnchors);
  }

  return await pdf.save();
}

// ─── Career overflow ────────────────────────────────────────────

/**
 * Render overflow career entries as structured table pages.
 * Uses Canvas to render Korean text as images, since pdf-lib lacks CJK fonts.
 */
async function appendOverflowPages(pdf, entries) {
  const rowsPerPage = Math.floor((A4_H - MARGIN * 2 - 60) / ROW_H);
  const pages = [];

  for (let i = 0; i < entries.length; i += rowsPerPage) {
    pages.push(entries.slice(i, i + rowsPerPage));
  }

  for (const pageEntries of pages) {
    const imgBytes = renderOverflowCanvas(pageEntries);
    const img = await pdf.embedPng(imgBytes);
    const page = pdf.addPage([A4_W, A4_H]);
    page.drawImage(img, { x: 0, y: 0, width: A4_W, height: A4_H });
  }
}

/**
 * Render a single overflow page as a high-DPI Canvas → PNG.
 */
function renderOverflowCanvas(entries) {
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = A4_W * dpr;
  canvas.height = A4_H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, A4_W, A4_H);

  // Title
  ctx.fillStyle = '#1b1e2b';
  ctx.font = `bold ${TITLE_SIZE}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('경력사항 추가', A4_W / 2, MARGIN + TITLE_SIZE);

  const tableTop = MARGIN + TITLE_SIZE + 24;
  const tableWidth = A4_W - MARGIN * 2;
  const totalFlex = COLUMNS.reduce((s, c) => s + c.flex, 0);

  // Compute column X positions
  const colWidths = COLUMNS.map((c) => (c.flex / totalFlex) * tableWidth);
  const colX = [];
  let cx = MARGIN;
  for (const w of colWidths) {
    colX.push(cx);
    cx += w;
  }

  // Header row background
  ctx.fillStyle = `rgb(${Math.round(0.93 * 255)}, ${Math.round(0.94 * 255)}, ${Math.round(0.96 * 255)})`;
  ctx.fillRect(MARGIN, tableTop, tableWidth, HEADER_H);

  // Header text
  ctx.fillStyle = '#1b1e2b';
  ctx.font = `bold ${HEADER_SIZE}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
  ctx.textAlign = 'left';
  COLUMNS.forEach((col, i) => {
    ctx.fillText(col.label, colX[i] + 6, tableTop + HEADER_H / 2 + HEADER_SIZE / 3);
  });

  // Header border
  ctx.strokeStyle = '#9ba0b3';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(MARGIN, tableTop, tableWidth, HEADER_H);

  // Column dividers for header
  for (let i = 1; i < colX.length; i++) {
    ctx.beginPath();
    ctx.moveTo(colX[i], tableTop);
    ctx.lineTo(colX[i], tableTop + HEADER_H);
    ctx.stroke();
  }

  // Data rows
  ctx.font = `${CELL_SIZE}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
  entries.forEach((entry, rowIdx) => {
    const y = tableTop + HEADER_H + rowIdx * ROW_H;

    // Alternating background
    if (rowIdx % 2 === 1) {
      ctx.fillStyle = '#f8f9fc';
      ctx.fillRect(MARGIN, y, tableWidth, ROW_H);
    }

    // Cell text
    ctx.fillStyle = '#1b1e2b';
    COLUMNS.forEach((col, colIdx) => {
      let text = String(entry[col.key] || '');
      // Truncate if too long for cell
      const maxWidth = colWidths[colIdx] - 12;
      while (ctx.measureText(text).width > maxWidth && text.length > 1) {
        text = text.slice(0, -1);
      }
      ctx.fillText(text, colX[colIdx] + 6, y + ROW_H / 2 + CELL_SIZE / 3);
    });

    // Row border
    ctx.strokeStyle = '#d8dbe8';
    ctx.lineWidth = 0.3;
    ctx.strokeRect(MARGIN, y, tableWidth, ROW_H);

    // Column dividers
    for (let i = 1; i < colX.length; i++) {
      ctx.beginPath();
      ctx.moveTo(colX[i], y);
      ctx.lineTo(colX[i], y + ROW_H);
      ctx.stroke();
    }
  });

  // Outer border around full table
  const totalTableH = HEADER_H + entries.length * ROW_H;
  ctx.strokeStyle = '#9ba0b3';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(MARGIN, tableTop, tableWidth, totalTableH);

  // Footer
  ctx.fillStyle = '#8b90a7';
  ctx.font = `${8}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(
    `총 ${entries.length}건 | 최근 경력순`,
    A4_W / 2,
    tableTop + totalTableH + 20,
  );

  // Convert to PNG bytes
  const dataURL = canvas.toDataURL('image/png');
  const base64 = dataURL.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ─── Stamp overlay ──────────────────────────────────────────────

async function overlayStamp(pdf, stampPngBytes, anchors) {
  const img = await pdf.embedPng(stampPngBytes);
  const pages = pdf.getPages();

  for (const anchor of anchors) {
    const pageIdx = anchor.pageIndex || 0;
    if (pageIdx >= pages.length) continue;
    const page = pages[pageIdx];

    // PDF coordinate system: y=0 is bottom-left
    // anchor.y is from top of page for easier template config
    const pageH = page.getHeight();
    const pdfY = pageH - anchor.y - anchor.h;

    page.drawImage(img, {
      x: anchor.x,
      y: pdfY,
      width: anchor.w,
      height: anchor.h,
    });
  }
}

// ─── Overflow detection helper ──────────────────────────────────

/**
 * Split career entries into template-fit and overflow.
 * Entries are assumed to be sorted by start_date descending (most recent first).
 */
export function splitCareerEntries(career, maxRows) {
  if (!maxRows || !career || career.length <= maxRows) {
    return { fit: career || [], overflow: [] };
  }
  return {
    fit: career.slice(0, maxRows),
    overflow: career.slice(maxRows),
  };
}
