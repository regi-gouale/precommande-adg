import { IconCheck } from "@tabler/icons-react";

const chapters = [
  "Pourquoi vous êtes appelé « roi et sacrificateur » et ce que cela change concrètement.",
  "La différence radicale entre le leadership selon le monde et la royauté selon Dieu.",
  "Pourquoi toute élévation durable se décrète d'abord dans le monde invisible.",
  "Les principes divins qui gouvernent promotions, destitutions et retournements.",
  "Comment Dieu soutient ceux qu'Il élève.",
  "Comment devenir un serviteur disponible, disposé et prêt à répondre à Dieu.",
];

export function InsideBook() {
  return (
    <section
      id="sommaire"
      className="border-t border-border/60 bg-card/40 py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
        <div>
          <h2 className="text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Ce que vous découvrirez
          </h2>
          <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Des enseignements clairs pour comprendre les fondements de la
            royauté selon Dieu et vous préparer à exercer une influence durable.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {chapters.map((chapter, i) => (
            <li
              key={chapter}
              className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-5"
            >
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <IconCheck className="size-4" aria-hidden="true" />
              </span>
              <span className="text-foreground">
                <span className="mr-2 font-serif text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {chapter}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
