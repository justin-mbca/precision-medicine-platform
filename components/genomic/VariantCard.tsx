import type { GeneVariant } from "@/types/medical";
import { VariantImpactBadge } from "./VariantImpactBadge";
import { InformationCircleIcon, BookOpenIcon } from "@heroicons/react/24/outline";

interface Props {
  variant: GeneVariant;
  onAnalyze?: (variant: GeneVariant) => void;
  compact?: boolean;
}

const VARIANT_TYPE_LABELS: Record<string, string> = {
  SNP: "Single nucleotide polymorphism",
  indel: "Insertion/deletion",
  CNV: "Copy number variant",
  fusion: "Gene fusion",
  other: "Other"
};

export function VariantCard({ variant, onAnalyze, compact = false }: Props) {
  const significance =
    variant.acmgClassification ?? variant.clinVarSignificance ?? "vus";
  const variantType = variant.variantType ?? "other";
  const typeLabel = VARIANT_TYPE_LABELS[variantType] ?? variantType;

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">
              {variant.geneSymbol}
            </span>
            <VariantImpactBadge significance={significance} />
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 uppercase">
              {variantType}
            </span>
          </div>
          <p className="mt-1 font-mono text-sm text-slate-700">
            {variant.codingChange}
            {variant.proteinChange && (
              <span className="text-slate-500"> → {variant.proteinChange}</span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {variant.genomicChange} · {variant.zygosity}
          </p>
        </div>
        {onAnalyze && (
          <button
            onClick={() => onAnalyze(variant)}
            className="shrink-0 rounded-md bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-500"
          >
            AI analyze
          </button>
        )}
      </div>

      {!compact && (
        <>
          {variant.associatedDiseases && variant.associatedDiseases.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-[10px] font-semibold uppercase text-slate-500 mb-1">
                Associated conditions
              </p>
              <ul className="flex flex-wrap gap-1">
                {variant.associatedDiseases.map((d) => (
                  <li
                    key={d}
                    className="rounded bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {variant.literatureReferences &&
            variant.literatureReferences.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <BookOpenIcon className="h-3.5 w-3.5" />
                  Literature
                </p>
                <ul className="space-y-1">
                  {variant.literatureReferences.slice(0, 2).map((ref, i) => (
                    <li key={i} className="text-xs text-slate-600">
                      {ref.pmid && (
                        <span className="font-mono text-slate-500">
                          PMID:{ref.pmid}{" "}
                        </span>
                      )}
                      {ref.title}
                      {ref.year && (
                        <span className="text-slate-400"> ({ref.year})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <div
            className="mt-2 flex items-start gap-1.5 text-slate-500"
            title={typeLabel}
          >
            <InformationCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-[11px]">{typeLabel}</p>
          </div>
        </>
      )}
    </div>
  );
}
