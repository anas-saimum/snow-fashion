import { persistenceMode } from "@/lib/repositories";
import { getAdminSession, type AdminSession } from "@/lib/supabase/session";

export interface AdminAccess {
  mode: typeof persistenceMode;
  session: AdminSession | null;
  /** True when writes will actually persist somewhere durable. */
  durable: boolean;
}

/**
 * Resolves who is allowed to do what, for both pages and actions.
 *
 *  * supabase  — a real session in the `admins` table is required.
 *  * memory    — development only. No auth backend exists, so the dashboard
 *                runs unauthenticated and says so loudly. Never reachable in
 *                production; see lib/repositories/index.ts.
 *  * read-only — no backend at all. Refuse, rather than offer an editor that
 *                silently discards everything.
 */
export async function resolveAdminAccess(): Promise<AdminAccess> {
  if (persistenceMode === "supabase") {
    const session = await getAdminSession();
    return { mode: "supabase", session, durable: true };
  }

  if (persistenceMode === "memory") {
    return { mode: "memory", session: null, durable: false };
  }

  return { mode: "read-only", session: null, durable: false };
}

/** For Server Actions: throws unless the caller may write. */
export async function assertCanWrite(): Promise<AdminAccess> {
  const access = await resolveAdminAccess();

  if (access.mode === "read-only") {
    throw new Error(
      "No writable backend is configured, so nothing can be saved. " +
        "Connect Supabase first — see README → Admin dashboard.",
    );
  }

  if (access.mode === "supabase" && !access.session) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return access;
}
