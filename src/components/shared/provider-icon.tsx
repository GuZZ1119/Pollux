import type { Provider } from "@/lib/types";

export function ProviderIcon({ provider }: { provider: Provider }) {
  if (provider === "gmail") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-50 text-xs" title="Gmail">
        ✉️
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-purple-50 text-xs" title="Slack">
      💬
    </span>
  );
}
