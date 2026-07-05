const pillars = [
  {
    title: "Un appel à se préparer",
    text: "Le grand drame n'est pas le manque de positions, mais des hommes et des femmes élevés sans préparation.",
  },
  {
    title: "Une métamorphose intérieure",
    text: "La royauté selon Dieu n'est pas un privilège réservé à quelques-uns, mais une école où Dieu façonne ceux qu'Il appelle.",
  },
  {
    title: "Un impact concret",
    text: "Entreprise, politique, ministère, famille: ce volume pose des fondations solides pour diriger avec droiture dans toutes les sphères.",
  },
];

export function AboutBook() {
  return (
    <section id="le-livre" className="border-t border-border/60 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Vous sentez qu&apos;il y a plus...
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Peut-être avez-vous déjà été élevé à une position de responsabilité,
            sans avoir été préparé à la porter. Peut-être aspirez-vous à
            l&apos;influence, sans savoir pourquoi les portes ne s&apos;ouvrent
            pas. Ce premier volume, issu de la Masterclass ROYAUTÉ, établit les
            bases de la royauté selon Dieu pour vous préparer à diriger.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border/60 bg-card p-8 transition-colors hover:border-gold/50"
            >
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
