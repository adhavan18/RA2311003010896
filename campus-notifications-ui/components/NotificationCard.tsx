"use client";

import PushPinIcon from "@mui/icons-material/PushPin";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Notification } from "@/lib/types";

const typeColor: Record<string, "default" | "primary" | "secondary" | "success"> = {
  Placement: "primary",
  Result: "secondary",
  Event: "success",
};

export function NotificationCard(props: {
  item: Notification;
  unread: boolean;
  onMarkRead: (id: string) => void;
  highlight?: boolean;
}) {
  const { item, unread, onMarkRead, highlight } = props;
  const chipColor = typeColor[item.Type] ?? "default";

  return (
    <Paper
      elevation={unread ? 3 : 0}
      sx={{
        p: 2,
        mb: 1.5,
        border: 1,
        borderColor: unread ? "primary.light" : "divider",
        bgcolor: unread ? "action.hover" : "background.paper",
        outline: highlight ? "2px solid" : "none",
        outlineColor: "primary.main",
        outlineOffset: 2,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Chip size="small" label={item.Type} color={chipColor} variant={unread ? "filled" : "outlined"} />
            {unread ? (
              <Chip size="small" label="New" color="warning" variant="outlined" />
            ) : (
              <Chip size="small" label="Viewed" variant="outlined" />
            )}
          </Stack>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, wordBreak: "break-word" }}>
            {item.Message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.Timestamp} · {item.ID}
          </Typography>
        </Box>
        {unread ? (
          <Tooltip title="Mark as viewed">
            <IconButton
              aria-label="Mark as viewed"
              onClick={() => onMarkRead(item.ID)}
              color="primary"
            >
              <PushPinIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
    </Paper>
  );
}
