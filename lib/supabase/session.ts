import { isSupabaseConfigured } from "./config";
import { createSupabaseServerClient } from "./server";

export interface AdminSession {
  userId: string;
  email: string;
}

/**
 * Resolves the signed-in admin, or null.
 *
 * Two checks, both required: a valid Supabase session AND a row in `admins`.
 * Being able to sign in is not the same as being allowed to change the
 * catalogue — anyone who obtains an account is still not an admin until they
 * are listed. The database enforces the same rule through RLS, so this is
 * defence in depth rather than the only gate.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: admin, error } = await supabase
    .from("admins")
    .select("user_id, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !admin) return null;

  return { userId: admin.user_id, email: admin.email ?? user.email ?? "" };
}
