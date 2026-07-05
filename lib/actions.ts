import { log } from "@/lib/logger";

export type ActionResult<T = string> =
  | { success: true; data: T }
  | { success: false; error: string };

export function createActionError<T = string>(
  message: string,
  error?: unknown,
  userMessage?: string,
): ActionResult<T> {
  const finalUserMessage =
    userMessage || "Une erreur est survenue. Veuillez réessayer.";

  log.error(message, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
  });

  return {
    success: false,
    error: finalUserMessage,
  };
}

export function createActionSuccess<T = string>(data: T): ActionResult<T> {
  return {
    success: true,
    data,
  };
}
