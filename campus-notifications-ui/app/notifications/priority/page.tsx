"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { NotificationCard } from "@/components/NotificationCard";
import { createClientLogger } from "@/lib/client-logger";
import { loadReadIds, markRead } from "@/lib/read-state";
import type { Notification } from "@/lib/types";

const log = createClientLogger("page-priority");

type FilterType = "" | "Event" | "Result" | "Placement";

export default function PriorityPage() {
  const [topN, setTopN] = useState(10);
  const [typeFilter, setTypeFilter] = useState<FilterType>("");
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("n", String(topN));
    if (typeFilter) params.set("notification_type", typeFilter);
    log.info("data:priority_fetch", { topN, typeFilter: typeFilter || null });
    try {
      const res = await fetch(`/api/priority-inbox?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { notifications: Notification[] };
      setItems(data.notifications ?? []);
      log.info("data:priority_ok", { count: data.notifications?.length ?? 0 });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      log.error("data:priority_failed", { message });
    } finally {
      setLoading(false);
    }
  }, [topN, typeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const onMarkRead = useCallback((id: string) => {
    const next = markRead(id);
    setReadIds(next);
    log.info("ui:mark_read", { id });
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Priority notifications
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: "center" }}>
        <TextField
          label="Top n"
          type="number"
          size="small"
          value={topN}
          onChange={(e) => setTopN(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
          inputProps={{ min: 1, max: 100 }}
          sx={{ width: { xs: "100%", sm: 140 } }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="type-filter-label">Notification type</InputLabel>
          <Select
            labelId="type-filter-label"
            label="Notification type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FilterType)}
          >
            <MenuItem value="">All types (weighted)</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && items.length === 0 ? (
        <Alert severity="info">No notifications returned for this filter.</Alert>
      ) : null}

      {items.map((n, idx) => (
        <NotificationCard
          key={n.ID}
          item={n}
          unread={!readIds.has(n.ID)}
          onMarkRead={onMarkRead}
          highlight={idx === 0}
        />
      ))}
    </Box>
  );
}
