import { env } from "@/lib/env";

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
  if (!env.RESEND_API_KEY) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [to],
      subject: "Precommande confirmee - Royaute",
      html: `<p>Bonjour ${firstName},</p><p>Votre precommande (${orderId}) est confirmee. Merci pour votre confiance.</p>`,
    }),
  });
}
