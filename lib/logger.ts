export type LogLevel = "error" | "warn" | "info" | "debug";

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (data) {
    return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
  }

  return `${prefix} ${message}`;
}

export function logger(level: LogLevel, message: string, data?: unknown) {
  const formatted = formatLog(level, message, data);

  if (level === "error") {
    console.error(formatted);
  } else if (level === "warn") {
    console.warn(formatted);
  } else if (level === "info") {
    console.info(formatted);
  } else {
    console.debug(formatted);
  }
}

export const log = {
  error: (message: string, data?: unknown) => logger("error", message, data),
  warn: (message: string, data?: unknown) => logger("warn", message, data),
  info: (message: string, data?: unknown) => logger("info", message, data),
  debug: (message: string, data?: unknown) => logger("debug", message, data),
};
