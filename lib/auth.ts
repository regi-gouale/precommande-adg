import { stripe } from "@better-auth/stripe";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import type Stripe from "stripe";

import { env, hasServerEnv, hasStripePluginEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { getStripeClient, handleStripeEvent } from "@/lib/stripe";

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

  const stripePlugin = hasStripePluginEnv
    ? stripe({
        stripeClient: getStripeClient(),
        stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
        onEvent: async (event: Stripe.Event) => {
          await handleStripeEvent(event);
        },
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
      ...(stripePlugin ? [stripePlugin] : []),
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

export function getAuth(): AuthInstance {
  return getOrCreateAuth();
}

// better-auth CLI expects an exported variable named `auth`.
export const auth: AuthInstance = new Proxy({} as AuthInstance, {
  get(_target, prop, receiver) {
    return Reflect.get(getOrCreateAuth(), prop, receiver);
  },
});
