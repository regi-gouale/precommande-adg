import { createPreorderCheckout } from "@/app/actions/preorder";
import { hasServerEnv, missingServerEnvKeys } from "@/lib/env";

export default function PrecommandePage() {
  const isCheckoutConfigured = hasServerEnv;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Collection Royaute
        </p>
        <h1 className="text-3xl font-semibold">Precommander le volume 1</h1>
        <p className="text-sm text-muted-foreground">
          Paiement via Polar. Aucune creation de compte client n&apos;est
          requise.
        </p>
        {!isCheckoutConfigured ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Configuration serveur incomplete. Renseignez les variables
            d&apos;environnement: {missingServerEnvKeys.join(", ")}
          </p>
        ) : null}
      </header>

      <form
        action={createPreorderCheckout}
        className="grid gap-4 rounded-xl border p-5"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="rounded-lg border px-3 py-2"
            name="firstName"
            placeholder="Prenom"
            required
            disabled={!isCheckoutConfigured}
          />
          <input
            className="rounded-lg border px-3 py-2"
            name="lastName"
            placeholder="Nom"
            required
            disabled={!isCheckoutConfigured}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="rounded-lg border px-3 py-2"
            name="email"
            placeholder="Email"
            type="email"
            required
            disabled={!isCheckoutConfigured}
          />
          <input
            className="rounded-lg border px-3 py-2"
            name="phone"
            placeholder="Telephone (optionnel)"
            disabled={!isCheckoutConfigured}
          />
        </div>

        <textarea
          className="min-h-24 rounded-lg border px-3 py-2"
          name="shippingAddress"
          placeholder="Adresse de livraison"
          required
          disabled={!isCheckoutConfigured}
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <select
            className="rounded-lg border px-3 py-2"
            name="offerSlug"
            required
            disabled={!isCheckoutConfigured}
          >
            <option value="livre-seul">Livre seul</option>
            <option value="livre-bonus">Livre + bonus</option>
            <option value="pack-livres">Pack livres</option>
          </select>
          <input
            className="rounded-lg border px-3 py-2"
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
            disabled={!isCheckoutConfigured}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            name="cgvAccepted"
            type="checkbox"
            required
            disabled={!isCheckoutConfigured}
          />
          J&apos;accepte les CGV
        </label>

        <button
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          type="submit"
          disabled={!isCheckoutConfigured}
        >
          Continuer vers le checkout
        </button>
      </form>
    </main>
  );
}
