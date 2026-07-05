import Image from "next/image";

export function AuthorSection() {
  return (
    <section id="auteur" className="border-t border-border/60 py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mx-auto mb-6 max-w-xl text-center">
          <h2 className="text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            L&apos;auteur
          </h2>
        </div>
        <div className="mt-8 grid items-center gap-8 rounded-2xl border border-border/60 bg-card p-8 md:grid-cols-[220px_1fr]">
          <Image
            src="/author.jpg"
            alt="Apôtre Yves Castanou"
            width={220}
            height={290}
            className="mx-auto w-full max-w-55 rounded-xl border border-border/60"
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
              Apôtre &amp; Enseignant
            </p>
            <h3 className="mt-3 font-serif text-3xl font-semibold text-foreground">
              Yves Castanou
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Enseignant et orateur reconnu, l&apos;apôtre Yves Castanou
              accompagne depuis des années des femmes et des hommes appelés à
              impacter leur génération. À travers la Masterclass ROYAUTÉ et ses
              enseignements, il transmet des fondations bibliques pour diriger
              avec responsabilité, intégrité et impact durable — dans toutes les
              sphères de la société.
            </p>
            <p className="mt-4 font-serif text-sm italic text-gold">
              « Ce volume est le fruit de ce que Dieu m&apos;a confié pour
              équiper ceux qu&apos;Il appelle. »
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
