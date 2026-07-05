"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[60svh] w-full max-w-2xl flex-col items-center justify-center gap-3 px-6 text-center">
          <h1 className="text-3xl font-semibold">Paiement enregistré</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      void fetch(
        `/api/checkout/reconcile?session_id=${encodeURIComponent(sessionId)}`,
        {
          method: "POST",
        },
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Reconciliation Stripe en erreur (${response.status})`,
            );
          }

          return response.json();
        })
        .then((result) => {
          if (result?.reconciled) {
            toast.success("Paiement confirmé. Merci pour votre précommande.");
            return;
          }

          toast.info("Paiement en cours de confirmation.");
        })
        .catch(() => {
          toast.warning("Paiement reçu. Synchronisation du statut en cours.");
        });
    } else {
      toast.success("Paiement confirmé. Merci pour votre précommande.");
    }

    const timeoutId = window.setTimeout(() => {
      router.replace("/");
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router, searchParams]);

  return (
    <main className="mx-auto flex min-h-[60svh] w-full max-w-2xl flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-semibold">Paiement enregistré</h1>
      <p className="text-muted-foreground">
        Merci. Votre paiement a bien été pris en compte. Redirection vers
        l'accueil...
      </p>
    </main>
  );
}
