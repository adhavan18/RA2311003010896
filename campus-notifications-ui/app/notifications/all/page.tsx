"use client";

import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NotificationCard } from "@/components/NotificationCard";
import { createClientLogger } from "@/lib/client-logger";
import { loadReadIds, markRead } from "@/lib/read-state";
import type { Notification } from "@/lib/types";

const log = createClientLogger("page-all");

export default function AllNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());

  const loadPage = useCallback(async (nextPage: number, append: boolean) => {
    setLoading(true);
    setError(null);
    log.info("data:fetch_start", { page: nextPage, append });
    try {
      const res = await fetch(`/api/notifications?limit=10&page=${nextPage}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { notifications: Notification[] };
      const batch = data.notifications ?? [];
      setItems((prev) => (append ? [...prev, ...batch] : batch));
      setHasMore(batch.length === 10);
      log.info("data:fetch_ok", { page: nextPage, received: batch.length });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      log.error("data:fetch_failed", { message, page: nextPage });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const onMarkRead = useCallback((id: string) => {
    const next = markRead(id);
    setReadIds(next);
    log.info("ui:mark_read", { id });
  }, []);

  const unreadCount = useMemo(
    () => items.filter((n) => !readIds.has(n.ID)).length,
    [items, readIds],
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        All notifications
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Unread: {unreadCount}. Mark viewed per row.
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading && items.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {items.map((n) => (
        <NotificationCard
          key={n.ID}
          item={n}
          unread={!readIds.has(n.ID)}
          onMarkRead={onMarkRead}
        />
      ))}

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          disabled={loading || !hasMore}
          onClick={() => {
            const next = page + 1;
            setPage(next);
            void loadPage(next, true);
          }}
        >
          {loading ? "Loading…" : hasMore ? "Load more" : "End of feed"}
        </Button>
      </Box>
    </Box>
  );
}
