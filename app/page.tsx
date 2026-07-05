export default function Page() {
  return (
    <main className="mx-auto flex min-h-[70svh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-semibold">Precommande ADG</h1>
      <p className="max-w-lg text-sm text-muted-foreground">
        Lancez votre precommande et finalisez le paiement avec Polar en mode
        invite.
      </p>
      <a
        href="/precommande"
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Aller au formulaire de precommande
      </a>
      <a href="/admin/login" className="text-sm underline">
        Acces admin
      </a>
    </main>
  );
}
