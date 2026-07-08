import { IconBookmark } from "@tabler/icons-react";
import { PreorderButton } from "@/components/preorder-button";

const faqItems = [
  {
    question: "Quelle est la date de sortie ?",
    answer:
      "Le volume 1 sort le 07/07/2026, remis en mains propres lors du Camp Impact Conférence à la Cité Royale.",
  },
  {
    question: "Quel est le prix du livre ?",
    answer:
      "Le prix est fixé à 20,00 €. Aucun frais de port — retrait uniquement à l'événement.",
  },
  {
    question: "Comment récupérer ma précommande ?",
    answer:
      "Les livres précommandés sont à retirer à la Cité Royale pendant le Camp Impact Conférence. Vous recevrez les détails pratiques par e-mail.",
  },
  {
    question: "Quand reçois-je le chapitre 1 PDF ?",
    answer:
      "Immédiatement après confirmation de votre précommande, vous recevrez le chapitre 1 complet par e-mail.",
  },
];

export function Testimonials() {
  return (
    <section
      id="faq"
      className="border-t border-border/60 bg-card/40 py-20 md:py-28"
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* Offer recap */}
        <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-8 md:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(60% 80% at 80% 20%, oklch(0.85 0.2 91) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
              <IconBookmark className="size-3" aria-hidden="true" />
              Dernière chance
            </span>
            <h2 className="mt-4 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Ne manquez pas cette offre exclusive
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              Exemplaire dédicacé par l&apos;apôtre Yves CASTANOU + chapitre 1
              complet en PDF offert immédiatement.{" "}
              <strong className="text-foreground">
                Offre valable jusqu&apos;au 07/07/2026 uniquement.
              </strong>
            </p>
            <PreorderButton
              description="Je précommande maintenant"
              url="#precommande"
              isIconAdded
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-foreground">
            Questions fréquentes
          </h3>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-border/60 bg-card p-6"
              >
                <h4 className="font-serif text-lg font-semibold text-foreground">
                  {item.question}
                </h4>
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
