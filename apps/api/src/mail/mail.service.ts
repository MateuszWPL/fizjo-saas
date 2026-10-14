import { BadGatewayException, Injectable } from '@nestjs/common';

// testowy nadawca Resend, dziala bez weryfikacji wlasnej domeny
const FROM = 'Fizjo <onboarding@resend.dev>';

@Injectable()
export class MailService {
  async sendWithPdf(
    to: string,
    subject: string,
    text: string,
    filename: string,
    pdf: Buffer,
  ) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error('Brak RESEND_API_KEY w apps/api/.env');
    }
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        text,
        attachments: [{ filename, content: pdf.toString('base64') }],
      }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      throw new BadGatewayException(
        `Nie udało się wysłać e-maila: ${body.message ?? response.status}`,
      );
    }
  }
}
