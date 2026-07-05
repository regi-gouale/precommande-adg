"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [authAvailable, setAuthAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuthAvailability() {
      try {
        const response = await fetch("/api/auth/get-session", {
          method: "GET",
          credentials: "include",
        });

        if (cancelled) {
          return;
        }

        setAuthAvailable(response.status !== 503);
      } catch {
        if (!cancelled) {
          setAuthAvailable(false);
        }
      }
    }

    void checkAuthAvailability();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-[70svh] w-full max-w-md flex-col justify-center gap-6 px-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Connexion admin</h1>
        <p className="text-sm text-muted-foreground">
          Authentification securisee via Better Auth
        </p>
      </header>

      <form
        className="grid gap-3 rounded-xl border p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);

          if (!authAvailable) {
            setError("Configuration serveur incomplete");
            setPending(false);
            return;
          }

          const formData = new FormData(event.currentTarget);
          const email = String(formData.get("email") ?? "");
          const password = String(formData.get("password") ?? "");

          const result = await authClient.signIn.email({
            email,
            password,
          });

          if (result.error) {
            setError(result.error.message ?? "Echec de connexion");
            setPending(false);
            return;
          }

          router.push("/admin");
          router.refresh();
        }}
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="rounded-lg border px-3 py-2"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          className="rounded-lg border px-3 py-2"
          required
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!authAvailable ? (
          <p className="text-sm text-amber-700">
            Connexion indisponible: configurez les variables
            d&apos;environnement serveur.
          </p>
        ) : null}

        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          disabled={pending || !authAvailable}
        >
          {pending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
