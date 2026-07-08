"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLock } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ActionResult } from "@/lib/actions";
import { Input } from "./ui/input";

const preorderSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.email("Adresse e-mail invalide"),
  phone: z.string().optional(),
  quantity: z.number().int().min(1, "La quantité doit être au moins 1"),
  cgvAccepted: z.boolean().refine((v) => v === true, {
    message: "Vous devez accepter les CGV",
  }),
});

type PreorderFormValues = z.infer<typeof preorderSchema>;

type PreorderFormProps = {
  isCheckoutConfigured: boolean;
  missingKeys: string[];
  onSubmit: (formData: FormData) => Promise<ActionResult>;
};

export function PreorderForm({
  isCheckoutConfigured,
  missingKeys,
  onSubmit,
}: PreorderFormProps) {
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const form = useForm<PreorderFormValues>({
    resolver: zodResolver(preorderSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      quantity: 1,
      cgvAccepted: false,
    },
  });

  const isFormComplete = form.formState.isValid;

  async function handleSubmit(values: PreorderFormValues) {
    setPending(true);
    setActionError(null);
    try {
      const formData = new FormData();
      formData.set("firstName", values.firstName);
      formData.set("lastName", values.lastName);
      formData.set("email", values.email);
      if (values.phone) formData.set("phone", values.phone);
      formData.set("offerSlug", "livre-bonus");
      formData.set("quantity", String(values.quantity));
      formData.set("cgvAccepted", "on");

      const result = await onSubmit(formData);
      if (result.success === false) {
        setActionError(result.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        {!isCheckoutConfigured ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Configuration serveur incomplète. Variables manquantes:{" "}
            {missingKeys.join(", ")}
          </div>
        ) : null}

        {actionError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {actionError}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom *</FormLabel>
                <FormControl>
                  <input
                    className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50 w-full"
                    placeholder="Jean"
                    disabled={!isCheckoutConfigured || pending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <input
                    className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50 w-full"
                    placeholder="Dupont"
                    disabled={!isCheckoutConfigured || pending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse e-mail *</FormLabel>
              <FormControl>
                <input
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50 w-full"
                  placeholder="jean@exemple.fr"
                  type="email"
                  disabled={!isCheckoutConfigured || pending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Vous recevrez votre chapitre 1 PDF à cette adresse
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone (optionnel)</FormLabel>
              <FormControl>
                <input
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50 w-full"
                  placeholder="+33 6 12 34 56 78"
                  disabled={!isCheckoutConfigured || pending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormItem>
            <FormLabel className="text-xs font-medium text-muted-foreground">
              Offre
            </FormLabel>
            <input
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50 w-full"
              value="Livre + bonus"
              readOnly
              disabled
            />
          </FormItem>
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité *</FormLabel>
                <FormControl>
                  <input
                    className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50 w-full"
                    type="number"
                    min={1}
                    disabled={!isCheckoutConfigured || pending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cgvAccepted"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2.5">
                <FormControl>
                  <Input
                    type="checkbox"
                    className="mt-0.5 size-12 accent-gold"
                    disabled={!isCheckoutConfigured || pending}
                    checked={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <div className="flex flex-col gap-2 text-justify">
                  <span className="text-sm text-muted-foreground">
                    J&apos;accepte les{" "}
                    <span className="underline underline-offset-2">
                      Conditions Générales de Vente
                    </span>{" "}
                    et confirme que je viendrai retirer mon exemplaire à
                    l’adresse suivante : 27 rue des Vieilles Vignes, 77183
                    Croissy-Beaubourg, au stand Impact Centre Chrétien — Stand
                    25, lors du camp Impact Conférence.
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Je pourrai ainsi récupérer mon exemplaire dédicacé sur
                    place. Le bonus me sera envoyé par e-mail après validation
                    du paiement.
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Je comprends que si je ne me présente pas sur place, je ne
                    pourrai pas récupérer mon exemplaire dédicacé.
                  </span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all disabled:opacity-50 ${
            isFormComplete
              ? "bg-primary text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
              : "bg-muted text-muted-foreground"
          }`}
          type="submit"
          disabled={!isCheckoutConfigured || pending}
        >
          <IconLock className="size-4" aria-hidden="true" />
          {pending ? "Traitement..." : "Je précommande mon exemplaire dédicacé"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Paiement sécurisé — Prix fixé à 20 €, aucune surprise
        </p>
      </form>
    </Form>
  );
}
