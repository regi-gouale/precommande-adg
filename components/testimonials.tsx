import { IconBlockquote } from "@tabler/icons-react";

const testimonials = [
  {
    quote:
      "Une lecture qui bouscule et qui édifie. J'y ai trouvé des clés pour tenir bon dans mon leadership au quotidien.",
    name: "Marie L.",
    role: "Responsable associative",
  },
  {
    quote:
      "Enfin un ouvrage qui parle de royauté sans naïveté, en tenant compte des réalités hostiles du terrain.",
    name: "David N.",
    role: "Entrepreneur",
  },
  {
    quote:
      "Profond, structuré et inspirant. Je le recommande à tous ceux qui veulent diriger avec intégrité.",
    name: "Sarah K.",
    role: "Enseignante",
  },
];

export function Testimonials() {
  return (
    <section
      id="temoignages"
      className="border-t border-border/60 bg-card/40 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Ils l&apos;ont lu
          </p>
          <h2 className="text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Premiers retours des lecteurs
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-border/60 bg-card p-8"
            >
              <IconBlockquote
                className="size-8 text-gold/70"
                aria-hidden="true"
              />
              <blockquote className="mt-4 flex-1 leading-relaxed text-foreground">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-border/60 pt-4">
                <span className="block font-serif text-lg font-semibold text-foreground">
                  {t.name}
                </span>
                <span className="text-sm text-muted-foreground">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
