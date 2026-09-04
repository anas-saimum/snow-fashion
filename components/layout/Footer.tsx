import Link from "next/link";
import { Facebook, Instagram, Music2 } from "lucide-react";
import { Logo } from "./Logo";
import { Newsletter } from "@/components/home/Newsletter";
import { footerNav } from "@/data/navigation";
import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site.config";

const socials = [
  { key: "facebook", label: "Facebook", Icon: Facebook, ...siteConfig.social.facebook },
  { key: "instagram", label: "Instagram", Icon: Instagram, ...siteConfig.social.instagram },
  { key: "tiktok", label: "TikTok", Icon: Music2, ...siteConfig.social.tiktok },
];

export function Footer() {
  return (
    <footer className="border-t border-stone bg-paper">
      <Newsletter />

      <div className="u-container border-t border-stone py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          {/* Brand block */}
          <div className="max-w-xs">
            <Logo size="md" />
            <p className="mt-5 text-caption leading-relaxed text-muted">
              {siteConfig.description}
            </p>
          </div>

          {footerNav.map((column) => (
            <nav key={column.title} aria-labelledby={"footer-" + column.title}>
              <h2
                id={"footer-" + column.title}
                className="u-eyebrow mb-5 text-ink"
              >
                {column.title}
              </h2>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="u-link text-caption text-ink-soft hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Follow us */}
          <nav aria-labelledby="footer-follow">
            <h2 id="footer-follow" className="u-eyebrow mb-5 text-ink">
              Follow Us
            </h2>
            <ul className="flex flex-col gap-3">
              {socials.map(({ key, label, Icon, url }) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex items-center gap-2.5 text-caption text-ink-soft hover:text-ink"
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="u-link">{label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-caption text-muted">
              {siteConfig.contact.email}
              <br />
              {siteConfig.contact.phone}
            </p>
          </nav>
        </div>
      </div>

      <div className="u-container border-t border-stone py-6">
        <div className="flex flex-col-reverse items-center justify-between gap-4 text-micro text-muted sm:flex-row">
          <p>
            {"© " + brand.copyrightYear + " " + brand.legalName + ". All rights reserved."}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy" className="u-link hover:text-ink">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="u-link hover:text-ink">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="u-link hover:text-ink">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/returns" className="u-link hover:text-ink">
                Returns
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
