# Stage 1

## Approach

Notifications are ranked by:

1. **Weight:** `Placement` > `Result` > `Event` (encoded as numeric weights 3, 2, 1; unknown types last).
2. **Recency:** Within the same type, newer `Timestamp` first.

The **top 10** are the first 10 items after sorting in memory. Data comes only from **GET** `/evaluation-service/notifications` (paginated). Nothing is stored in a database and notifications are not hard-coded. The API does not expose read/unread flags, so every fetched notification is treated as eligible for the priority inbox (read tracking is only in Stage 2 on the frontend).

## Pagination

The client pages with `limit` (the evaluation API allows **at most 10** per request) and `page` until a short page is returned, then concatenates results in memory (no local persistence).

## Keeping top 10 as new items stream in

**Batch (this script):** sort all items **O(N log N)**, take first 10 — **O(1)** slice.

**Streaming:** maintain a **min-heap** of size at most 10 using the same ordering; each new item is **O(log 10)** ≈ **O(1)**. If the heap is full and the new item beats the worst of the 10, replace the root.

## Logging

All diagnostics use `@evaluation/logging-middleware` (JSON lines on `stdout`). Built-in console loggers are not used.
