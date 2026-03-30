const STORAGE_KEY = "pollux_viewed_messages";
const MAX_ENTRIES = 500;

export function getViewedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markViewed(id: string): Set<string> {
  const ids = getViewedIds();
  if (ids.has(id)) return ids;
  ids.add(id);
  const arr = [...ids].slice(-MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // localStorage full or unavailable — degrade silently
  }
  return new Set(arr);
}

export function isViewed(id: string): boolean {
  return getViewedIds().has(id);
}
