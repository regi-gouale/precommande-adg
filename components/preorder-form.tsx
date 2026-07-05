"use client";

import { IconLock } from "@tabler/icons-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/actions";

type PreorderFormProps = {
  isCheckoutConfigured: boolean;
  missingKeys: string[];
  onSubmit: (formData: FormData) => Promise<ActionResult>;
};

function PreorderFormContent({
  isCheckoutConfigured,
  missingKeys,
  isFormComplete,
  actionState,
}: Omit<PreorderFormProps, "onSubmit"> & {
  isFormComplete: boolean;
  actionState: ActionResult | null;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      {!isCheckoutConfigured ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Configuration serveur incomplète. Variables manquantes:{" "}
          {missingKeys.join(", ")}
        </div>
      ) : null}

      {actionState?.success === false ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {actionState.error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="firstName"
            className="text-xs font-medium text-muted-foreground"
          >
            Prénom *
          </label>
          <input
            id="firstName"
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50"
            name="firstName"
            placeholder="Jean"
            required
            disabled={!isCheckoutConfigured || pending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="lastName"
            className="text-xs font-medium text-muted-foreground"
          >
            Nom *
          </label>
          <input
            id="lastName"
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50"
            name="lastName"
            placeholder="Dupont"
            required
            disabled={!isCheckoutConfigured || pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-xs font-medium text-muted-foreground"
        >
          Adresse e-mail *
        </label>
        <input
          id="email"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50"
          name="email"
          placeholder="jean@exemple.fr"
          type="email"
          required
          disabled={!isCheckoutConfigured || pending}
        />
        <p className="text-xs text-muted-foreground">
          Vous recevrez votre chapitre 1 PDF à cette adresse
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="phone"
          className="text-xs font-medium text-muted-foreground"
        >
          Téléphone (optionnel)
        </label>
        <input
          id="phone"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50"
          name="phone"
          placeholder="+33 6 12 34 56 78"
          disabled={!isCheckoutConfigured || pending}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="offerSlug"
            className="text-xs font-medium text-muted-foreground"
          >
            Offre
          </label>
          <input
            id="offerSlug"
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50"
            value="Livre + bonus"
            readOnly
            disabled={!isCheckoutConfigured || pending}
          />
          <input type="hidden" name="offerSlug" value="livre-bonus" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="quantity"
            className="text-xs font-medium text-muted-foreground"
          >
            Quantité *
          </label>
          <input
            id="quantity"
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none disabled:opacity-50"
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
            disabled={!isCheckoutConfigured || pending}
          />
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
        <input
          name="cgvAccepted"
          type="checkbox"
          className="mt-0.5 size-4 accent-gold"
          required
          disabled={!isCheckoutConfigured || pending}
        />
        <span>
          J&apos;accepte les{" "}
          <span className="underline underline-offset-2">CGV</span> et confirme
          que je retirerai mon exemplaire à la Cité Royale lors du Camp Impact
          Conférence.
        </span>
      </label>

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
    </>
  );
}

export function PreorderForm({
  isCheckoutConfigured,
  missingKeys,
  onSubmit,
}: PreorderFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [actionState, formAction] = useActionState<
    ActionResult | null,
    FormData
  >(async (_previousState, formData) => onSubmit(formData), null);

  const updateFormCompleteness = () => {
    setIsFormComplete(formRef.current?.checkValidity() ?? false);
  };

  useEffect(() => {
    setIsFormComplete(formRef.current?.checkValidity() ?? false);
  }, []);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4"
      onInput={updateFormCompleteness}
      onChange={updateFormCompleteness}
    >
      <PreorderFormContent
        isCheckoutConfigured={isCheckoutConfigured}
        missingKeys={missingKeys}
        isFormComplete={isFormComplete}
        actionState={actionState}
      />
    </form>
  );
}
