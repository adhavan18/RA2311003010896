import type { Notification } from "./types";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function typeWeight(type: string): number {
  return TYPE_WEIGHT[type] ?? 0;
}

function parseTimestamp(ts: string): number {
  return new Date(ts.replace(" ", "T")).getTime();
}

function priorityCompare(a: Notification, b: Notification): number {
  const dw = typeWeight(b.Type) - typeWeight(a.Type);
  if (dw !== 0) return dw;
  return parseTimestamp(b.Timestamp) - parseTimestamp(a.Timestamp);
}

export function topPriorityNotifications(
  notifications: Notification[],
  n: number,
): Notification[] {
  return [...notifications].sort(priorityCompare).slice(0, n);
}

export function sortByRecencyDesc(notifications: Notification[]): Notification[] {
  return [...notifications].sort(
    (a, b) => parseTimestamp(b.Timestamp) - parseTimestamp(a.Timestamp),
  );
}
