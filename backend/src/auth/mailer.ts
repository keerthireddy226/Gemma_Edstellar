import nodemailer from "nodemailer";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail(to: string, subject: string, text: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;
  await sendMail(email, "Verify your email — Gemma_Edstellar", `Verify your email by opening this link:\n\n${link}\n\nIf you didn't create this account, ignore this message.`);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;
  await sendMail(email, "Reset your password — Gemma_Edstellar", `Reset your password by opening this link (expires in 30 minutes):\n\n${link}\n\nIf you didn't request this, ignore this message.`);
}

export async function sendPlacementReminderEmail(email: string, token: string) {
  const link = `${FRONTEND_URL}/placement?reminder=${token}`;
  await sendMail(
    email,
    "Your placement test is waiting — Gemma_Edstellar",
    `Whenever you're ready, come back and take your placement test:\n\n${link}\n\nThis reminder is valid for 1 week — after that, log in and you can send yourself a new one.`,
  );
}
