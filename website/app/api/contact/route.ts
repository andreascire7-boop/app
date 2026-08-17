import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;
  const { name, email, phone, service, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
    console.log("[contact] SMTP non configurato, richiesta ricevuta:", body);
    return NextResponse.json({ ok: true, delivered: false });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Sito Andrea Scirè" <${SMTP_USER}>`,
    to: CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `Nuova richiesta dal sito — ${service ?? "info generali"}`,
    text: [
      `Nome: ${name}`,
      `Email: ${email}`,
      phone ? `Telefono: ${phone}` : null,
      service ? `Servizio: ${service}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return NextResponse.json({ ok: true, delivered: true });
}
