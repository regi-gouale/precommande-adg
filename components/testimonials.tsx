import { buttonVariants } from "@/components/ui/button";

const faqItems = [
  {
    question: "Quelle est la date de sortie ?",
    answer: "Le volume 1 sort le 07/07/2026.",
  },
  {
    question: "Quel est le prix du livre ?",
    answer: "Le prix est fixé à 20,00 €.",
  },
  {
    question: "Comment récupérer ma précommande ?",
    answer:
      "Les livres précommandés sont à retirer à la Cité Royale pendant le Camp Impact Conférence.",
  },
];

export function Testimonials() {
  return (
    <section
      id="faq"
      className="border-t border-border/60 bg-card/40 py-20 md:py-28"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-2xl border border-gold/30 bg-card p-8 md:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Rappel de l&apos;offre
          </p>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Exemplaire dédicacé + chapitre 1 offert
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Précommandez maintenant pour recevoir votre exemplaire dédicacé et
            le chapitre 1 en PDF. Offre valable jusqu&apos;au 07/07/2026.
          </p>
          <a
            href="#precommande"
            className={buttonVariants({
              size: "lg",
              className:
                "mt-6 bg-gold px-8 text-base font-medium text-gold-foreground hover:bg-gold/90",
            })}
          >
            Je précommande
          </a>
        </div>

        <div className="mt-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gold">
            FAQ
          </p>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-border/60 bg-card p-6"
              >
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
