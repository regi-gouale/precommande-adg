"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-background px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 0%, oklch(0.35 0.14 265) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-[2rem] border border-border/60 bg-card/90 p-8 shadow-2xl shadow-black/10 backdrop-blur md:p-12">
        <div className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
            Erreur inattendue
          </p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Cette page a rencontré un problème.
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Une erreur s&apos;est produite pendant le chargement. Vous pouvez
            relancer cette vue ou revenir à la page d&apos;accueil pour
            reprendre la navigation.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Référence technique</p>
          <p className="mt-2 break-all">
            {error.digest ?? "Aucun identifiant disponible"}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className={cn(buttonVariants({ size: "lg" }), "min-w-44")}
          >
            Réessayer
          </button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-w-44",
            )}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
