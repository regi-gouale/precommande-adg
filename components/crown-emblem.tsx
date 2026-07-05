import { IconCrown } from "@tabler/icons-react";

export function CrownEmblem({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border border-gold/40 bg-gold/10 p-2 text-gold ${className ?? ""}`}
    >
      <IconCrown className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}
