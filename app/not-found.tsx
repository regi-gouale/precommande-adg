import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-background px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, oklch(0.35 0.14 265) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-[2rem] border border-border/60 bg-card/90 p-8 shadow-2xl shadow-black/10 backdrop-blur md:p-12">
        <div className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
            Erreur 404
          </p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Cette page est introuvable.
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Le contenu demandé n&apos;existe pas ou a peut-être été déplacé.
            Revenez à l&apos;accueil pour continuer votre navigation ou accéder
            à la précommande.
          </p>
        </div>

        <div className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-5 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <p className="font-medium text-foreground">Accueil</p>
            <p className="mt-1">
              Présentation du livre et informations principales.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Précommande</p>
            <p className="mt-1">
              Accès direct au formulaire et au paiement sécurisé.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(buttonVariants({ size: "lg" }), "min-w-44")}
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/#precommande"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-w-44",
            )}
          >
            Aller à la précommande
          </Link>
        </div>
      </div>
    </main>
  );
}
