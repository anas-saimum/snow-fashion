import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "./ContactForm";
import { siteConfig } from "@/config/site.config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with the Snow Fashion team about sizing, fabrics, orders or returns.",
  path: "/contact",
});

const details = [
  { Icon: Mail, label: "Email", value: siteConfig.contact.email, href: "mailto:" + siteConfig.contact.email },
  { Icon: Phone, label: "Phone", value: siteConfig.contact.phone, href: "tel:" + siteConfig.contact.phone.replace(/[^\d+]/g, "") },
  { Icon: MapPin, label: "Studio", value: siteConfig.contact.address },
  { Icon: Clock, label: "Hours", value: siteConfig.contact.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="We are listening"
        title="Contact"
        description="Questions about a piece, an order or a return? Send us a note and we will come back to you."
        trail={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />

      <div className="u-container py-12 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          {/* Details */}
          <div>
            <h2 className="u-eyebrow text-ink">Get in touch</h2>

            <dl className="mt-7 flex flex-col gap-7">
              {details.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex gap-4">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-stone text-accent">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-micro font-medium uppercase tracking-[0.12em] text-ink">
                      {label}
                    </dt>
                    <dd className="mt-1 text-caption leading-relaxed text-ink-soft">
                      {href ? (
                        <a href={href} className="u-link hover:text-ink">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-10 border-t border-stone pt-8">
              <h3 className="u-eyebrow text-ink">Before you write</h3>
              <ul className="mt-4 flex flex-col gap-2 text-caption text-ink-soft">
                <li>
                  <a href="/shipping" className="u-link">
                    Shipping times and costs
                  </a>
                </li>
                <li>
                  <a href="/returns" className="u-link">
                    How returns work
                  </a>
                </li>
                <li>
                  <a href="/shop" className="u-link">
                    Browse the collection
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="u-eyebrow mb-7 text-ink">Send a message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
