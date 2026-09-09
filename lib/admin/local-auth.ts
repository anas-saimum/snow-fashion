/**
 * Credential-based admin sign-in without a database.
 *
 * One login ID and one password, set in the server's environment
 * (ADMIN_LOGIN_ID / ADMIN_PASSWORD). A successful sign-in issues an HMAC-signed,
 * time-limited session cookie; every request under /admin checks it.
 *
 * Deliberately dependency-free and built on Web Crypto only, because the same
 * code runs in the Edge middleware and in Node server actions.
 *
 * Used when Supabase is not configured. With Supabase, its own accounts and
 * the `admins` table take over — see lib/admin/auth.ts.
 */

export const ADMIN_SESSION_COOKIE = "sf_admin_session";

/** Seven days, then sign in again. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface LocalAuthConfig {
  loginId: string;
  password: string;
  /** HMAC key for the session cookie. */
  secret: string;
}

export interface LocalSession {
  /** The login ID the cookie was issued for. */
  sub: string;
  /** Expiry, epoch milliseconds. */
  exp: number;
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Null unless both ADMIN_LOGIN_ID and ADMIN_PASSWORD are set.
 *
 * ADMIN_SESSION_SECRET is optional: without it the cookie is signed with a
 * key derived from the credentials, so changing the password also signs
 * everyone out. Setting it separately lets you rotate the two independently.
 *
 * Read on every call rather than once at import, so a test can vary the
 * environment and the middleware bundle never captures a stale value.
 */
export function getLocalAuthConfig(): LocalAuthConfig | null {
  const loginId = clean(process.env.ADMIN_LOGIN_ID);
  const password = clean(process.env.ADMIN_PASSWORD);
  if (!loginId || !password) return null;

  const secret =
    clean(process.env.ADMIN_SESSION_SECRET) ?? loginId + " " + password;

  return { loginId, password, secret };
}

/* ------------------------------ primitives ------------------------------- */

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  } catch {
    return null;
  }
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

/**
 * Constant-time string comparison. Both inputs are always HMAC digests of the
 * same length here, so the early length check leaks nothing useful.
 */
function safeEqual(a: string, b: string): boolean {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/* ------------------------------ credentials ------------------------------ */

/**
 * Checks a submitted login ID and password.
 *
 * The login ID is case-insensitive (like an email address); the password is
 * not. Both are compared as keyed digests so that neither the length nor the
 * position of a mismatch can be timed.
 */
export async function verifyCredentials(
  config: LocalAuthConfig,
  loginId: string,
  password: string,
): Promise<boolean> {
  const [expectedId, givenId, expectedPw, givenPw] = await Promise.all([
    hmac(config.secret, "id:" + config.loginId.toLowerCase()),
    hmac(config.secret, "id:" + loginId.trim().toLowerCase()),
    hmac(config.secret, "pw:" + config.password),
    hmac(config.secret, "pw:" + password),
  ]);

  // Evaluate both so a wrong ID costs the same time as a wrong password.
  const idOk = safeEqual(expectedId, givenId);
  const pwOk = safeEqual(expectedPw, givenPw);
  return idOk && pwOk;
}

/* -------------------------------- session -------------------------------- */

export async function createSessionToken(
  config: LocalAuthConfig,
  now: number = Date.now(),
): Promise<string> {
  const session: LocalSession = {
    sub: config.loginId,
    exp: now + SESSION_TTL_SECONDS * 1000,
  };
  const payload = toBase64Url(encoder.encode(JSON.stringify(session)));
  const signature = await hmac(config.secret, payload);
  return payload + "." + signature;
}

/** The session the token carries, or null if it is forged, stale or foreign. */
export async function verifySessionToken(
  config: LocalAuthConfig,
  token: string | undefined,
  now: number = Date.now(),
): Promise<LocalSession | null> {
  if (!token) return null;

  const dot = token.indexOf(".");
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = await hmac(config.secret, payload);
  if (!safeEqual(expected, signature)) return null;

  const json = fromBase64Url(payload);
  if (!json) return null;

  let session: LocalSession;
  try {
    session = JSON.parse(json) as LocalSession;
  } catch {
    return null;
  }

  if (typeof session.exp !== "number" || session.exp <= now) return null;
  // A cookie issued for a previous login ID is not valid for the current one.
  if (session.sub !== config.loginId) return null;

  return session;
}

/** Cookie attributes shared by sign-in (set) and the middleware (clear). */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
