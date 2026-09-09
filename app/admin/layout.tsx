import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { needsSignIn, resolveAdminAccess } from "@/lib/admin/guard";

/**
 * Never prerender the dashboard. It is per-session by nature, and at build
 * time there is no session and possibly no backend — which is exactly how the
 * first build of this phase failed, trying to statically render /admin.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  // The dashboard must never be indexed, even if a URL leaks.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Gate for everything under /admin.
 *
 * Middleware has already bounced unauthenticated visitors, so the job here is
 * authorisation. With Supabase, a valid session is not enough: the user must
 * be listed in the `admins` table, and RLS enforces the same rule at the
 * database, so this is the friendly layer rather than the only one. With the
 * environment-variable login, this re-checks the signed cookie so a page can
 * never render without it even if the middleware matcher were misconfigured.
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await resolveAdminAccess();

  if (needsSignIn(access)) {
    redirect("/admin/login");
  }

  if (access.mode === "read-only") {
    return <NoBackend />;
  }

  return (
    <AdminShell
      mode={access.mode}
      email={access.session?.email}
      canSignOut={access.auth !== "none"}
    >
      {children}
    </AdminShell>
  );
}

/**
 * Shown instead of an editor when no writable backend exists. Offering the
 * form here would mean an admin that looks like it saves and silently
 * discards everything, because serverless instances share no memory.
 */
function NoBackend() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-16">
      <span className="flex size-11 items-center justify-center border border-stone text-accent">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>

      <h1 className="mt-6 text-h2">The dashboard needs a database</h1>

      <p className="mt-4 text-body leading-relaxed text-ink-soft">
        The storefront runs happily on its built-in demo catalogue, but an
        admin panel has to write somewhere durable. Vercel&apos;s filesystem is
        read-only and every request may hit a different instance, so there is
        nowhere for an edit to go.
      </p>

      <ol className="mt-6 flex flex-col gap-3 text-caption leading-relaxed text-ink-soft">
        <li>
          <strong className="font-medium text-ink">1.</strong> Create a free
          project at{" "}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer noopener"
            className="u-link text-ink"
          >
            supabase.com
          </a>
          .
        </li>
        <li>
          <strong className="font-medium text-ink">2.</strong> Run{" "}
          <code className="bg-canvas px-1.5 py-0.5 text-micro">
            supabase/migrations/0001_catalogue.sql
          </code>{" "}
          then{" "}
          <code className="bg-canvas px-1.5 py-0.5 text-micro">
            0002_upsert_product.sql
          </code>{" "}
          in the SQL editor.
        </li>
        <li>
          <strong className="font-medium text-ink">3.</strong> Set{" "}
          <code className="bg-canvas px-1.5 py-0.5 text-micro">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="bg-canvas px-1.5 py-0.5 text-micro">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
          , then redeploy.
        </li>
      </ol>

      <p className="mt-6 text-caption text-muted">
        Full instructions are in the README under “Admin dashboard”.
      </p>
    </div>
  );
}
