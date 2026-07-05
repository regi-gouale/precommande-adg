import { IconCheck } from "@tabler/icons-react";

const chapters = [
  "Les fondements de la royauté selon Dieu",
  "L'identité du roi : appelé, façonné, envoyé",
  "Discerner et survivre en milieu hostile",
  "L'autorité spirituelle et son bon usage",
  "Diriger avec intégrité sous la pression",
  "Bâtir un héritage qui traverse les générations",
];

export function InsideBook() {
  return (
    <section
      id="sommaire"
      className="border-t border-border/60 bg-card/40 py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Au sommaire
          </p>
          <h2 className="text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Ce que vous découvrirez
          </h2>
          <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Six chapitres progressifs qui vous conduisent de la compréhension de
            votre appel royal jusqu&apos;à la construction d&apos;un impact
            durable.
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
