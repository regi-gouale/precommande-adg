import { IconCheck, IconCrown } from "@tabler/icons-react";
import { createPreorderCheckout } from "@/app/actions/preorder";
import { hasServerEnv, missingServerEnvKeys } from "@/lib/env";

const perks = [
  "Votre exemplaire dédicacé par l'apôtre Yves CASTANOU (exclusivité précommande)",
  "Le chapitre 1 complet en PDF, offert immédiatement",
];

export function PreorderSection() {
  const isCheckoutConfigured = hasServerEnv;

  return (
    <section
      id="precommande"
      className="border-t border-border/60 bg-card/40 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 overflow-hidden rounded-3xl border border-gold/30 bg-card p-8 md:grid-cols-2 md:p-10">
          <div>
            <IconCrown className="size-8 text-gold" aria-hidden="true" />
            <h2 className="mt-4 text-balance font-serif text-3xl font-semibold text-foreground">
              Précommandez aujourd&apos;hui votre exemplaire dédicacé
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Offre valable jusqu&apos;au 07/07/2026. Les livres précommandés
              sont à retirer à la Cité Royale pendant le Camp Impact Conférence.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
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

            <div className="mt-8">
              <span className="font-serif text-3xl font-semibold text-foreground">
                20,00 €
              </span>
            </div>

            {!isCheckoutConfigured ? (
              <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Configuration serveur incomplète. Variables manquantes:{" "}
                {missingServerEnvKeys.join(", ")}
              </p>
            ) : null}
          </div>

          <form
            action={createPreorderCheckout}
            className="grid gap-4 rounded-2xl border border-border/60 bg-background/40 p-5"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="rounded-lg border border-border bg-background px-3 py-2"
                name="firstName"
                placeholder="Prénom"
                required
                disabled={!isCheckoutConfigured}
              />
              <input
                className="rounded-lg border border-border bg-background px-3 py-2"
                name="lastName"
                placeholder="Nom"
                required
                disabled={!isCheckoutConfigured}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="rounded-lg border border-border bg-background px-3 py-2"
                name="email"
                placeholder="Email"
                type="email"
                required
                disabled={!isCheckoutConfigured}
              />
              <input
                className="rounded-lg border border-border bg-background px-3 py-2"
                name="phone"
                placeholder="Téléphone (optionnel)"
                disabled={!isCheckoutConfigured}
              />
            </div>

            <textarea
              className="min-h-24 rounded-lg border border-border bg-background px-3 py-2"
              name="shippingAddress"
              placeholder="Adresse de livraison"
              required
              disabled={!isCheckoutConfigured}
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <select
                className="rounded-lg border border-border bg-background px-3 py-2"
                name="offerSlug"
                required
                disabled={!isCheckoutConfigured}
              >
                <option value="livre-seul">Livre seul</option>
                <option value="livre-bonus">Livre + bonus</option>
                <option value="pack-livres">Pack livres</option>
              </select>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2"
                name="quantity"
                type="number"
                min={1}
                defaultValue={1}
                required
                disabled={!isCheckoutConfigured}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                name="cgvAccepted"
                type="checkbox"
                required
                disabled={!isCheckoutConfigured}
              />
              J&apos;accepte les CGV
            </label>

            <button
              className="mt-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:bg-gold/90 disabled:opacity-50"
              type="submit"
              disabled={!isCheckoutConfigured}
            >
              Je précommande mon exemplaire dédicacé
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
