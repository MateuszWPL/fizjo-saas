import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';

// wbudowane czcionki pdfkit nie maja polskich znakow, stad wlasny plik TTF
const regularFont = fileURLToPath(new URL('../../assets/fonts/DejaVuSans.ttf', import.meta.url));
const boldFont = fileURLToPath(new URL('../../assets/fonts/DejaVuSans-Bold.ttf', import.meta.url));

export interface PlanPdfData {
  clinicName: string;
  patientName: string;
  therapistName: string;
  issuedAt: Date;
  note: string | null;
  items: {
    name: string;
    description: string | null;
    sets: number | null;
    reps: number | null;
    note: string | null;
    image: Buffer | null;
  }[];
}

export function renderPlanPdf(plan: PlanPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.registerFont('regular', regularFont);
    doc.registerFont('bold', boldFont);

    doc.font('bold').fontSize(16).text(plan.clinicName);
    doc.font('regular').fontSize(12).text('Zalecenia ćwiczeń');
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Pacjent: ${plan.patientName}`);
    doc.text(`Data wydania: ${plan.issuedAt.toLocaleDateString('pl-PL')}`);
    doc.text(`Terapeuta: ${plan.therapistName}`);
    doc.moveDown(1.5);

    plan.items.forEach((item, index) => {
      // obrazek nie lamie sie miedzy stronami jak tekst, wiec przy koncu strony
      // zaczynamy cwiczenie od nowej
      if (doc.y > doc.page.height - 220) {
        doc.addPage();
      }
      doc.font('bold').fontSize(12).text(`${index + 1}. ${item.name}`);
      doc.font('regular').fontSize(10);
      if (item.sets || item.reps) {
        doc.text(`Serie: ${item.sets ?? '-'}, powtórzenia: ${item.reps ?? '-'}`);
      }
      if (item.image) {
        doc.moveDown(0.3);
        doc.image(item.image, { fit: [160, 120] });
      }
      if (item.description) {
        doc.moveDown(0.3);
        doc.text(item.description);
      }
      if (item.note) {
        doc.moveDown(0.3);
        doc.text(`Uwagi: ${item.note}`);
      }
      doc.moveDown();
    });

    if (plan.note) {
      doc.moveDown(0.5);
      doc.font('bold').text('Uwagi do zestawu');
      doc.font('regular').text(plan.note);
    }

    doc.end();
  });
}
