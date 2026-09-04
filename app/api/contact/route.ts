import { NextResponse } from "next/server";
import { hasErrors, validateContact } from "@/lib/validation/forms";

/**
 * Contact form endpoint.
 *
 * STUB: validates the submission and logs it server-side. No mail provider is
 * connected, so nothing is delivered anywhere. Wire in a transactional email
 * provider (or a ticketing webhook) where the TODO is before relying on this.
 */
export async function POST(request: Request) {
  let payload = { name: "", email: "", subject: "", message: "" };

  try {
    const body = (await request.json()) as Record<string, unknown>;
    payload = {
      name: typeof body.name === "string" ? body.name : "",
      email: typeof body.email === "string" ? body.email : "",
      subject: typeof body.subject === "string" ? body.subject : "",
      message: typeof body.message === "string" ? body.message : "",
    };
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  const errors = validateContact(payload);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { ok: false, message: "Please check the form and try again.", errors },
      { status: 422 },
    );
  }

  // TODO: forward to a mail provider / support inbox.
  console.info("[contact] message received:", {
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    length: payload.message.length,
  });

  return NextResponse.json({
    ok: true,
    message:
      "Thank you — we have received your message and will reply to the email address you gave us.",
  });
}
