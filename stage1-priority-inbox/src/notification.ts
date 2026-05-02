export interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

/** Placement > Result > Event */
const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function typeWeight(type: string): number {
  return TYPE_WEIGHT[type] ?? 0;
}

export function parseTimestamp(ts: string): number {
  return new Date(ts.replace(" ", "T")).getTime();
}

export function priorityCompare(a: Notification, b: Notification): number {
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
