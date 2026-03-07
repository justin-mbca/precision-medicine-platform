"use client";

import {
  XMarkIcon,
  BeakerIcon,
  DocumentTextIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import type {
  HealthDimensionId,
  HealthDimensionScore,
  DimensionInsight
} from "@/types/dashboard";
import type { PatientRecord } from "@/types/medical";
import { DIMENSION_LABELS, STATUS_COLORS } from "@/types/dashboard";

interface Props {
  dimensionId: HealthDimensionId;
  score: HealthDimensionScore;
  patient: PatientRecord;
  insight?: DimensionInsight | null;
  onClose: () => void;
}

const CHART_COLORS = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444"
};

export function DimensionDrillDown({
  dimensionId,
  score,
  patient,
  insight,
  onClose
}: Props) {
  const label = DIMENSION_LABELS[dimensionId];
  const statusColor = STATUS_COLORS[score.status];

  const chartData = score.contributors.map((c) => ({
    name: c.label.length > 12 ? c.label.slice(0, 11) + "…" : c.label,
    fullName: c.label,
    value: Math.round(c.impact * 100),
    status: c.status
  }));

  const relevantVariants = patient.genomic.variants.filter((v) => {
    const genes = ["BRCA1", "BRCA2", "APOE", "TPMT", "CYP2C19", "VKORC1"];
    return genes.includes(v.geneSymbol);
  });

  const relevantConditions =
    score.contributors.length > 0
      ? patient.medicalHistory.filter((c) =>
          score.contributors.some(
            (co) =>
              co.source === "condition" &&
              co.label.toLowerCase().includes(c.display.toLowerCase())
          )
        )
      : patient.medicalHistory.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 print:bg-white print:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drilldown-title"
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl print:shadow-none print:max-h-none">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 print:static">
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: statusColor }}
              aria-hidden
            />
            <h2
              id="drilldown-title"
              className="text-lg font-semibold text-slate-900"
            >
              {label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 print:hidden"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Summary */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Summary
            </h3>
            <p className="text-sm text-slate-600">{score.summary}</p>
            <p className="mt-2 text-xs text-slate-500">
              Score: {(score.score * 100).toFixed(0)}% · Status:{" "}
              <span className="capitalize">{score.status}</span>
            </p>
          </section>

          {/* Contributors chart */}
          {chartData.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Contributing factors
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      stroke="#64748b"
                      fontSize={11}
                      tick={{ fill: "#475569" }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Impact"]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullName ?? ""
                      }
                      contentStyle={{
                        fontSize: "12px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0"
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.status === "green"
                              ? CHART_COLORS.green
                              : entry.status === "yellow"
                                ? CHART_COLORS.yellow
                                : CHART_COLORS.red
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Genomic findings */}
          {relevantVariants.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <BeakerIcon className="h-4 w-4 text-brand-600" />
                Genomic findings
              </h3>
              <ul className="space-y-2">
                {relevantVariants.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-900">
                      {v.geneSymbol} {v.codingChange}
                    </span>
                    <span className="ml-2 text-slate-600">
                      {v.acmgClassification ?? v.clinVarSignificance ?? "—"}
                    </span>
                    {v.proteinChange && (
                      <span className="ml-2 text-slate-500">
                        · {v.proteinChange}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Relevant conditions */}
          {relevantConditions.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4 text-brand-600" />
                Clinical conditions
              </h3>
              <ul className="space-y-1">
                {relevantConditions.map((c) => (
                  <li
                    key={c.id}
                    className="text-sm text-slate-600"
                  >
                    {c.display} ({c.code})
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* AI insight */}
          {insight && (
            <section className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <LightBulbIcon className="h-4 w-4 text-brand-600" />
                AI-generated insight
              </h3>
              <p className="text-sm text-slate-700">{insight.text}</p>
              {insight.recommendation && (
                <p className="mt-2 text-sm font-medium text-brand-700">
                  Recommendation: {insight.recommendation}
                </p>
              )}
            </section>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 print:border-t">
          Patient: {patient.demographics.givenName}{" "}
          {patient.demographics.familyName} · MRN:{" "}
          {patient.demographics.patientId} · For clinical use only.
        </div>
      </div>
    </div>
  );
}
