import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP transporter initialized with host: ${host}`);
    } else {
      this.logger.warn('SMTP credentials not fully set. Running in development console-delivery mode.');
    }
  }

  async sendOtp(to: string, otp: string, purpose: 'login' | 'register'): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"CineTix Cinema" <noreply@cinetix.id>';
    const subject = purpose === 'register' ? 'Verifikasi Pendaftaran Akun CineTix' : 'Kode Masuk Akun CineTix';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #0d0f14; color: #f1f5f9; padding: 32px; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #e2e8f0; font-size: 22px; letter-spacing: 2px;">CINETIX CINEMA</h2>
          <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Otentikasi Keamanan Akses Akun</p>
        </div>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">Gunakan kode OTP berikut untuk melanjutkan verifikasi akun CineTix Anda. Kode ini berlaku selama 10 menit.</p>
        <div style="background-color: #161b26; border: 1px solid #334155; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f59e0b;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.4;">Demi keamanan akun Anda, jangan bagikan kode ini kepada siapa pun. Jika Anda tidak melakukan permintaan ini, abaikan email ini.</p>
        <div style="border-top: 1px solid #1e293b; margin-top: 24px; padding-top: 16px; text-align: center; color: #475569; font-size: 11px;">
          &copy; 2026 CineTix Cinema Network. All rights reserved.
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        this.logger.log(`OTP email sent successfully to ${to}`);
        return true;
      } catch (error: any) {
        this.logger.error(`Failed to send email via SMTP: ${error.message}`);
        this.logOtpToConsole(to, otp, purpose);
        return false;
      }
    } else {
      this.logOtpToConsole(to, otp, purpose);
      return true;
    }
  }

  async sendTicketConfirmation(to: string, booking: {
    kode_booking: string;
    judul: string;
    bioskop: string;
    studio: string;
    tanggal: string;
    jam: string;
    seats: string[];
    total: number;
  }): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"CineTix Cinema" <noreply@cinetix.id>';
    const subject = `E-Tiket Konfirmasi Pemesanan [${booking.kode_booking}] - CineTix`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #0b0d13; color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid #232a3b;">
        <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #f59e0b; font-size: 20px; letter-spacing: 1.5px;">E-TIKET RESMI CINETIX</h2>
          <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Kode Booking: <strong>${booking.kode_booking}</strong></p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 6px; font-size: 18px; color: #ffffff;">${booking.judul}</h3>
          <p style="margin: 0; color: #94a3b8; font-size: 14px;">${booking.bioskop} • ${booking.studio}</p>
        </div>
        <div style="background-color: #141923; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; color: #cbd5e1; font-size: 13px;"><strong>Jadwal:</strong> ${booking.tanggal} | Pukul ${booking.jam} WIB</p>
          <p style="margin: 0 0 8px; color: #cbd5e1; font-size: 13px;"><strong>Kursi Terpilih:</strong> ${booking.seats.join(', ')}</p>
          <p style="margin: 0; color: #f59e0b; font-size: 13px;"><strong>Total Pembayaran:</strong> Rp ${booking.total.toLocaleString('id-ID')}</p>
        </div>
        <p style="color: #64748b; font-size: 12px;">Tunjukkan kode tiket atau QR Code digital di aplikasi CineTix kepada petugas gate sebelum memasuki studio bioskop.</p>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html });
        this.logger.log(`Ticket confirmation sent to ${to}`);
        return true;
      } catch (err: any) {
        this.logger.error(`Failed to send ticket email: ${err.message}`);
        return false;
      }
    } else {
      this.logger.log(`[SIMULATED SMTP EMAIL] Ticket Confirmation for ${booking.kode_booking} to ${to}`);
      return true;
    }
  }

  private logOtpToConsole(to: string, otp: string, purpose: string) {
    this.logger.log(`--------------------------------------------------`);
    this.logger.log(`[SMTP DEV DISPATCH] Tujuan: ${to} | Purpose: ${purpose}`);
    this.logger.log(`[SMTP DEV DISPATCH] KODE OTP: >>> ${otp} <<<`);
    this.logger.log(`--------------------------------------------------`);
  }

  async sendGoogleAuthEmail(to: string, otp: string, magicLink: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"CineTix Cinema" <noreply@cinetix.id>';
    const subject = 'Konfirmasi Permintaan Masuk Akun Google - CineTix';

    const html = `
      <div style="margin: 0; padding: 24px 12px; background-color: #080C14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #CBD5E1;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #0E1424; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
          <!-- Header Bioskop -->
          <tr>
            <td style="padding: 28px 28px 16px; text-align: center; border-bottom: 1px solid #1E293B;">
              <span style="display: inline-block; background: linear-gradient(135deg, #B89228, #D4AF37); color: #060A12; font-weight: 900; font-size: 15px; width: 32px; height: 32px; line-height: 32px; border-radius: 8px; text-align: center; margin-right: 8px;">C</span>
              <span style="font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #F8FAFC;">CINE<span style="color: #D4AF37;">TIX</span></span>
              <p style="margin: 6px 0 0; color: #8493A8; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">Layanan Otentikasi Akun Google</p>
            </td>
          </tr>

          <!-- Konten Pesan -->
          <tr>
            <td style="padding: 24px 28px 20px;">
              <h2 style="font-size: 18px; margin: 0 0 12px; color: #F8FAFC; font-weight: 700;">Halo, Penonton CineTix</h2>
              <p style="font-size: 13px; line-height: 1.6; color: #CBD5E1; margin: 0 0 20px;">
                Kami mendeteksi permintaan masuk atau pendaftaran menggunakan <strong>Akun Google</strong> (<span style="color: #D4AF37;">${to}</span>).
              </p>

              <!-- Box OTP -->
              <div style="background-color: #131C31; border: 1px solid #27354F; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8493A8; font-weight: 700;">Kode Verifikasi 6-Digit</p>
                <div style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #D4AF37; font-family: monospace;">
                  ${otp}
                </div>
                <p style="margin: 8px 0 0; font-size: 11px; color: #8493A8;">Berlaku selama 10 menit ke depan.</p>
              </div>

              <!-- Konfirmasi "Ya, Ini Saya" -->
              <div style="background-color: #1A253F; border: 1px solid #27354F; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 13px; font-weight: 600; color: #F8FAFC; margin: 0 0 12px;">
                  Apakah ini benar Anda yang ingin masuk / mendaftar?
                </p>
                <a href="${magicLink}" target="_blank" style="display: inline-block; background-color: #D4AF37; color: #060A12; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);">
                  Ya, Ini Saya (Konfirmasi Masuk)
                </a>
                <p style="margin: 10px 0 0; font-size: 11px; color: #8493A8;">
                  Klik tombol di atas untuk masuk langsung tanpa harus mengetik kode OTP.
                </p>
              </div>

              <!-- Peringatan Keamanan -->
              <div style="border-left: 3px solid #FB7185; background-color: rgba(251, 113, 133, 0.1); padding: 12px 14px; border-radius: 0 8px 8px 0;">
                <p style="font-size: 11px; line-height: 1.5; color: #FDA4AF; margin: 0;">
                  <strong>Peringatan Keamanan:</strong> Jika Anda tidak pernah merasa melakukan permintaan ini, abaikan email ini. Akun Anda tetap aman dan tidak akan dapat diakses tanpa persetujuan Anda.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px 24px; text-align: center; border-top: 1px solid #1E293B; color: #475569; font-size: 11px;">
              &copy; 2026 CineTix Cinema Network. Seluruh hak cipta dilindungi.<br>
              Pesan otomatis via CineTix SMTP Authentication Mailer.
            </td>
          </tr>
        </table>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html });
        this.logger.log(`Google Auth verification email sent to ${to}`);
        return true;
      } catch (error: any) {
        this.logger.error(`Failed to send Google Auth email via SMTP: ${error.message}`);
        this.logGoogleAuthToConsole(to, otp, magicLink);
        return false;
      }
    } else {
      this.logGoogleAuthToConsole(to, otp, magicLink);
      return true;
    }
  }

  private logGoogleAuthToConsole(to: string, otp: string, magicLink: string) {
    this.logger.log(`==================================================`);
    this.logger.log(`[GOOGLE AUTH DISPATCH] Tujuan: ${to}`);
    this.logger.log(`[GOOGLE AUTH DISPATCH] KODE OTP: >>> ${otp} <<<`);
    this.logger.log(`[GOOGLE AUTH DISPATCH] LINK "YA, INI SAYA": ${magicLink}`);
    this.logger.log(`==================================================`);
  }
}
