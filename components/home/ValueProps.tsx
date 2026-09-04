import { Headphones, Package, Ruler, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

const values = [
  {
    Icon: Ruler,
    title: "Quality First",
    body: "Carefully selected fashion pieces, chosen for fabric, fit and how they wear over time.",
  },
  {
    Icon: Sparkles,
    title: "Modern Designs",
    body: "Styles inspired by modern fashion trends, cut to stay wearable well past a single season.",
  },
  {
    Icon: Package,
    title: "Easy Shopping",
    body: "Simple and convenient online shopping, with clear sizing and a checkout that gets out of the way.",
  },
  {
    Icon: Headphones,
    title: "Customer Support",
    body: "Helpful support whenever you need assistance — before, during and after your order.",
  },
];

export function ValueProps() {
  return (
    <section aria-labelledby="values-heading" className="u-section">
      <div className="u-container">
        <SectionHeader
          eyebrow="Why Snow Fashion"
          title="Built on the details"
          headingId="values-heading"
          align="center"
        />

        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <li key={value.title}>
              <Reveal delay={index * 70} className="group flex flex-col">
                <span className="flex size-11 items-center justify-center border border-stone text-ink transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                  <value.Icon className="size-5" aria-hidden="true" />
                </span>

                <h3 className="mt-5 font-sans text-caption font-medium uppercase tracking-[0.12em] text-ink">
                  {value.title}
                </h3>

                <p className="mt-3 text-caption leading-relaxed text-muted">
                  {value.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
