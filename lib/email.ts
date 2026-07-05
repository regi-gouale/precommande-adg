import { readFile } from "node:fs/promises";
import { basename, isAbsolute, resolve } from "node:path";

import { env } from "@/lib/env";
import { log } from "@/lib/logger";

type ConfirmationMailParams = {
  to: string;
  firstName: string;
  orderId: string;
};

type PaidOrderEmailParams = {
  orderId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  shippingAddress: string;
  quantity: number;
  offerSlug: string;
  amountCents?: number | null;
  currency?: string | null;
  paidAt: Date;
  paymentIntentId: string;
  checkoutSessionId?: string;
};

type ResendAttachment = {
  filename: string;
  content: string;
};

async function getChapterAttachment(orderId: string) {
  const rawPath = env.FIRST_CHAPTER_PDF_PATH?.trim();

  if (!rawPath) {
    log.warn(
      "FIRST_CHAPTER_PDF_PATH non configure, le client recevra l'email sans PDF",
      { orderId },
    );
    return undefined;
  }

  const filePath = isAbsolute(rawPath)
    ? rawPath
    : resolve(process.cwd(), rawPath);

  try {
    const fileBuffer = await readFile(filePath);
    const attachment: ResendAttachment = {
      filename: basename(filePath),
      content: fileBuffer.toString("base64"),
    };

    return attachment;
  } catch (error) {
    log.error("Impossible de lire le PDF du premier chapitre", {
      orderId,
      filePath,
      error: error instanceof Error ? error.message : error,
    });
    return undefined;
  }
}

async function sendResendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  orderId: string;
  attachments?: ResendAttachment[];
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.USESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    log.error("Erreur lors de l'envoi d'email Resend", {
      status: response.status,
      orderId: payload.orderId,
      to: payload.to,
      error: errorText,
    });
    throw new Error(`Resend API error: ${response.status}`);
  }
}

export async function sendPreorderConfirmationEmail({
  to,
  firstName,
  orderId,
}: ConfirmationMailParams) {
  try {
    if (!env.USESEND_API_KEY) {
      log.warn(
        "Clé API Resend non disponible, email de confirmation non envoyé",
        {
          orderId,
        },
      );
      return;
    }

    log.debug("Envoi d'email de confirmation", {
      to,
      orderId,
    });

    await sendResendEmail({
      to,
      orderId,
      subject: "Précommande confirmée - Royauté",
      html: `<p>Bonjour ${firstName},</p><p>Votre précommande (${orderId}) est confirmée. Merci pour votre confiance.</p>`,
    });

    log.info("Email de confirmation envoyé avec succès", {
      to,
      orderId,
    });
  } catch (error) {
    log.error("Erreur lors de l'envoi de l'email de confirmation", {
      to,
      orderId,
      error: error instanceof Error ? error.message : error,
    });
    // Ne pas lever l'erreur - l'email est optionnel
  }
}

export async function sendPaidOrderEmails(params: PaidOrderEmailParams) {
  try {
    if (!env.USESEND_API_KEY) {
      log.warn(
        "Clé API Resend non disponible, emails de paiement non envoyés",
        {
          orderId: params.orderId,
        },
      );
      return;
    }

    const attachment = await getChapterAttachment(params.orderId);
    const paidAtLabel = params.paidAt.toLocaleString("fr-FR");
    const amountLabel =
      typeof params.amountCents === "number" && params.amountCents > 0
        ? `${(params.amountCents / 100).toFixed(2)} ${(params.currency ?? "EUR").toUpperCase()}`
        : "N/A";

    await sendResendEmail({
      to: params.email,
      orderId: params.orderId,
      subject: "Votre précommande est confirmée - Premier chapitre offert",
      html: `<p>Bonjour ${params.firstName},</p><p>Merci pour votre précommande. Votre paiement est confirmé et vous trouverez le premier chapitre en pièce jointe.</p><p>Référence commande: <strong>${params.orderId}</strong></p>`,
      attachments: attachment ? [attachment] : undefined,
    });

    await sendResendEmail({
      to: env.ORDER_NOTIFICATION_EMAIL,
      orderId: params.orderId,
      subject: `Nouvelle commande payée - ${params.orderId}`,
      html: `
        <h2>Nouvelle commande payée</h2>
        <ul>
          <li><strong>Commande:</strong> ${params.orderId}</li>
          <li><strong>Date de paiement:</strong> ${paidAtLabel}</li>
          <li><strong>Client:</strong> ${params.firstName} ${params.lastName}</li>
          <li><strong>Email:</strong> ${params.email}</li>
          <li><strong>Téléphone:</strong> ${params.phone ?? "-"}</li>
          <li><strong>Adresse:</strong> ${params.shippingAddress}</li>
          <li><strong>Offre:</strong> ${params.offerSlug}</li>
          <li><strong>Quantité:</strong> ${params.quantity}</li>
          <li><strong>Montant:</strong> ${amountLabel}</li>
          <li><strong>PaymentIntent Stripe:</strong> ${params.paymentIntentId}</li>
          <li><strong>Checkout Session Stripe:</strong> ${params.checkoutSessionId ?? "-"}</li>
        </ul>
      `,
    });

    log.info("Emails de paiement envoyés", {
      orderId: params.orderId,
      customer: params.email,
      notification: env.ORDER_NOTIFICATION_EMAIL,
    });
  } catch (error) {
    log.error("Erreur lors de l'envoi des emails de paiement", {
      orderId: params.orderId,
      error: error instanceof Error ? error.message : error,
    });
    // Ne pas lever l'erreur - l'email est optionnel
  }
}
