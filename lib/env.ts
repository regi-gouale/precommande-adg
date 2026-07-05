import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  POLAR_ACCESS_TOKEN: z.string().min(1),
  POLAR_WEBHOOK_SECRET: z.string().min(1),
  POLAR_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  POLAR_PRODUCT_BOOK_SINGLE: z.string().min(1),
  POLAR_PRODUCT_BOOK_BONUS: z.string().min(1),
  POLAR_PRODUCT_BOOK_PACK: z.string().min(1),
  EMAIL_FROM: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
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
      POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN ?? "",
      POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET ?? "",
      POLAR_ENVIRONMENT:
        process.env.POLAR_ENVIRONMENT === "production"
          ? "production"
          : "sandbox",
      POLAR_PRODUCT_BOOK_SINGLE: process.env.POLAR_PRODUCT_BOOK_SINGLE ?? "",
      POLAR_PRODUCT_BOOK_BONUS: process.env.POLAR_PRODUCT_BOOK_BONUS ?? "",
      POLAR_PRODUCT_BOOK_PACK: process.env.POLAR_PRODUCT_BOOK_PACK ?? "",
      EMAIL_FROM: process.env.EMAIL_FROM ?? "",
      RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
    };
