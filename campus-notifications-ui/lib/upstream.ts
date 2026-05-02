import { createLogger } from "@evaluation/logging-middleware";
import type { Notification, NotificationsResponse } from "./types";

const log = createLogger("upstream");

const DEFAULT_BASE = "https://20.207.122.201/evaluation-service";

export class UpstreamHttpError extends Error {
  readonly statusCode: number;
  readonly detail?: string;

  constructor(message: string, statusCode: number, detail?: string) {
    super(message);
    this.name = "UpstreamHttpError";
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

function baseUrl(): string {
  return (process.env.EVALUATION_SERVICE_BASE ?? DEFAULT_BASE).replace(/\/$/, "");
}

function token(): string {
  const t = process.env.EVALUATION_ACCESS_TOKEN?.replace(/^\uFEFF/, "").trim();
  if (!t) {
    throw new UpstreamHttpError("Missing EVALUATION_ACCESS_TOKEN", 500);
  }
  return t;
}

export async function fetchNotificationsPage(params: {
  limit: number;
  page: number;
  notification_type?: string;
}): Promise<Notification[]> {
  const url = new URL(`${baseUrl()}/notifications`);
  url.searchParams.set("limit", String(params.limit));
  url.searchParams.set("page", String(params.page));
  if (params.notification_type) {
    url.searchParams.set("notification_type", params.notification_type);
  }

  log.info("upstream:request", {
    limit: params.limit,
    page: params.page,
    notification_type: params.notification_type ?? null,
  });

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    log.error("upstream:error", { status: res.status, bodyPreview: body.slice(0, 400) });
    throw new UpstreamHttpError(
      `Upstream notifications failed: HTTP ${res.status}`,
      res.status,
      body.slice(0, 400),
    );
  }

  const data = (await res.json()) as NotificationsResponse;
  const list = Array.isArray(data.notifications) ? data.notifications : [];
  log.info("upstream:response", { count: list.length });
  return list;
}

export async function fetchAllNotificationsPages(options?: {
  notification_type?: string;
  pageLimit?: number;
}): Promise<Notification[]> {
  const limit = Math.min(Math.max(options?.pageLimit ?? 10, 1), 10);
  const type = options?.notification_type;
  const out: Notification[] = [];
  let page = 1;

  for (;;) {
    const batch = await fetchNotificationsPage({ limit, page, notification_type: type });
    out.push(...batch);
    if (batch.length < limit) break;
    page += 1;
  }

  log.info("upstream:fetch_all_done", { total: out.length, notification_type: type ?? null });
  return out;
}
