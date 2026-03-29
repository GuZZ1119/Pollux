export const INBOX_MAX_RESULTS = Math.min(
  parseInt(process.env.INBOX_MAX_RESULTS ?? "30", 10),
  100,
);
