import { fileURLToPath } from 'node:url';

// wbudowane czcionki pdfkit nie maja polskich znakow, stad wlasny plik TTF
const regularFont = fileURLToPath(
  new URL('../../assets/fonts/DejaVuSans.ttf', import.meta.url),
);
const boldFont = fileURLToPath(
  new URL('../../assets/fonts/DejaVuSans-Bold.ttf', import.meta.url),
);

export function registerFonts(doc: PDFKit.PDFDocument) {
  doc.registerFont('regular', regularFont);
  doc.registerFont('bold', boldFont);
}
