import { createLogger } from "@evaluation/logging-middleware";
import type { Notification } from "./notification.js";

const log = createLogger("stage1-fetch");

const DEFAULT_BASE = "https://20.207.122.201/evaluation-service";

export interface NotificationsResponse {
  notifications: Notification[];
}

export async function fetchAllNotifications(
  accessToken: string,
  baseUrl = process.env.EVALUATION_SERVICE_BASE ?? DEFAULT_BASE,
): Promise<Notification[]> {
  const out: Notification[] = [];
  let page = 1;
  const limit = Math.min(Math.max(Number(process.env.NOTIFICATIONS_PAGE_LIMIT) || 10, 1), 10);

  for (;;) {
    const url = new URL(`${baseUrl.replace(/\/$/, "")}/notifications`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("page", String(page));

    log.info("notifications:fetch_page", { page, limit, url: url.toString() });

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      log.error("notifications:fetch_failed", {
        status: res.status,
        page,
        bodyPreview: body.slice(0, 500),
      });
      throw new Error(`Notifications request failed: HTTP ${res.status}`);
    }

    const data = (await res.json()) as NotificationsResponse;
    const batch = Array.isArray(data.notifications) ? data.notifications : [];

    log.info("notifications:page_received", { page, count: batch.length });

    out.push(...batch);

    if (batch.length < limit) break;
    page += 1;
  }

  log.info("notifications:fetch_complete", { total: out.length });
  return out;
}