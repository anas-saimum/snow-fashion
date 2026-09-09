import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/layout/Logo";
import { authMode, getAdminSession } from "@/lib/admin/auth";

/** Reads the current session, so it can never be prerendered. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Deliberately outside app/admin/, in its own route group.
 *
 * If it lived under app/admin/layout.tsx it would inherit that layout's
 * "no session → redirect to /admin/login" rule and loop forever.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Nothing to sign in with: no Supabase and no ADMIN_LOGIN_ID/PASSWORD. The
  // dashboard runs in labelled demo mode instead of pretending to have
  // accounts.
  if (authMode === "none") {
    redirect("/admin");
  }

  const [{ next }, session] = await Promise.all([searchParams, getAdminSession()]);

  if (session) redirect(next && next.startsWith("/admin") ? next : "/admin");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Logo size="md" />
          <p className="u-eyebrow mt-3">Store administration</p>
        </div>

        <div className="mt-8 border border-stone bg-paper p-6 sm:p-8">
          <h1 className="text-h3">Sign in</h1>
          <p className="mt-2 text-caption text-muted">
            This area is for store staff. Customer accounts are separate and
            not yet available.
          </p>

          <LoginForm nextPath={next} method={authMode} />
        </div>

        <p className="mt-6 text-center text-micro leading-relaxed text-muted">
          {authMode === "supabase"
            ? "Forgotten the password? Reset it from the Authentication section of your Supabase dashboard — there is no self-service reset here yet."
            : "Forgotten the password? The site owner sets it in the server's environment variables — there is no self-service reset."}
        </p>
      </div>
    </div>
  );
}
