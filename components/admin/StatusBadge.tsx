import { Badge } from "@/components/ui/Badge";
import type { ProductStatus } from "@/types";

const LABELS: Record<ProductStatus, { text: string; tone: "success" | "muted" | "paper" }> = {
  active: { text: "Live", tone: "success" },
  draft: { text: "Draft", tone: "muted" },
  archived: { text: "Archived", tone: "paper" },
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  const { text, tone } = LABELS[status];
  return <Badge tone={tone}>{text}</Badge>;
}
