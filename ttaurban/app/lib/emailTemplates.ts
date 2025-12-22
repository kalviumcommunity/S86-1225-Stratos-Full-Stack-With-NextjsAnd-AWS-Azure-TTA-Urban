/**
 * Email Templates for Transactional Emails
 * Reusable HTML templates for various email notifications
 */

export const welcomeTemplate = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏙️ Welcome to TTA-Urban</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName}! 👋</h2>
      <p>We're thrilled to have you onboard. TTA-Urban is your gateway to transparent and accountable urban governance.</p>
      <p>With your account, you can:</p>
      <ul>
        <li>Submit and track civic complaints</li>
        <li>Monitor complaint resolution progress</li>
        <li>Provide feedback on services</li>
        <li>Stay informed about your community</li>
      </ul>
      <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>&copy; 2025 TTA-Urban. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const passwordResetTemplate = (userName: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>We received a request to reset your password for your TTA-Urban account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" class="button">Reset Password</a>
      <div class="warning">
        <strong>⚠️ Security Notice:</strong>
        <ul>
          <li>This link expires in 1 hour</li>
          <li>If you didn't request this, please ignore this email</li>
          <li>Never share this link with anyone</li>
        </ul>
      </div>
      <p>For security reasons, this link can only be used once.</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>&copy; 2025 TTA-Urban. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const complaintStatusTemplate = (
  userName: string,
  complaintId: number,
  status: string,
  complaintTitle: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .status-badge { display: inline-block; background: #10B981; color: white; padding: 6px 12px; border-radius: 4px; font-size: 14px; }
    .complaint-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Complaint Status Update</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>Your complaint status has been updated!</p>
      <div class="complaint-info">
        <p><strong>Complaint ID:</strong> #${complaintId}</p>
        <p><strong>Title:</strong> ${complaintTitle}</p>
        <p><strong>New Status:</strong> <span class="status-badge">${status}</span></p>
      </div>
      <p>You can view the full details and track progress by clicking below:</p>
      <a href="http://localhost:3000/complaints/${complaintId}" class="button">View Complaint</a>
      <p>Thank you for using TTA-Urban to improve our community!</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>&copy; 2025 TTA-Urban. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const complaintResolvedTemplate = (
  userName: string,
  complaintId: number,
  complaintTitle: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-box { background: #D1FAE5; border-left: 4px solid #059669; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Complaint Resolved!</h1>
    </div>
    <div class="content">
      <h2>Great news, ${userName}!</h2>
      <div class="success-box">
        <h3>🎉 Your complaint has been resolved</h3>
        <p><strong>Complaint ID:</strong> #${complaintId}</p>
        <p><strong>Title:</strong> ${complaintTitle}</p>
      </div>
      <p>We're pleased to inform you that your complaint has been successfully resolved by our team.</p>
      <p>We value your feedback! Please take a moment to rate the service:</p>
      <div style="text-align: center;">
        <a href="http://localhost:3000/complaints/${complaintId}/feedback" class="button">Rate Service</a>
        <a href="http://localhost:3000/complaints/${complaintId}" class="button">View Details</a>
      </div>
      <p>Thank you for helping us improve our community services!</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>&copy; 2025 TTA-Urban. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const accountAlertTemplate = (
  userName: string,
  alertType: string,
  alertMessage: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .alert-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Account Security Alert</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <div class="alert-box">
        <h3>🔔 ${alertType}</h3>
        <p>${alertMessage}</p>
      </div>
      <p>If this was you, you can safely ignore this email. If you did not perform this action, please secure your account immediately.</p>
      <a href="http://localhost:3000/account/security" class="button">Review Account Security</a>
      <p>If you need assistance, please contact our support team.</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>&copy; 2025 TTA-Urban. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
