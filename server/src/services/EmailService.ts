import { Resend } from 'resend';
import { config } from '../config';

type Send = {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async send({ to, subject, html}: Send) {
    const resend = new Resend(config.resend.apiKey);
    resend.emails.send({
      from: config.resend.from,
      to,
      subject,
      html
    });
  }
}