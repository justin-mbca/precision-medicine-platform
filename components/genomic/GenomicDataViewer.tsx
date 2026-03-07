import { useState, useMemo } from "react";
import type { GeneVariant } from "@/types/medical";
import { VariantImpactBadge } from "./VariantImpactBadge";
import { VariantCard } from "./VariantCard";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

interface Props {
  variants: GeneVariant[];
  loading?: boolean;
  onAnalyzeVariant?: (variant: GeneVariant) => void;
  viewMode?: "table" | "cards";
}

const SIGNIFICANCE_OPTIONS = [
  "pathogenic",
  "likely_pathogenic",
  "vus",
  "drug_response",
  "likely_benign",
  "benign",
  "other"
] as const;

const VARIANT_TYPE_OPTIONS = ["SNP", "indel", "CNV", "fusion", "other"] as const;

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="mt-2 h-4 w-64 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-5 w-28 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GenomicDataViewer({
  variants,
  loading = false,
  onAnalyzeVariant,
  viewMode: initialViewMode = "table"
}: Props) {
  const [search, setSearch] = useState("");
  const [significanceFilter, setSignificanceFilter] = useState<string>("");
  const [variantTypeFilter, setVariantTypeFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">(initialViewMode);

  const filteredVariants = useMemo(() => {
    return variants.filter((v) => {
      const sig = v.acmgClassification ?? v.clinVarSignificance ?? "";
      const type = v.variantType ?? "other";
      const searchLower = search.toLowerCase();

      const matchesSearch =
        !search ||
        v.geneSymbol.toLowerCase().includes(searchLower) ||
        v.codingChange.toLowerCase().includes(searchLower) ||
        v.genomicChange.toLowerCase().includes(searchLower) ||
        v.proteinChange?.toLowerCase().includes(searchLower) ||
        v.associatedDiseases?.some((d) =>
          d.toLowerCase().includes(searchLower)
        );

      const matchesSig = !significanceFilter || sig === significanceFilter;
      const matchesType = !variantTypeFilter || type === variantTypeFilter;

      return matchesSearch && matchesSig && matchesType;
    });
  }, [variants, search, significanceFilter, variantTypeFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Genetic variants
          </h2>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Genetic variants
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              viewMode === "table"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              viewMode === "cards"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search gene, variant, condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-slate-500" />
          <select
            value={significanceFilter}
            onChange={(e) => setSignificanceFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
          >
            <option value="">All significance</option>
            {SIGNIFICANCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <select
            value={variantTypeFilter}
            onChange={(e) => setVariantTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
          >
            <option value="">All types</option>
            {VARIANT_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Showing {filteredVariants.length} of {variants.length} variant
        {variants.length !== 1 ? "s" : ""}
      </p>

      {viewMode === "table" ? (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Gene
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Location / Change
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Significance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Associated conditions
                  </th>
                  {onAnalyzeVariant && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVariants.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">
                        {v.geneSymbol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-mono text-slate-800">
                          {v.genomicChange}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {v.codingChange}
                          {v.proteinChange && ` → ${v.proteinChange}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 uppercase">
                        {v.variantType ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <VariantImpactBadge
                        significance={
                          v.acmgClassification ?? v.clinVarSignificance
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {v.associatedDiseases?.slice(0, 2).map((d) => (
                          <span
                            key={d}
                            className="rounded bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
                            title={d}
                          >
                            {d.length > 20 ? `${d.slice(0, 20)}…` : d}
                          </span>
                        ))}
                        {(!v.associatedDiseases ||
                          v.associatedDiseases.length === 0) && (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    {onAnalyzeVariant && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onAnalyzeVariant(v)}
                          className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-500"
                        >
                          AI analyze
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredVariants.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">
              No variants match your filters.
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVariants.map((v) => (
            <VariantCard
              key={v.id}
              variant={v}
              onAnalyze={onAnalyzeVariant}
              compact={false}
            />
          ))}
          {filteredVariants.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm rounded-xl border border-dashed border-slate-200">
              No variants match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
