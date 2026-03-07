import type { RecommendationStatus } from "@/types/assistant";

interface Props {
  confidence: number; // 0–1
  size?: "sm" | "md";
}

function getLabel(confidence: number): string {
  if (confidence >= 0.8) return "High confidence";
  if (confidence >= 0.5) return "Medium confidence";
  return "Low confidence";
}

function getColor(confidence: number): string {
  if (confidence >= 0.8) return "bg-emerald-100 text-emerald-800";
  if (confidence >= 0.5) return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export function ConfidenceBadge({ confidence, size = "sm" }: Props) {
  const label = getLabel(confidence);
  const color = getColor(confidence);
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${color} ${sizeClass}`}
      title={`Confidence: ${(confidence * 100).toFixed(0)}%`}
    >
      {label}
    </span>
  );
}
