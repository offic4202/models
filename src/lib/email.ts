// Email configuration and utilities
// Uses nodemailer-style API for sending emails

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Get email config from environment
export function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: parseInt(port || "587", 10),
    secure: port === "465",
    user,
    pass,
    from: from || `"StreamRay" <${user}>`,
  };
}

// Check if email is configured
export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null;
}

// Send email (mock implementation - replace with actual SMTP library in production)
// For now, logs to console. In production, integrate with nodemailer or similar
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const config = getEmailConfig();

  if (!config) {
    console.log("[Email] SMTP not configured. Email would be sent to:", options.to);
    console.log("[Email] Subject:", options.subject);
    return false;
  }

  try {
    // In production, use nodemailer:
    // import nodemailer from 'nodemailer';
    // const transporter = nodemailer.createTransport({ ...config });
    // await transporter.sendMail({ from: config.from, ...options });

    console.log(`[Email] Sending to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

// Email templates
export async function sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    studio_owner: "Studio Owner",
    model: "Model",
    fan: "Fan",
  };

  await sendEmail({
    to: email,
    subject: `Welcome to StreamRay - ${roleLabels[role] || role} Account`,
    html: `
      <h1>Welcome to StreamRay, ${name}!</h1>
      <p>Your account has been created with the role: <strong>${roleLabels[role] || role}</strong></p>
      <p>Your account is pending approval. You will be notified once an administrator reviews your request.</p>
      <p>Login at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">Login</a></p>
    `,
  });
}

export async function sendApprovalEmail(
  email: string,
  name: string,
  approved: boolean,
  role: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: approved ? "Your StreamRay Account Has Been Approved" : "Your StreamRay Account Was Not Approved",
    html: approved
      ? `
        <h1>Account Approved, ${name}!</h1>
        <p>Your ${role} account has been approved. You can now access all features.</p>
        <p>Login at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">Login</a></p>
      `
      : `
        <h1>Account Update, ${name}</h1>
        <p>Unfortunately, your ${role} account was not approved at this time.</p>
        <p>Please contact support for more information.</p>
      `,
  });
}

export async function sendContentApprovalNotification(
  modelEmail: string,
  modelName: string,
  contentTitle: string,
  approved: boolean
): Promise<void> {
  await sendEmail({
    to: modelEmail,
    subject: approved ? "Your Content Has Been Approved" : "Your Content Was Not Approved",
    html: approved
      ? `
        <h1>Content Approved, ${modelName}!</h1>
        <p>Your content "${contentTitle}" has been approved and is now live.</p>
      `
      : `
        <h1>Content Update, ${modelName}</h1>
        <p>Your content "${contentTitle}" was not approved.</p>
        <p>Please review our content guidelines and resubmit.</p>
      `,
  });
}

export async function sendNewRegistrationNotification(
  adminEmail: string,
  userName: string,
  userEmail: string,
  role: string
): Promise<void> {
  await sendEmail({
    to: adminEmail,
    subject: `New ${role} Registration Pending Approval`,
    html: `
      <h1>New Registration</h1>
      <p>A new user has registered and requires approval:</p>
      <ul>
        <li>Name: ${userName}</li>
        <li>Email: ${userEmail}</li>
        <li>Role: ${role}</li>
      </ul>
      <p>Review at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin">Admin Panel</a></p>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  await sendEmail({
    to: email,
    subject: "Reset Your StreamRay Password",
    html: `
      <h1>Password Reset Request, ${name}</h1>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}
