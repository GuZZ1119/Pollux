import type { ReplyCandidate } from "@/lib/types";

interface Props {
  candidate: ReplyCandidate;
  isSelected: boolean;
  onSelect: () => void;
}

export function ReplyCandidateCard({ candidate, isSelected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{candidate.explanation}</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${
            candidate.confidence >= 0.9
              ? "bg-green-100 text-green-700"
              : candidate.confidence >= 0.8
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {Math.round(candidate.confidence * 100)}%
        </span>
      </div>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{candidate.text}</p>
    </button>
  );
}
