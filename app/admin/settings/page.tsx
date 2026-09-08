import { LogoManager } from "@/components/admin/LogoManager";
import { adminSettingsRepository, persistenceMode } from "@/lib/repositories";
import { siteConfig } from "@/config/site.config";

export default async function AdminSettingsPage() {
  const settings = (await adminSettingsRepository?.get()) ?? {};

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <p className="u-eyebrow">Brand</p>
        <h1 className="mt-2 text-h2">Brand &amp; logo</h1>
      </header>

      <section aria-labelledby="logo-heading" className="mt-10">
        <h2 id="logo-heading" className="u-eyebrow text-ink">
          Logo
        </h2>
        <p className="mt-2 max-w-xl text-caption leading-relaxed text-muted">
          The header currently uses the typographic{" "}
          <span className="u-wordmark text-ink">Snow Fashion</span> wordmark.
          Upload an image to use that instead — a transparent PNG or SVG,
          roughly 400×100, reads best against the white header.
        </p>

        <div className="mt-6">
          <LogoManager
            logoUrl={settings.logoUrl}
            canUpload={persistenceMode === "supabase"}
          />
        </div>
      </section>

      {/* Everything below is file-configured for now: honest about where the
          boundary of this phase sits rather than showing dead inputs. */}
      <section aria-labelledby="config-heading" className="mt-14">
        <h2 id="config-heading" className="u-eyebrow text-ink">
          Set in code, for now
        </h2>
        <p className="mt-2 text-caption text-muted">
          These are read from{" "}
          <code className="bg-canvas px-1.5 py-0.5 text-micro">
            config/site.config.ts
          </code>{" "}
          and{" "}
          <code className="bg-canvas px-1.5 py-0.5 text-micro">
            config/shipping.config.ts
          </code>
          . Editing them from here is a later phase — showing you inputs that
          do nothing would be worse than showing you the values.
        </p>

        <dl className="mt-6 divide-y divide-stone border border-stone bg-paper">
          {[
            ["Store name", siteConfig.name],
            ["Contact email", siteConfig.contact.email],
            ["Phone", siteConfig.contact.phone],
            ["Address", siteConfig.contact.address],
            ["Instagram", siteConfig.social.instagram.handle],
            ["Currency", siteConfig.currency],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3"
            >
              <dt className="text-micro uppercase tracking-[0.1em] text-muted">
                {label}
              </dt>
              <dd className="text-caption text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
