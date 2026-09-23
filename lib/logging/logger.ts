/**
 * Minimal structured logger. Deliberately dependency-free for v0.0.1 — swap
 * the transport (e.g. pino, a hosted log sink) in a later release without
 * changing call sites, since everything goes through this module.
 *
 * NEVER log: passwords, OTPs, refresh tokens, raw access tokens, payment
 * secrets, private signing keys, service-role keys. See docs/security.md.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  request_id?: string;
  actor_id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEY_PATTERN =
  /password|secret|token|otp|refresh|api[_-]?key|service[_-]?role/i;

function redact(fields: LogFields): LogFields {
  const safe: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    safe[key] = SENSITIVE_KEY_PATTERN.test(key) ? "[redacted]" : value;
  }
  return safe;
}

function emit(level: LogLevel, message: string, fields: LogFields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...redact(fields),
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, fields?: LogFields) => emit("debug", message, fields),
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
};
