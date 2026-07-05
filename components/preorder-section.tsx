import {
  IconCheck,
  IconCrown,
  IconLock,
  IconShield,
} from "@tabler/icons-react";
import { createPreorderCheckout } from "@/app/actions/preorder";
import { PreorderForm } from "@/components/preorder-form";
import { hasPreorderEnv, missingPreorderEnvKeys } from "@/lib/env";

const perks = [
  "Votre exemplaire dédicacé par l'apôtre Yves CASTANOU",
  "Le chapitre 1 complet en PDF, offert immédiatement",
];

export function PreorderSection() {
  const isCheckoutConfigured = hasPreorderEnv;

  return (
    <section
      id="precommande"
      className="border-t border-border/60 bg-card/40 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
            <IconCrown className="size-3.5" aria-hidden="true" />
            Offre précommande exclusive
          </span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Réservez votre exemplaire dédicacé
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Offre valable jusqu&apos;au{" "}
            <strong className="text-foreground">07/07/2026</strong>. Les livres
            sont à retirer à la Cité Royale pendant le Camp Impact Conférence.
          </p>
        </div>

        <div className="grid gap-8 overflow-hidden rounded-3xl border border-gold/30 bg-card p-6 md:grid-cols-2 md:p-10">
          {/* Left: offer details */}
          <div className="flex flex-col gap-6">
            <ul className="flex flex-col gap-3">
              {perks.map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <IconCheck className="size-3.5" aria-hidden="true" />
                  </span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Prix total
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-semibold text-foreground">
                  20,00 €
                </span>
                <span className="text-sm text-muted-foreground">
                  / exemplaire
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Prix définitif, aucun frais supplémentaire
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconLock
                  className="size-3.5 shrink-0 text-green-500"
                  aria-hidden="true"
                />
                Paiement 100 % sécurisé via Stripe
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconShield
                  className="size-3.5 shrink-0 text-gold"
                  aria-hidden="true"
                />
                Vos données ne sont jamais revendues
              </div>
            </div>
          </div>

          {/* Right: form */}
          <PreorderForm
            isCheckoutConfigured={isCheckoutConfigured}
            missingKeys={missingPreorderEnvKeys}
            onSubmit={createPreorderCheckout}
          />
        </div>
      </div>
    </section>
  );
}
