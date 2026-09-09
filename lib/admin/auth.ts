import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  getAdminSession as getSupabaseAdminSession,
  type AdminSession,
} from "@/lib/supabase/session";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  getLocalAuthConfig,
  sessionCookieOptions,
  verifyCredentials,
  verifySessionToken,
} from "./local-auth";

/**
 * How staff prove who they are.
 *
 *  * supabase — Supabase Auth accounts listed in the `admins` table. Used
 *               whenever Supabase is configured, because its row-level
 *               security needs a real Supabase session to allow writes.
 *  * local    — a single login ID and password from the environment
 *               (ADMIN_LOGIN_ID / ADMIN_PASSWORD), with a signed cookie.
 *  * none     — no credentials configured. Development runs the dashboard
 *               open in demo mode; production refuses to load it.
 */
export type AuthMode = "supabase" | "local" | "none";

export const authMode: AuthMode = isSupabaseConfigured
  ? "supabase"
  : getLocalAuthConfig()
    ? "local"
    : "none";

/** The signed-in admin for the current request, whichever method is active. */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (authMode === "supabase") return getSupabaseAdminSession();

  if (authMode === "local") {
    const config = getLocalAuthConfig();
    if (!config) return null;

    const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
    const session = await verifySessionToken(config, token);
    if (!session) return null;

    // There is exactly one local admin; `email` carries the login ID so the
    // shell can show who is signed in without a second field.
    return { userId: "local-admin", email: session.sub };
  }

  return null;
}

/** Local mode only: checks the credentials and, if they match, sets the cookie. */
export async function signInWithCredentials(
  loginId: string,
  password: string,
): Promise<boolean> {
  const config = getLocalAuthConfig();
  if (!config) return false;

  if (!(await verifyCredentials(config, loginId, password))) return false;

  const token = await createSessionToken(config);
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions());
  return true;
}

export async function clearLocalSession(): Promise<void> {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}
