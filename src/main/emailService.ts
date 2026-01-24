import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { settingsQueries } from "./database";

export interface EmailConfig {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
}

export interface TestResultEmail {
  testRunId: number;
  formName: string;
  paymentMethodName: string;
  status: "SUCCESS" | "FAILURE" | "STOPPED";
  errorMessage?: string;
  durationMs?: number;
  runAt: Date;
}

class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;

  /**
   * Load email configuration from database settings
   */
  loadConfig(): EmailConfig {
    const getSettingValue = (key: string, defaultValue: string): string => {
      const setting = settingsQueries.get(key);
      return setting?.value || defaultValue;
    };

    this.config = {
      enabled: getSettingValue("email_enabled", "false") === "true",
      smtpHost: getSettingValue("email_smtp_host", ""),
      smtpPort: parseInt(getSettingValue("email_smtp_port", "587")),
      smtpSecure: getSettingValue("email_smtp_secure", "false") === "true",
      smtpUser: getSettingValue("email_smtp_user", ""),
      smtpPass: getSettingValue("email_smtp_pass", ""),
      fromEmail: getSettingValue("email_from_email", ""),
      fromName: getSettingValue("email_from_name", "FormTest Server"),
      toEmail: getSettingValue("email_to_email", ""),
      notifyOnSuccess: getSettingValue("email_notify_success", "false") === "true",
      notifyOnFailure: getSettingValue("email_notify_failure", "true") === "true",
    };

    return this.config;
  }

  /**
   * Initialize the email transporter
   */
  async initialize(): Promise<boolean> {
    const config = this.loadConfig();

    if (!config.enabled) {
      console.log("EmailService: Email notifications are disabled");
      return false;
    }

    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      console.log("EmailService: SMTP configuration incomplete");
      return false;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log("EmailService: SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("EmailService: Failed to initialize SMTP connection:", error);
      this.transporter = null;
      return false;
    }
  }

  /**
   * Send a test result notification email
   */
  async sendTestResultNotification(result: TestResultEmail): Promise<boolean> {
    const config = this.loadConfig();

    if (!config.enabled) {
      return false;
    }

    // Check notification preferences
    if (result.status === "SUCCESS" && !config.notifyOnSuccess) {
      return false;
    }
    if ((result.status === "FAILURE" || result.status === "STOPPED") && !config.notifyOnFailure) {
      return false;
    }

    if (!this.transporter) {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
    }

    const isSuccess = result.status === "SUCCESS";
    const statusEmoji = isSuccess ? "✅" : "❌";
    const statusText = isSuccess ? "Erfolgreich" : result.status === "STOPPED" ? "Gestoppt" : "Fehlgeschlagen";
    const duration = result.durationMs ? `${(result.durationMs / 1000).toFixed(1)}s` : "N/A";

    const subject = `${statusEmoji} FormTest: ${result.formName} × ${result.paymentMethodName} - ${statusText}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { padding: 20px; background: ${isSuccess ? "#10b981" : "#ef4444"}; color: white; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .info-label { color: #666; }
    .info-value { font-weight: 500; }
    .error-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 12px; margin-top: 16px; color: #991b1b; }
    .footer { padding: 16px 20px; background: #f9fafb; color: #666; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${statusEmoji} Test ${statusText}</h1>
    </div>
    <div class="content">
      <div class="info-row">
        <span class="info-label">Formular</span>
        <span class="info-value">${result.formName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Bezahlmethode</span>
        <span class="info-value">${result.paymentMethodName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value">${statusText}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Dauer</span>
        <span class="info-value">${duration}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Zeitpunkt</span>
        <span class="info-value">${new Date(result.runAt).toLocaleString("de-DE")}</span>
      </div>
      ${result.errorMessage ? `
      <div class="error-box">
        <strong>Fehlermeldung:</strong><br>
        ${result.errorMessage}
      </div>
      ` : ""}
    </div>
    <div class="footer">
      Diese E-Mail wurde automatisch von FormTest Server gesendet.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
Test ${statusText}: ${result.formName} × ${result.paymentMethodName}

Status: ${statusText}
Dauer: ${duration}
Zeitpunkt: ${new Date(result.runAt).toLocaleString("de-DE")}
${result.errorMessage ? `\nFehler: ${result.errorMessage}` : ""}

--
FormTest Server
    `;

    try {
      await this.transporter!.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: config.toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`EmailService: Notification sent for test ${result.testRunId}`);
      return true;
    } catch (error) {
      console.error("EmailService: Failed to send notification:", error);
      return false;
    }
  }

  /**
   * Test the email configuration by sending a test email
   */
  async sendTestEmail(): Promise<{ success: boolean; message: string }> {
    const config = this.loadConfig();

    if (!config.smtpHost || !config.toEmail) {
      return { success: false, message: "SMTP-Konfiguration unvollständig" };
    }

    try {
      const initialized = await this.initialize();
      if (!initialized) {
        return { success: false, message: "SMTP-Verbindung fehlgeschlagen" };
      }

      await this.transporter!.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: config.toEmail,
        subject: "🧪 FormTest Server - Test E-Mail",
        text: "Dies ist eine Test-E-Mail von FormTest Server. Wenn Sie diese E-Mail erhalten, funktioniert die E-Mail-Konfiguration korrekt.",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>🧪 Test E-Mail</h2>
            <p>Dies ist eine Test-E-Mail von FormTest Server.</p>
            <p>Wenn Sie diese E-Mail erhalten, funktioniert die E-Mail-Konfiguration korrekt.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">FormTest Server</p>
          </div>
        `,
      });

      return { success: true, message: "Test-E-Mail erfolgreich gesendet" };
    } catch (error: any) {
      return { success: false, message: `Fehler: ${error.message}` };
    }
  }
}

export const emailService = new EmailService();
