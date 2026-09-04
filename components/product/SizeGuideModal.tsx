"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { SizeGuide } from "@/types";

/** Trigger + dialog pair, so the product page only needs the guide data. */
export function SizeGuideModal({ guide }: { guide: SizeGuide }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-micro font-medium uppercase tracking-[0.1em] text-muted transition-colors hover:text-ink"
      >
        <Ruler className="size-3.5" aria-hidden="true" />
        <span className="u-link">Size guide</span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={guide.title + " size guide"}
        description={guide.note}
      >
        <div className="p-6 sm:p-8">
          {/* Tables scroll inside their own container; the page never does. */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-caption">
              <thead>
                <tr className="border-b border-ink">
                  {guide.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="whitespace-nowrap px-3 py-3 text-micro font-medium uppercase tracking-[0.1em] text-ink first:pl-0"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.rows.map((row) => (
                  <tr key={row.join("-")} className="border-b border-stone">
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className={
                          "whitespace-nowrap px-3 py-3 tabular-nums first:pl-0 " +
                          (i === 0 ? "font-medium text-ink" : "text-ink-soft")
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-micro leading-relaxed text-muted">
            Measurements are a guide only and may vary by a centimetre or two
            between styles. If you are between sizes, our team is happy to
            advise — just get in touch.
          </p>
        </div>
      </Modal>
    </>
  );
}
