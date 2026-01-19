import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP or other email service
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'TTA-Urban'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export function getPasswordResetEmailTemplate(resetUrl: string, userName?: string) {
  return {
    subject: 'Reset Your TTA-Urban Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">TTA-Urban</h1>
            <p style="color: white; margin: 10px 0 0 0;">Urban Grievance Management System</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">Password Reset Request</h2>
            
            ${userName ? `<p>Hi ${userName},</p>` : '<p>Hi,</p>'}
            
            <p>We received a request to reset your password for your TTA-Urban account. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #667eea;">
              ${resetUrl}
            </p>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; margin: 0;">
              This is an automated email from TTA-Urban. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
TTA-Urban - Password Reset Request

${userName ? `Hi ${userName},` : 'Hi,'}

We received a request to reset your password for your TTA-Urban account.

Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
This is an automated email from TTA-Urban. Please do not reply to this email.
    `.trim(),
  };
}
