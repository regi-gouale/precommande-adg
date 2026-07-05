import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { sendPreorderConfirmationEmail } from "@/lib/email";
import { env, hasServerEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

const globalForAuthPrisma = globalThis as unknown as {
  authPrisma: PrismaClient | undefined;
};

function getAuthPrisma() {
  if (hasServerEnv) {
    return getPrisma();
  }

  if (globalForAuthPrisma.authPrisma) {
    return globalForAuthPrisma.authPrisma;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForAuthPrisma.authPrisma = prisma;
  }

  return prisma;
}

function createAuth() {
  const prisma = getAuthPrisma();

  const hasPolarConfig =
    env.POLAR_ACCESS_TOKEN.length > 0 &&
    env.POLAR_WEBHOOK_SECRET.length > 0 &&
    env.POLAR_PRODUCT_BOOK_SINGLE.length > 0 &&
    env.POLAR_PRODUCT_BOOK_BONUS.length > 0 &&
    env.POLAR_PRODUCT_BOOK_PACK.length > 0;

  const polarPlugin = hasPolarConfig
    ? polar({
        client: new Polar({
          accessToken: env.POLAR_ACCESS_TOKEN,
          server: env.POLAR_ENVIRONMENT as "sandbox" | "production",
        }),
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
            returnUrl: `${env.NEXT_PUBLIC_APP_URL}/#precommande`,
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
      })
    : null;

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
      admin({
        defaultRole: "USER",
        adminRoles: ["ADMIN"],
      }),
      ...(polarPlugin ? [polarPlugin] : []),
      // Must be the last plugin according to better-auth Next.js integration docs.
      nextCookies(),
    ],
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | undefined;

function getOrCreateAuth(): AuthInstance {
  if (!authInstance) {
    authInstance = createAuth();
  }

  return authInstance;
}

// better-auth CLI expects an exported variable named `auth`.
export const auth: AuthInstance = new Proxy({} as AuthInstance, {
  get(_target, prop, receiver) {
    return Reflect.get(getOrCreateAuth(), prop, receiver);
  },
});

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
  const prisma = getAuthPrisma();
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
  const prisma = getAuthPrisma();
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
  return getOrCreateAuth();
}
