"use client";

import { IconCrown } from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
  { label: "Le livre", href: "#le-livre" },
  { label: "Au sommaire", href: "#sommaire" },
  { label: "Précommande", href: "#precommande" },
  { label: "L'auteur", href: "#auteur" },
  { label: "FAQ", href: "#faq" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <IconCrown className="size-6 text-gold" aria-hidden="true" />
          <span className="font-serif text-lg font-semibold tracking-wide text-foreground">
            Impacter <span className="text-gold">&amp;</span> Diriger
          </span>
        </a>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navigation principale"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-light text-muted-foreground transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#precommande"
          className={buttonVariants({
            className:
              "bg-gold font-medium text-gold-foreground hover:bg-gold/90",
          })}
        >
          Précommander
        </a>
      </div>
    </header>
  );
}
