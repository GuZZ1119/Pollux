/**
 * In-memory event log with circular buffer.
 *
 * Matches the existing architecture pattern (cf. token-store.ts) — no DB
 * dependency required for the hackathon. Events are lost on server restart.
 *
 * TODO: Migrate to Prisma / database table for persistence.
 * Migration points: replace `store` array with DB inserts/queries,
 * keep the same EventLogEntry shape as the DB row.
 */

export type EventType =
  | "inbox_fetched"
  | "filter_changed"
  | "risk_classified"
  | "message_opened"
  | "reply_generated"
  | "reply_sent";

export interface EventLogEntry {
  eventId: string;
  eventType: EventType;
  timestamp: string;
  userId: string;
  provider?: string;
  messageId?: string;
  threadId?: string;
  metadata?: Record<string, unknown>;
}

const MAX_ENTRIES = 1000;
const store: EventLogEntry[] = [];

export function logEvent(
  entry: Omit<EventLogEntry, "eventId" | "timestamp">,
): EventLogEntry {
  const full: EventLogEntry = {
    ...entry,
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  store.push(full);
  if (store.length > MAX_ENTRIES) {
    store.splice(0, store.length - MAX_ENTRIES);
  }
  return full;
}

export function getEvents(
  userId?: string,
  limit = 50,
  eventType?: EventType,
): EventLogEntry[] {
  let filtered: EventLogEntry[] = store;
  if (userId) filtered = filtered.filter((e) => e.userId === userId);
  if (eventType) filtered = filtered.filter((e) => e.eventType === eventType);
  return filtered.slice(-limit).reverse();
}

export function getEventCount(): number {
  return store.length;
}
