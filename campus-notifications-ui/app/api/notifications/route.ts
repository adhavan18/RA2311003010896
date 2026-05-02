import { createRequestLoggingMiddleware } from "@evaluation/logging-middleware";
import { fetchNotificationsPage, UpstreamHttpError } from "@/lib/upstream";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const begin = createRequestLoggingMiddleware("api-notifications");
  const trace = begin({ method: "GET", path: "/api/notifications" });

  try {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 10, 1), 10);
    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const notification_type = url.searchParams.get("notification_type") ?? undefined;

    const notifications = await fetchNotificationsPage({
      limit,
      page,
      notification_type,
    });

    trace.complete(200);
    return Response.json({ notifications });
  } catch (e) {
    if (e instanceof UpstreamHttpError) {
      trace.complete(e.statusCode);
      return Response.json({ error: e.message, detail: e.detail }, { status: e.statusCode });
    }
    const message = e instanceof Error ? e.message : String(e);
    trace.complete(502);
    return Response.json({ error: message }, { status: 502 });
  }
}
