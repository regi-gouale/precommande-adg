import { CrownEmblem } from "@/components/crown-emblem";

export function AuthorSection() {
  return (
    <section id="auteur" className="border-t border-border/60 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <CrownEmblem className="mx-auto" />
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-gold">
          Le mot de l&apos;auteur
        </p>
        <blockquote className="mt-6 text-balance font-serif text-2xl italic leading-relaxed text-foreground sm:text-3xl">
          « La véritable royauté ne se mesure pas au confort du trône, mais à la
          fidélité dont on fait preuve dans la tempête. »
        </blockquote>
        <p className="mt-8 leading-relaxed text-muted-foreground">
          Fruit de plusieurs années d&apos;enseignement et d&apos;expérience de
          terrain, ce livre est né d&apos;une conviction : Dieu appelle des
          hommes et des femmes à régner avec justice, y compris dans les
          environnements les plus hostiles. Ce premier volume est une invitation
          à redécouvrir cet appel.
        </p>
        <p className="mt-6 font-serif text-lg font-semibold text-gold">
          — L&apos;Auteur
        </p>
      </div>
    </section>
  );
}
