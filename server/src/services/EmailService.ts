import { Resend } from 'resend';
import { config } from '../config';
import * as fs from 'fs';
import * as path from 'path';

type Send = {
  to: string;
  subject: string;
  html: string;
}

type SendTrackingUpdate = {
  to: string;
  awb: string;
  courier: string;
  latestStatus: string;
  history: Array<{
    date: string;
    location: string;
    description: string;
  }>;
}

export class EmailService {
  private static getTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, '..', 'templates', templateName);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  static async send({ to, subject, html}: Send) {
    const resend = new Resend(config.resend.apiKey);
    resend.emails.send({
      from: config.resend.from,
      to,
      subject,
      html
    });
  }

  static async sendTrackingUpdate({ to, awb, courier, latestStatus, history }: SendTrackingUpdate) {
    const template = this.getTemplate('status-update.html');

    const historyRows = history.map(h => `
      <tr>
        <td>${h.date}</td>
        <td>${h.location}</td>
        <td>${h.description}</td>
      </tr>
    `).join('');

    const html = template
      .replace('{{AWB}}', awb)
      .replace('{{COURIER}}', courier)
      .replace('{{LATEST_STATUS}}', latestStatus)
      .replace('{{HISTORY_ROWS}}', historyRows);

    await this.send({
      to,
      subject: `[${awb}] ${latestStatus}`,
      html
    });
  }
}