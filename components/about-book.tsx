import { IconCompass, IconFlame, IconShieldCheck } from "@tabler/icons-react";

const pillars = [
  {
    icon: IconCompass,
    title: "Une vision royale",
    text: "Découvrez ce que signifie véritablement régner selon le cœur de Dieu, au-delà des titres et des apparences.",
  },
  {
    icon: IconShieldCheck,
    title: "Tenir en milieu hostile",
    text: "Des principes concrets pour rester debout, intègre et fructueux là où tout pousse au découragement.",
  },
  {
    icon: IconFlame,
    title: "Un impact durable",
    text: "Apprenez à exercer une influence qui transforme les environnements et marque les générations.",
  },
];

export function AboutBook() {
  return (
    <section id="le-livre" className="border-t border-border/60 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gold">
            À propos du livre
          </p>
          <h2 className="text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Régner avec sagesse au cœur de l&apos;adversité
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Ce premier volume pose les fondations d&apos;une royauté selon Dieu.
            Il s&apos;adresse aux leaders, aux serviteurs et à tous ceux qui
            aspirent à diriger avec droiture dans des contextes difficiles, sans
            renier leurs valeurs ni leur foi.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border/60 bg-card p-8 transition-colors hover:border-gold/50"
            >
              <span className="inline-flex rounded-xl border border-gold/40 bg-gold/10 p-3 text-gold">
                <p.icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
