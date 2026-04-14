import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(private config: ConfigService) {
    const host = config.get<string>('SMTP_HOST', '');
    const port = parseInt(config.get<string>('SMTP_PORT', '587'));
    const user = config.get<string>('SMTP_USER', '');
    const pass = config.get<string>('SMTP_PASS', '');
    this.fromEmail = config.get<string>('SMTP_FROM', 'noreply@tillas.ec');

    if (host && user) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Mail configurado: ${host}:${port}`);
    } else {
      this.logger.warn('SMTP no configurado. Los emails se logean en consola.');
    }
  }

  async sendOtp(to: string, name: string, otp: string): Promise<void> {
    const subject = `🔐 Tu código TILLAS.EC: ${otp}`;
    const html = `
      <div style="font-family: 'Helvetica', sans-serif; max-width: 480px; margin: 0 auto; background: #0D0D0D; color: #fff; border-radius: 16px; padding: 40px;">
        <h1 style="color: #00FF87; font-size: 28px; margin: 0;">TILLAS.EC</h1>
        <p style="color: #aaa; margin-top: 4px;">La tienda de sneakers #1 de Ecuador 🇪🇨</p>
        <hr style="border: 1px solid #222; margin: 24px 0;">
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu código de verificación es:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; color: #00FF87; letter-spacing: 8px; background: #1A1A1A; padding: 16px 32px; border-radius: 12px; display: inline-block;">${otp}</span>
        </div>
        <p style="color: #aaa;">Este código expira en <strong>10 minutos</strong>.</p>
        <p style="color: #666; font-size: 12px; margin-top: 32px;">Si no solicitaste este código, ignora este email.</p>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from: this.fromEmail, to, subject, html });
        this.logger.log(`OTP enviado a ${to}`);
      } catch (error) {
        this.logger.error(`Error enviando email a ${to}:`, error);
        // No lanzar error para no bloquear el registro
        this.logger.log(`[FALLBACK] OTP para ${to}: ${otp}`);
      }
    } else {
      this.logger.log(`[DEV] OTP para ${to}: ${otp}`);
    }
  }
}
