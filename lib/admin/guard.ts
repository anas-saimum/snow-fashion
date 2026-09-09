import { persistenceMode } from "@/lib/repositories";
import type { PersistenceMode } from "@/lib/repositories/admin.repository";
import type { AdminSession } from "@/lib/supabase/session";
import { authMode, getAdminSession, type AuthMode } from "./auth";

export interface AdminAccess {
  /** Where edits are stored. */
  mode: PersistenceMode;
  /** How staff sign in. */
  auth: AuthMode;
  session: AdminSession | null;
  /** True when writes will actually persist somewhere durable. */
  durable: boolean;
}

/**
 * Resolves who is allowed to do what, for both pages and actions.
 *
 * Storage and sign-in are independent axes:
 *
 *  * supabase storage always comes with Supabase sign-in — a real session in
 *    the `admins` table is required.
 *  * memory / read-only storage may still be behind a sign-in if
 *    ADMIN_LOGIN_ID and ADMIN_PASSWORD are set. Without those, development
 *    runs unauthenticated and says so loudly, and production refuses to
 *    offer an editor that silently discards everything.
 */
export async function resolveAdminAccess(): Promise<AdminAccess> {
  const session = authMode === "none" ? null : await getAdminSession();

  return {
    mode: persistenceMode,
    auth: authMode,
    session,
    durable: persistenceMode === "supabase",
  };
}

/** True when a sign-in is configured but this request has none. */
export function needsSignIn(access: AdminAccess): boolean {
  return access.auth !== "none" && !access.session;
}

/** For Server Actions: throws unless the caller may write. */
export async function assertCanWrite(): Promise<AdminAccess> {
  const access = await resolveAdminAccess();

  if (needsSignIn(access)) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (access.mode === "read-only") {
    throw new Error(
      "No writable backend is configured, so nothing can be saved. " +
        "Connect Supabase first — see README → Admin dashboard.",
    );
  }

  return access;
}
