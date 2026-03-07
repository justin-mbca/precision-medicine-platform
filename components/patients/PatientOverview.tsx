import { useState } from "react";
import { usePatients } from "@/lib/usePatients";
import type { PatientRecord } from "@/types/medical";
import { computeBaselineRiskScores, type RiskScore } from "@/lib/ai/riskScoring";
import { ClinicalDocumentationPanel } from "./ClinicalDocumentationPanel";

export function PatientOverview() {
  const { data, loading, error } = usePatients();
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeError, setRecomputeError] = useState<string | null>(null);
  const [updatedRiskScores, setUpdatedRiskScores] = useState<{
    [patientId: string]: RiskScore[];
  }>({});

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="col-span-2 h-40 rounded-xl bg-slate-200 animate-pulse" />
        <div className="h-40 rounded-xl bg-slate-200 animate-pulse" />
        <div className="h-56 rounded-xl bg-slate-200 animate-pulse" />
        <div className="h-56 rounded-xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-semibold mb-1">Unable to load patient data</p>
        <p>{error ?? "Unknown error occurred."}</p>
      </div>
    );
  }

  const [firstPatient] = data;
  const riskScores =
    updatedRiskScores[firstPatient.demographics.patientId] ??
    computeBaselineRiskScores(firstPatient as PatientRecord);

  async function handleRecomputeRisk() {
    setRecomputing(true);
    setRecomputeError(null);
    try {
      const res = await fetch(
        `/api/patients/${firstPatient.demographics.patientId}/recompute-risk`,
        {
          method: "POST"
        }
      );
      if (!res.ok) {
        let message = "Failed to recompute risk scores";
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) message = body.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }
      const body = (await res.json()) as { riskScores: RiskScore[] };
      setUpdatedRiskScores((prev) => ({
        ...prev,
        [firstPatient.demographics.patientId]: body.riskScores
      }));
    } catch (err) {
      setRecomputeError(
        err instanceof Error ? err.message : "Unknown error during recompute"
      );
    } finally {
      setRecomputing(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="col-span-2 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                Patient summary
              </h2>
              <p className="text-lg font-semibold text-slate-900">
                {firstPatient.demographics.givenName}{" "}
                {firstPatient.demographics.familyName}
              </p>
              <p className="text-sm text-slate-600">
                ID {firstPatient.demographics.patientId} • DOB{" "}
                {firstPatient.demographics.dateOfBirth} •{" "}
                {firstPatient.demographics.sex.toUpperCase()}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Synthetic data for development only – not real PHI.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleRecomputeRisk}
                disabled={recomputing}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-500 disabled:opacity-60"
              >
                {recomputing ? "Recomputing…" : "Recompute risk (mock AI)"}
              </button>
              {recomputeError && (
                <p className="text-[11px] text-red-600 text-right max-w-xs">
                  {recomputeError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Genomic risk snapshot
          </h2>
          {riskScores.map((rs) => (
            <div key={rs.id} className="mb-3 last:mb-0">
              <p className="text-xs font-medium text-slate-700">{rs.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: `${rs.score * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-700">
                  {(rs.score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {rs.interpretation}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Pathogenic variants
          </h2>
          <ul className="space-y-2">
            {firstPatient.genomic.variants.map((v) => (
              <li
                key={v.id}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">
                    {v.geneSymbol} {v.codingChange}
                  </p>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 uppercase">
                    {v.acmgClassification ?? v.clinVarSignificance ?? "vus"}
                  </span>
                </div>
                <p className="mt-1 text-slate-600">
                  {v.proteinChange}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Medical history & recent labs
          </h2>
          <ul className="space-y-2">
            {firstPatient.medicalHistory.map((cond) => (
              <li
                key={cond.id}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">
                    {cond.display}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase">
                    {cond.status}
                  </span>
                </div>
                <p className="text-slate-500">
                  Code {cond.code} ({cond.codeSystem})
                </p>
              </li>
            ))}
            {firstPatient.labResults.map((lab) => (
              <li
                key={lab.id}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">
                    {lab.testName}
                  </p>
                  {lab.flag && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase">
                      {lab.flag}
                    </span>
                  )}
                </div>
                <p className="text-slate-500">
                  {new Date(lab.collectedAt).toLocaleDateString()} •{" "}
                  {lab.loincCode ?? "no LOINC"}
                </p>
                <p className="text-slate-600">
                  Value: {lab.value} {lab.unit ?? ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ClinicalDocumentationPanel patient={firstPatient as PatientRecord} />
    </div>
  );
}

