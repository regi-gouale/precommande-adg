import { Polar } from "@polar-sh/sdk";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { Prisma } from "@prisma/client";

import { sendPreorderConfirmationEmail } from "@/lib/email";
import { requireServerEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

function createAuth() {
  const env = requireServerEnv();
  const prisma = getPrisma();
  const polarClient = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: env.POLAR_ENVIRONMENT,
  });

  return betterAuth({
    appName: "Precommande ADG",
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 8,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    plugins: [
      nextCookies(),
      admin({
        defaultRole: "USER",
        adminRoles: ["ADMIN"],
      }),
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: env.POLAR_PRODUCT_BOOK_SINGLE,
                slug: "livre-seul",
              },
              {
                productId: env.POLAR_PRODUCT_BOOK_BONUS,
                slug: "livre-bonus",
              },
              {
                productId: env.POLAR_PRODUCT_BOOK_PACK,
                slug: "pack-livres",
              },
            ],
            successUrl: "/checkout/success?checkout_id={CHECKOUT_ID}",
            returnUrl: `${env.NEXT_PUBLIC_APP_URL}/precommande`,
            authenticatedUsersOnly: false,
          }),
          portal({
            returnUrl: env.NEXT_PUBLIC_APP_URL,
          }),
          webhooks({
            secret: env.POLAR_WEBHOOK_SECRET,
            onOrderPaid: async (payload) => {
              const normalized = toPayload(payload);
              await logPolarEvent(normalized);
              await confirmPaidOrder(normalized);
            },
            onPayload: async (payload) => {
              const normalized = toPayload(payload);
              await logPolarEvent(normalized);
            },
          }),
        ],
      }),
    ],
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | undefined;

type PolarPayload = {
  type?: string;
  timestamp?: Date;
  data?: {
    id?: string;
    checkoutId?: string | null;
    metadata?: Record<string, unknown>;
  };
};

function toPayload(input: unknown): PolarPayload {
  if (!input || typeof input !== "object") {
    return {};
  }

  return input as PolarPayload;
}

function buildEventKey(payload: PolarPayload) {
  const eventType = payload.type ?? "unknown";
  const dataId = payload.data?.id ?? "unknown";
  const timestamp = payload.timestamp?.toISOString() ?? "unknown";

  return `${eventType}:${dataId}:${timestamp}`;
}

async function logPolarEvent(payload: PolarPayload) {
  const prisma = getPrisma();
  const eventKey = buildEventKey(payload);
  const eventType = payload.type ?? "unknown";

  try {
    await prisma.polarEventLog.create({
      data: {
        eventKey,
        eventType,
        payloadJson: JSON.stringify(payload),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return;
    }

    throw error;
  }
}

async function confirmPaidOrder(payload: PolarPayload) {
  const prisma = getPrisma();
  const metadata = payload.data?.metadata ?? {};
  const orderIdFromMetadata =
    typeof metadata.orderId === "string" ? metadata.orderId : undefined;

  const referenceIdFromMetadata =
    typeof metadata.referenceId === "string" ? metadata.referenceId : undefined;

  const checkoutId = payload.data?.checkoutId ?? undefined;
  const polarOrderId = payload.data?.id ?? undefined;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(orderIdFromMetadata ? [{ id: orderIdFromMetadata }] : []),
        ...(referenceIdFromMetadata
          ? [{ polarReferenceId: referenceIdFromMetadata }]
          : []),
        ...(checkoutId ? [{ polarCheckoutId: checkoutId }] : []),
      ],
    },
  });

  if (!order) {
    return;
  }

  if (order.paymentStatus === "PAID") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "PREORDER_CONFIRMED",
        paidAt: new Date(),
        polarOrderId,
        polarCheckoutId: checkoutId,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "PREORDER_CONFIRMED",
        note: "Paiement confirme par webhook Polar",
      },
    });
  });

  await sendPreorderConfirmationEmail({
    to: order.email,
    firstName: order.firstName,
    orderId: order.id,
  });
}

export function getAuth(): AuthInstance {
  if (authInstance) {
    return authInstance;
  }

  authInstance = createAuth();

  return authInstance;
}
