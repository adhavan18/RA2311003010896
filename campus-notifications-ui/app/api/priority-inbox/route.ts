import { createRequestLoggingMiddleware } from "@evaluation/logging-middleware";
import { fetchAllNotificationsPages } from "@/lib/upstream";
import { sortByRecencyDesc, topPriorityNotifications } from "@/lib/priority";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["Event", "Result", "Placement"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const begin = createRequestLoggingMiddleware("api-priority-inbox");
  const trace = begin({ method: "GET", path: "/api/priority-inbox" });

  try {
    const n = Math.min(Math.max(Number(url.searchParams.get("n")) || 10, 1), 100);
    const rawType = url.searchParams.get("notification_type");
    const notification_type =
      rawType && ALLOWED_TYPES.has(rawType) ? rawType : undefined;

    const all = await fetchAllNotificationsPages({ notification_type });

    const items = notification_type
      ? sortByRecencyDesc(all).slice(0, n)
      : topPriorityNotifications(all, n);

    trace.complete(200);
    return Response.json({ notifications: items });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    trace.complete(502);
    return Response.json({ error: message }, { status: 502 });
  }
}
