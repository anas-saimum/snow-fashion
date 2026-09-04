import { NextResponse } from "next/server";
import { validateNewsletter } from "@/lib/validation/forms";

/**
 * Newsletter signup endpoint.
 *
 * STUB: validates the address and logs it. No email provider is connected, so
 * nothing is stored or subscribed. The response message is worded to say only
 * what actually happened — do not change it to promise a subscription until a
 * provider (Klaviyo, Mailchimp, Resend…) is wired in below.
 */
export async function POST(request: Request) {
  let email = "";

  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email : "";
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  const errors = validateNewsletter(email);
  if (errors.email) {
    return NextResponse.json(
      { ok: false, message: errors.email },
      { status: 422 },
    );
  }

  // TODO: replace with a real provider call.
  console.info("[newsletter] signup received:", email.trim().toLowerCase());

  return NextResponse.json({
    ok: true,
    message:
      "Thank you — we have your email address and will be in touch when the next collection lands.",
  });
}
