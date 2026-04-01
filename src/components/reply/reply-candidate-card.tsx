import type { ReplyCandidate } from "@/lib/types";

interface Props {
  candidate: ReplyCandidate;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function ReplyCandidateCard({ candidate, index, isSelected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-lg border transition-all ${
        isSelected
          ? "border-accent bg-accent-subtle shadow-xs"
          : "border-border-light hover:border-border bg-surface"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
              isSelected ? "bg-accent text-white" : "bg-subtle text-ink-tertiary"
            }`}>
              {index}
            </span>
            <span className="text-[11px] text-ink-tertiary">{candidate.explanation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-1 rounded-full bg-subtle overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  candidate.confidence >= 0.9
                    ? "bg-positive"
                    : candidate.confidence >= 0.8
                      ? "bg-caution"
                      : "bg-ink-faint"
                }`}
                style={{ width: `${candidate.confidence * 100}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-ink-faint w-6 text-right">
              {Math.round(candidate.confidence * 100)}%
            </span>
          </div>
        </div>
        <p className="text-[13px] text-ink-secondary whitespace-pre-wrap leading-relaxed pl-7">
          {candidate.text}
        </p>
      </div>
    </button>
  );
}
