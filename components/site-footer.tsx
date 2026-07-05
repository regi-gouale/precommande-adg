import { IconCrown } from "@tabler/icons-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center">
        <a href="#top" className="flex items-center gap-2">
          <IconCrown className="size-6 text-gold" aria-hidden="true" />
          <span className="font-serif text-lg font-semibold tracking-wide text-foreground">
            Impacter <span className="text-gold">&amp;</span> Diriger
          </span>
        </a>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Impacter et Diriger en milieu hostile — Volume 1 : Comprendre la
          royauté selon Dieu.
        </p>
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <a href="#le-livre" className="transition-colors hover:text-gold">
            Le livre
          </a>
          <a href="#auteur" className="transition-colors hover:text-gold">
            L&apos;auteur
          </a>
          <a href="#precommande" className="transition-colors hover:text-gold">
            Précommander
          </a>
          <a href="#faq" className="transition-colors hover:text-gold">
            FAQ
          </a>
        </nav>
        <p className="text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} Impacter &amp; Diriger. Tous droits
          réservés.
        </p>
      </div>
    </footer>
  );
}
