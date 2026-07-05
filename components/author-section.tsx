import { CrownEmblem } from "@/components/crown-emblem";
import Image from "next/image";

export function AuthorSection() {
  return (
    <section id="auteur" className="border-t border-border/60 py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <CrownEmblem className="mx-auto" />
        <div className="mt-8 grid items-center gap-8 rounded-2xl border border-border/60 bg-card p-8 md:grid-cols-[220px_1fr]">
          <Image
            src="/image-presentation.jpeg"
            alt="Apôtre Yves Castanou"
            width={220}
            height={290}
            className="mx-auto w-full max-w-55 rounded-xl border border-border/60"
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
              L&apos;auteur
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-foreground">
              Apôtre Yves Castanou
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Enseignant et orateur, il accompagne depuis des années des femmes
              et des hommes appelés à impacter leur génération. À travers la
              Masterclass ROYAUTÉ et ses enseignements, il transmet des
              fondations bibliques pour diriger avec responsabilité, intégrité
              et impact durable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
