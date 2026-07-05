import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_PRICE_BOOK_SINGLE: z.string().optional().default(""),
  STRIPE_PRICE_BOOK_BONUS: z.string().optional().default(""),
  STRIPE_PRICE_BOOK_PACK: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default(""),
  USESEND_API_KEY: z.string().optional().default(""),
});

const parsedServerEnv = serverSchema.safeParse(process.env);

export const hasServerEnv = parsedServerEnv.success;

export const missingServerEnvKeys = parsedServerEnv.success
  ? []
  : Array.from(
      new Set(
        parsedServerEnv.error.issues
          .map((issue) => String(issue.path[0] ?? ""))
          .filter((key) => key.length > 0),
      ),
    );

export class MissingEnvironmentError extends Error {
  readonly missingKeys: string[];

  constructor(missingKeys: string[]) {
    super(`Variables d'environnement manquantes: ${missingKeys.join(", ")}`);
    this.name = "MissingEnvironmentError";
    this.missingKeys = missingKeys;
  }
}

export function requireServerEnv(): z.infer<typeof serverSchema> {
  if (!parsedServerEnv.success) {
    throw new MissingEnvironmentError(missingServerEnvKeys);
  }

  return parsedServerEnv.data;
}

export const env = parsedServerEnv.success
  ? parsedServerEnv.data
  : {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      STRIPE_PRICE_BOOK_SINGLE: process.env.STRIPE_PRICE_BOOK_SINGLE ?? "",
      STRIPE_PRICE_BOOK_BONUS: process.env.STRIPE_PRICE_BOOK_BONUS ?? "",
      STRIPE_PRICE_BOOK_PACK: process.env.STRIPE_PRICE_BOOK_PACK ?? "",
      EMAIL_FROM: process.env.EMAIL_FROM ?? "",
      USESEND_API_KEY: process.env.USESEND_API_KEY ?? "",
    };

function isMissing(value: string) {
  return value.length === 0;
}

export const hasStripePluginEnv =
  !isMissing(env.STRIPE_SECRET_KEY) && !isMissing(env.STRIPE_WEBHOOK_SECRET);

export const hasStripeCheckoutEnv =
  hasStripePluginEnv && !isMissing(env.STRIPE_PRICE_BOOK_BONUS);

export const missingStripePluginEnvKeys = [
  ...(isMissing(env.STRIPE_SECRET_KEY) ? ["STRIPE_SECRET_KEY"] : []),
  ...(isMissing(env.STRIPE_WEBHOOK_SECRET) ? ["STRIPE_WEBHOOK_SECRET"] : []),
];

export const missingStripeCheckoutEnvKeys = [
  ...(isMissing(env.STRIPE_SECRET_KEY) ? ["STRIPE_SECRET_KEY"] : []),
  ...(isMissing(env.STRIPE_WEBHOOK_SECRET) ? ["STRIPE_WEBHOOK_SECRET"] : []),
  ...(isMissing(env.STRIPE_PRICE_BOOK_BONUS)
    ? ["STRIPE_PRICE_BOOK_BONUS"]
    : []),
];

export const missingPreorderEnvKeys = Array.from(
  new Set([...missingServerEnvKeys, ...missingStripeCheckoutEnvKeys]),
);

export const hasPreorderEnv = hasServerEnv && hasStripeCheckoutEnv;
