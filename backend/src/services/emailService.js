import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const transport = env.SMTP_HOST && !env.SMTP_JSON_TRANSPORT
  ? nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE, auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } })
  : nodemailer.createTransport({ jsonTransport: true });

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

async function send({ to, subject, text, html }) {
  const result = await transport.sendMail({ from: env.SMTP_FROM, to, subject, text, html });
  if (!env.SMTP_HOST || env.SMTP_JSON_TRANSPORT) logger.info("Development email generated", { to, subject, message: result.message?.toString() });
  return result;
}

export const emailService = {
  sendVerification(user, token) {
    const url = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
    return send({ to: user.email, subject: "Verify your EstateFlow account", text: `Verify your email: ${url}`, html: `<p>Hello ${escapeHtml(user.firstName)},</p><p>Verify your email to activate your account:</p><p><a href="${url}">Verify email</a></p><p>This link expires in ${env.EMAIL_VERIFICATION_TTL_MINUTES} minutes.</p>` });
  },
  sendPasswordReset(user, token) {
    const url = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    return send({ to: user.email, subject: "Reset your EstateFlow password", text: `Reset your password: ${url}`, html: `<p>Hello ${escapeHtml(user.firstName)},</p><p>A password reset was requested for your account:</p><p><a href="${url}">Reset password</a></p><p>This link expires in ${env.PASSWORD_RESET_TTL_MINUTES} minutes. Ignore this message if you did not request it.</p>` });
  },
};
