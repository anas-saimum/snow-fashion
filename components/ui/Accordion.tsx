"use client";

import { useId, useState, type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Ids open on first render. */
  defaultOpen?: string[];
  /** Only one panel open at a time. */
  single?: boolean;
}

/** Native disclosure semantics: real buttons, aria-expanded, aria-controls. */
export function Accordion({ items, defaultOpen = [], single }: AccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<string[]>(defaultOpen);

  const toggle = (id: string) =>
    setOpen((current) => {
      const isOpen = current.includes(id);
      if (single) return isOpen ? [] : [id];
      return isOpen ? current.filter((i) => i !== id) : [...current, id];
    });

  return (
    <div className="divide-y divide-stone border-y border-stone">
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const panelId = baseId + "-" + item.id;

        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 py-4 text-left
                           font-sans text-caption font-medium uppercase tracking-[0.1em]
                           text-ink transition-colors hover:text-accent"
              >
                {item.title}
                {isOpen ? (
                  <Minus className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Plus className="size-4 shrink-0" aria-hidden="true" />
                )}
              </button>
            </h3>

            <div id={panelId} hidden={!isOpen} className="pb-6 pr-4">
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
