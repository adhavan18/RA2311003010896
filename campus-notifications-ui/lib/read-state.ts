"use client";

const STORAGE_KEY = "campus-notifications-read-ids";

export function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function persistReadIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function markRead(id: string): Set<string> {
  const next = loadReadIds();
  next.add(id);
  persistReadIds(next);
  return next;
}

export function markManyRead(ids: string[]): Set<string> {
  const next = loadReadIds();
  for (const id of ids) next.add(id);
  persistReadIds(next);
  return next;
}
