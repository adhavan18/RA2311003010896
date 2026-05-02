import {
  createLogger,
  createRequestLoggingMiddleware,
} from "@evaluation/logging-middleware";

export const runtime = "nodejs";

const log = createLogger("client-log-bridge");

export async function POST(req: Request) {
  const begin = createRequestLoggingMiddleware("api-log");
  const trace = begin({ method: "POST", path: "/api/log" });
  try {
    const body = (await req.json()) as {
      level?: string;
      service?: string;
      message?: string;
      context?: Record<string, unknown>;
    };

    const level = body.level === "error" ? "error" : body.level === "warn" ? "warn" : "info";
    const service = typeof body.service === "string" ? body.service : "unknown-client";
    const message = typeof body.message === "string" ? body.message : "client_event";
    const context = { ...body.context, clientService: service };

    if (level === "error") log.error(message, context);
    else if (level === "warn") log.warn(message, context);
    else log.info(message, context);

    trace.complete(204);
    return new Response(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log.error("api:log_parse_failed", { message });
    trace.complete(400);
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }
}
