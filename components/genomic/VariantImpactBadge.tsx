import type { ClinVarSignificance, AcmgClassification } from "@/types/medical";
import { Tooltip } from "@/components/ui/Tooltip";

type Significance = ClinVarSignificance | AcmgClassification | undefined;

const SIGNIFICANCE_TOOLTIPS: Record<string, string> = {
  pathogenic:
    "Strong evidence this variant causes disease. Often seen in affected individuals and absent or rare in healthy populations.",
  likely_pathogenic:
    "Moderate evidence for disease causation. May require additional data for definitive classification.",
  vus: "Variant of uncertain significance. Insufficient evidence to classify as pathogenic or benign. Re-evaluate periodically.",
  drug_response:
    "Variant affects response to specific medications. May inform dosing or drug selection.",
  likely_benign:
    "Moderate evidence this variant does not cause disease. Often seen in healthy populations.",
  benign:
    "Strong evidence this variant does not cause disease. Common in general population.",
  other: "Classification does not fit standard categories."
};

const SIGNIFICANCE_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pathogenic: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Pathogenic"
  },
  likely_pathogenic: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    label: "Likely pathogenic"
  },
  vus: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "VUS"
  },
  drug_response: {
    bg: "bg-violet-100",
    text: "text-violet-800",
    label: "Drug response"
  },
  likely_benign: {
    bg: "bg-sky-100",
    text: "text-sky-800",
    label: "Likely benign"
  },
  benign: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    label: "Benign"
  },
  other: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    label: "Other"
  }
};

function getStyle(sig: Significance): { bg: string; text: string; label: string } {
  const key = (sig ?? "other").replace(/-/g, "_");
  return SIGNIFICANCE_STYLES[key] ?? SIGNIFICANCE_STYLES.other;
}

function getTooltip(sig: Significance): string {
  const key = (sig ?? "other").replace(/-/g, "_");
  return (
    SIGNIFICANCE_TOOLTIPS[key] ??
    "ACMG/ClinVar clinical significance classification."
  );
}

interface Props {
  significance: Significance;
  className?: string;
}

export function VariantImpactBadge({ significance, className = "" }: Props) {
  const { bg, text, label } = getStyle(significance);
  const tooltip = getTooltip(significance);
  return (
    <Tooltip content={tooltip}>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase cursor-help ${bg} ${text} ${className}`}
      >
        {label}
      </span>
    </Tooltip>
  );
}
