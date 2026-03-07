import type { RecommendationWithEvidence } from "@/types/assistant";
import { ConfidenceBadge } from "./ConfidenceBadge";

const STATUS_STYLES: Record<
  RecommendationWithEvidence["status"],
  { bg: string; border: string; dot: string }
> = {
  green: { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  yellow: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  red: { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" }
};

interface Props {
  recommendation: RecommendationWithEvidence;
}

export function RecommendationCard({ recommendation }: Props) {
  const { title, status, summary, confidence, citations, dimension } =
    recommendation;
  const style = STATUS_STYLES[status];

  return (
    <div
      className={`rounded-lg border ${style.border} ${style.bg} p-3 text-sm`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
            title={status}
          />
          {dimension && (
            <span className="text-xs font-medium text-slate-500 uppercase shrink-0">
              {dimension}
            </span>
          )}
          <span className="font-semibold text-slate-900 truncate">{title}</span>
        </div>
        <ConfidenceBadge confidence={confidence} size="sm" />
      </div>
      <p className="mt-1.5 text-slate-700 text-xs leading-relaxed">{summary}</p>
      {citations && citations.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {citations.map((c) => (
            <li key={c.id} className="text-[11px] text-slate-500">
              {c.title}
              {c.source && ` — ${c.source}`}
              {c.year && ` (${c.year})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
