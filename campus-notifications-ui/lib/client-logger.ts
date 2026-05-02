"use client";

type Level = "debug" | "info" | "warn" | "error";

function send(level: Level, service: string, message: string, context?: Record<string, unknown>) {
  void fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, service, message, context }),
    keepalive: true,
  });
}

export function createClientLogger(service: string) {
  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      send("debug", service, message, context),
    info: (message: string, context?: Record<string, unknown>) =>
      send("info", service, message, context),
    warn: (message: string, context?: Record<string, unknown>) =>
      send("warn", service, message, context),
    error: (message: string, context?: Record<string, unknown>) =>
      send("error", service, message, context),
  };
}
