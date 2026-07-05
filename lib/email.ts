import { env } from "@/lib/env";
import { log } from "@/lib/logger";

type ConfirmationMailParams = {
  to: string;
  firstName: string;
  orderId: string;
};

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

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.USESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [to],
        subject: "Précommande confirmée - Royauté",
        html: `<p>Bonjour ${firstName},</p><p>Votre précommande (${orderId}) est confirmée. Merci pour votre confiance.</p>`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error("Erreur lors de l'envoi d'email Resend", {
        status: response.status,
        orderId,
        error: errorText,
      });
      throw new Error(`Resend API error: ${response.status}`);
    }

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
