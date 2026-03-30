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
      className={`w-full text-left rounded-xl border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50/50 shadow-sm"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {index}
            </span>
            <span className="text-xs text-gray-500">{candidate.explanation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  candidate.confidence >= 0.9
                    ? "bg-green-400"
                    : candidate.confidence >= 0.8
                      ? "bg-yellow-400"
                      : "bg-gray-300"
                }`}
                style={{ width: `${candidate.confidence * 100}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-gray-400 w-7 text-right">
              {Math.round(candidate.confidence * 100)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-8">
          {candidate.text}
        </p>
      </div>
    </button>
  );
}
