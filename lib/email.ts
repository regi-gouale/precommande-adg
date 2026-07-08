import { access, readFile } from "node:fs/promises";
import { basename, isAbsolute, resolve } from "node:path";
import { UseSend } from "usesend-js";

import { formatDateTimeFull } from "@/lib/date";
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
  amountSubtotalCents?: number | null;
  amountTaxCents?: number | null;
  amountTotalCents?: number | null;
  currency?: string | null;
  paidAt: Date;
  paymentIntentId: string;
  checkoutSessionId?: string;
};

type EmailAttachment = {
  filename: string;
  content: string;
};

const BOOK_TITLE = "Royauté";
const BOOK_VAT_RATE = 0.055;

const usesend = new UseSend(env.USESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMoney(
  cents: number | null | undefined,
  currency?: string | null,
) {
  if (typeof cents !== "number") {
    return undefined;
  }

  const currencyCode = (currency ?? "EUR").toUpperCase();

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function createEmailLayout(params: {
  preheader: string;
  title: string;
  subtitle?: string;
  contentHtml: string;
  footer?: string;
}) {
  const subtitleHtml = params.subtitle
    ? `<p style="margin:0 0 18px 0;color:#6b7280;font-size:15px;line-height:1.6;">${params.subtitle}</p>`
    : "";

  const footerHtml = params.footer
    ? `<p style="margin:20px 0 0 0;color:#6b7280;font-size:13px;line-height:1.6;">${params.footer}</p>`
    : "";

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${params.title}</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111827;">
        <span style="display:none;opacity:0;visibility:hidden;height:0;width:0;overflow:hidden;mso-hide:all;">${params.preheader}</span>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 28px 18px 28px;background:linear-gradient(135deg,#111827 0%,#1f2937 100%);">
                    <p style="margin:0;color:#e5e7eb;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Précommande</p>
                    <h1 style="margin:10px 0 0 0;color:#ffffff;font-size:28px;line-height:1.2;font-weight:700;">${BOOK_TITLE}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    <h2 style="margin:0 0 10px 0;color:#111827;font-size:22px;line-height:1.3;">${params.title}</h2>
                    ${subtitleHtml}
                    <div style="color:#111827;font-size:15px;line-height:1.7;">${params.contentHtml}</div>
                    ${footerHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function getChapterAttachment(orderId: string) {
  const rawPath = env.FIRST_CHAPTER_PDF_PATH?.trim();

  if (!rawPath) {
    log.warn(
      "FIRST_CHAPTER_PDF_PATH non configure, le client recevra l'email sans PDF",
      { orderId },
    );
    return undefined;
  }

  const cwd = /* turbopackIgnore: true */ process.cwd();
  const pathCandidates = isAbsolute(rawPath)
    ? [rawPath]
    : [resolve(cwd, rawPath), resolve(cwd, "public", rawPath)];

  let filePath: string | undefined;

  for (const candidate of pathCandidates) {
    try {
      await access(candidate);
      filePath = candidate;
      break;
    } catch {
      // Continue with next candidate.
    }
  }

  if (!filePath) {
    log.error("Aucun chemin de PDF valide trouve", {
      orderId,
      configuredPath: rawPath,
      pathCandidates,
    });
    return undefined;
  }

  try {
    const fileBuffer = await readFile(filePath);
    const attachment: EmailAttachment = {
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

async function sendUsesendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  orderId: string;
  attachments?: EmailAttachment[];
  idempotencyKey: string;
}) {
  const response = await usesend.emails.send(
    {
      from: env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
      attachments: payload.attachments,
    },
    {
      idempotencyKey: payload.idempotencyKey,
    },
  );

  if (response.error) {
    log.error("Erreur lors de l'envoi d'email UseSend", {
      orderId: payload.orderId,
      to: payload.to,
      error: response.error,
    });
    throw new Error(
      `UseSend API error: ${response.error.code} - ${response.error.message}`,
    );
  }

  return response.data;
}

export async function sendPreorderConfirmationEmail({
  to,
  firstName,
  orderId,
}: ConfirmationMailParams) {
  try {
    if (!env.USESEND_API_KEY) {
      log.warn(
        "Clé API UseSend non disponible, email de confirmation non envoyé",
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

    await sendUsesendEmail({
      to,
      orderId,
      subject: `Precommande confirmee - ${BOOK_TITLE}`,
      html: createEmailLayout({
        preheader: `Votre precommande ${orderId} est confirmee`,
        title: "Votre precommande est enregistree",
        subtitle: `Bonjour ${escapeHtml(firstName)}, merci pour votre confiance.`,
        contentHtml: `
          <p style="margin:0 0 14px 0;">Nous avons bien recu votre commande du livre <strong>${BOOK_TITLE}</strong>.</p>
          <p style="margin:0;padding:14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
            <strong>Reference commande:</strong> ${escapeHtml(orderId)}
          </p>
        `,
        footer: "Nous vous contacterons des que votre commande sera prete.",
      }),
      idempotencyKey: `preorder-confirmation-${orderId}-${to.toLowerCase()}`,
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
        "Clé API UseSend non disponible, emails de paiement non envoyés",
        {
          orderId: params.orderId,
        },
      );
      return;
    }

    const attachment = await getChapterAttachment(params.orderId);
    const paidAtLabel = formatDateTimeFull(params.paidAt);

    const totalCents =
      params.amountTotalCents ??
      params.amountCents ??
      (typeof params.amountSubtotalCents === "number" &&
      typeof params.amountTaxCents === "number"
        ? params.amountSubtotalCents + params.amountTaxCents
        : undefined);

    // Stripe peut ne pas renvoyer le detail de taxe: on derive alors une TVA livre de 5,5% depuis le TTC.
    const shouldDeriveTaxFromReducedRate =
      typeof totalCents === "number" &&
      (typeof params.amountTaxCents !== "number" || params.amountTaxCents <= 0);

    const derivedSubtotalCents = shouldDeriveTaxFromReducedRate
      ? Math.round(totalCents / (1 + BOOK_VAT_RATE))
      : undefined;

    const subtotalCents =
      typeof derivedSubtotalCents === "number"
        ? derivedSubtotalCents
        : (params.amountSubtotalCents ??
          (typeof totalCents === "number" &&
          typeof params.amountTaxCents === "number"
            ? totalCents - params.amountTaxCents
            : undefined));

    const taxCents =
      typeof params.amountTaxCents === "number" && params.amountTaxCents > 0
        ? params.amountTaxCents
        : typeof totalCents === "number" && typeof subtotalCents === "number"
          ? totalCents - subtotalCents
          : undefined;

    const amountLabel = formatMoney(totalCents, params.currency) ?? "N/A";
    const subtotalLabel = formatMoney(subtotalCents, params.currency) ?? "N/A";
    const taxLabel = formatMoney(taxCents, params.currency) ?? "N/A";

    await sendUsesendEmail({
      to: params.email,
      orderId: params.orderId,
      subject: `${BOOK_TITLE} - Paiement confirmé et premier chapitre`,
      html: createEmailLayout({
        preheader: `Paiement confirmé pour votre commande ${params.orderId}`,
        title: "Paiement confirmé",
        subtitle: `Bonjour ${escapeHtml(params.firstName)}, votre commande du livre ${BOOK_TITLE} est validée.`,
        contentHtml: `
          <p style="margin:0 0 14px 0;">Votre paiement a bien été confirmé. Le premier chapitre de <strong>${BOOK_TITLE}</strong> est joint à cet email.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 8px;">
            <tr>
              <td style="padding:12px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;"><strong>Référence commande:</strong> ${escapeHtml(params.orderId)}</td>
            </tr>
            <tr>
              <td style="padding:12px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;"><strong>Total TTC:</strong> ${escapeHtml(amountLabel)}</td>
            </tr>
          </table>
          <p style="margin:18px 0 8px 0;"><strong>Détail de la facture</strong></p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Sous-total HT</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(subtotalLabel)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Taxes (TVA)</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(taxLabel)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;"><strong>Total TTC</strong></td><td style="padding:10px 14px;"><strong>${escapeHtml(amountLabel)}</strong></td></tr>
          </table>
        `,
        footer:
          "Conservez cet email: il contient votre pièce jointe et votre référence de commande.",
      }),
      attachments: attachment ? [attachment] : undefined,
      idempotencyKey: `paid-order-customer-${params.orderId}-${params.email.toLowerCase()}`,
    });

    await sendUsesendEmail({
      to: env.ORDER_NOTIFICATION_EMAIL,
      orderId: params.orderId,
      subject: `Nouvelle commande payée - ${BOOK_TITLE} - ${params.orderId}`,
      html: createEmailLayout({
        preheader: `Commande payée ${params.orderId}`,
        title: "Nouvelle commande payée",
        subtitle: `Un nouvel achat du livre ${BOOK_TITLE} vient d'être confirmé.`,
        contentHtml: `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Commande</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(params.orderId)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Date de paiement</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(paidAtLabel)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Client</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(`${params.firstName} ${params.lastName}`)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Email</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(params.email)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Telephone</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(params.phone ?? "-")}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Adresse</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(params.shippingAddress)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Offre</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(params.offerSlug)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Quantite</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${String(params.quantity)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Sous-total HT</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(subtotalLabel)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Taxes (TVA)</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(taxLabel)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>Total TTC</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(amountLabel)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><strong>PaymentIntent Stripe</strong></td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(params.paymentIntentId)}</td></tr>
            <tr><td style="padding:10px 14px;background:#f9fafb;"><strong>Checkout Session Stripe</strong></td><td style="padding:10px 14px;">${escapeHtml(params.checkoutSessionId ?? "-")}</td></tr>
          </table>
        `,
      }),
      idempotencyKey: `paid-order-admin-${params.orderId}-${env.ORDER_NOTIFICATION_EMAIL.toLowerCase()}`,
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
