"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CheckoutSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success("Paiement confirme. Merci pour votre precommande.");

    const timeoutId = window.setTimeout(() => {
      router.replace("/");
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-[60svh] w-full max-w-2xl flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-semibold">Paiement enregistré</h1>
      <p className="text-muted-foreground">
        Merci. Votre paiement a bien ete pris en compte. Redirection vers
        l'accueil...
      </p>
    </main>
  );
}
