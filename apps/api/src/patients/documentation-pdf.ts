import PDFDocument from 'pdfkit';
import { registerFonts } from '../pdf/fonts.js';

export interface DocumentationPdfData {
  clinicName: string;
  generatedAt: Date;
  generatedBy: string;
  patient: {
    fullName: string;
    pesel: string | null;
    birthDate: Date | null;
    sex: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
  visits: {
    visitDate: Date;
    closedAt: Date | null;
    therapist: string;
    fields: { label: string; value: string | null }[];
    markers: {
      muscle: string;
      painLevel: number;
      painType: string | null;
      note: string | null;
    }[];
    amendments: { content: string; author: string; createdAt: Date }[];
  }[];
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pl-PL');
}

function formatDateTime(date: Date) {
  return date.toLocaleString('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function renderDocumentationPdf(
  data: DocumentationPdfData,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // bufferPages pozwala na koniec wrocic do kazdej strony i dopisac numeracje
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    registerFonts(doc);

    doc.font('bold').fontSize(16).text(data.clinicName);
    doc
      .font('regular')
      .fontSize(12)
      .text('Kopia dokumentacji medycznej pacjenta');
    doc
      .fontSize(9)
      .fillColor('#57534e')
      .text(
        `Wygenerowano ${formatDateTime(data.generatedAt)} przez: ${data.generatedBy}`,
      )
      .fillColor('black');
    doc.moveDown();

    const { patient } = data;
    doc.font('bold').fontSize(12).text('Dane pacjenta');
    doc.font('regular').fontSize(10);
    const details: [string, string | null][] = [
      ['Imię i nazwisko', patient.fullName],
      ['PESEL', patient.pesel],
      [
        'Data urodzenia',
        patient.birthDate ? formatDate(patient.birthDate) : null,
      ],
      ['Płeć', patient.sex],
      ['Adres', patient.address],
      ['Telefon', patient.phone],
      ['E-mail', patient.email],
    ];
    for (const [label, value] of details) {
      doc.text(`${label}: ${value ?? '-'}`);
    }
    doc.moveDown();

    doc.font('bold').fontSize(12).text(`Wizyty (${data.visits.length})`);
    if (data.visits.length === 0) {
      doc.font('regular').fontSize(10).text('Brak wizyt.');
    }

    for (const visit of data.visits) {
      // naglowek wizyty nie powinien zostac sam na dole strony
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }
      doc.moveDown(0.8);
      doc
        .font('bold')
        .fontSize(11)
        .text(`Wizyta ${formatDate(visit.visitDate)}`);
      doc
        .font('regular')
        .fontSize(9)
        .fillColor('#57534e')
        .text(
          `${visit.therapist}. ${
            visit.closedAt
              ? `Zamknięta ${formatDateTime(visit.closedAt)}.`
              : 'Wpis otwarty, w trakcie uzupełniania.'
          }`,
        )
        .fillColor('black');
      doc.fontSize(10);
      for (const field of visit.fields) {
        doc.moveDown(0.3);
        doc.font('bold').text(field.label);
        doc.font('regular').text(field.value ?? 'Nie uzupełniono.');
      }

      doc.moveDown(0.3);
      doc.font('bold').text('Mapa bólu (NRS 0-10)');
      doc.font('regular');
      if (visit.markers.length === 0) {
        doc.text('Brak oznaczeń.');
      }
      for (const marker of visit.markers) {
        const extra = [marker.painType, marker.note].filter(Boolean).join(', ');
        doc.text(
          `${marker.muscle}: ${marker.painLevel}${extra ? ` (${extra})` : ''}`,
        );
      }

      if (visit.amendments.length > 0) {
        doc.moveDown(0.3);
        doc.font('bold').text('Adnotacje');
        doc.font('regular');
        for (const amendment of visit.amendments) {
          doc.text(
            `${formatDateTime(amendment.createdAt)}, ${amendment.author}: ${amendment.content}`,
          );
        }
      }
    }

    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      // tekst ponizej dolnego marginesu pdfkit przenosi na nowa strone,
      // wiec na czas stopki margines zerujemy
      const bottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc
        .fontSize(8)
        .fillColor('#57534e')
        .text(
          `${data.patient.fullName}, strona ${i + 1} z ${range.count}`,
          50,
          doc.page.height - 35,
          { width: doc.page.width - 100, align: 'center' },
        );
      doc.page.margins.bottom = bottom;
    }

    doc.end();
  });
}
