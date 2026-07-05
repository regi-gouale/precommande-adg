export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[60svh] w-full max-w-2xl flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-semibold">Paiement enregistre</h1>
      <p className="text-muted-foreground">
        Merci. Votre precommande est en cours de confirmation automatique.
      </p>
    </main>
  );
}
