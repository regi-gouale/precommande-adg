"use client";

import { IconCheck, IconCrown, IconLoader } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const perks = [
  "Livraison prioritaire dès la sortie",
  "Chapitre bonus exclusif en numérique",
  "Tarif de précommande réduit",
  "Dédicace numérique de l'auteur",
];

export function PreorderSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => setStatus("success"), 1200);
  }

  return (
    <section
      id="precommande"
      className="border-t border-border/60 py-20 md:py-28"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div className="overflow-hidden rounded-3xl border border-gold/30 bg-card">
          <div className="grid md:grid-cols-2">
            {/* Left: perks */}
            <div className="border-b border-border/60 p-8 md:border-b-0 md:border-r md:p-10">
              <IconCrown className="size-8 text-gold" aria-hidden="true" />
              <h2 className="mt-4 text-balance font-serif text-3xl font-semibold text-foreground">
                Précommandez votre exemplaire
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Réservez dès aujourd&apos;hui le Volume 1 et bénéficiez
                d&apos;avantages exclusifs réservés aux premiers lecteurs.
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-3 text-sm text-foreground"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <IconCheck className="size-3.5" aria-hidden="true" />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-baseline gap-3">
                <span className="font-serif text-4xl font-semibold text-gold">
                  24,90 €
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  32,00 €
                </span>
              </div>
            </div>

            {/* Right: form */}
            <div className="p-8 md:p-10">
              {status === "success" ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <IconCheck className="size-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-serif text-2xl font-semibold text-foreground">
                    Précommande enregistrée !
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Merci. Vous recevrez un e-mail de confirmation à
                    l&apos;adresse indiquée dès que le livre sera disponible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="name"
                      className="text-sm text-muted-foreground"
                    >
                      Nom complet
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Jean Dupont"
                      className="rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-sm text-muted-foreground"
                    >
                      Adresse e-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean@exemple.com"
                      className="rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="qty"
                      className="text-sm text-muted-foreground"
                    >
                      Quantité
                    </label>
                    <select
                      id="qty"
                      className="rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
                    >
                      <option value="1">1 exemplaire</option>
                      <option value="2">2 exemplaires</option>
                      <option value="3">3 exemplaires</option>
                      <option value="5">5 exemplaires</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={status === "loading"}
                    className="mt-2 bg-gold text-base font-medium text-gold-foreground hover:bg-gold/90"
                  >
                    {status === "loading" ? (
                      <>
                        <IconLoader
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                        Traitement...
                      </>
                    ) : (
                      "Confirmer ma précommande"
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Aucun prélèvement avant l&apos;expédition. Vous pouvez
                    annuler à tout moment.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
