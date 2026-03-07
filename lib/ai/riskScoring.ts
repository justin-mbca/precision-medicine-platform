import type { PatientRecord } from "@/types/medical";

export interface RiskScore {
  id: string;
  name: string;
  score: number; // 0–1
  interpretation: string;
}

function getLatestLab(
  patient: PatientRecord,
  testName: string
): number | undefined {
  const labs = patient.labResults
    .filter((l) => l.testName === testName)
    .sort(
      (a, b) =>
        new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()
    );
  const latest = labs[0];
  return typeof latest?.value === "number" ? latest.value : undefined;
}

export function computeBaselineRiskScores(
  patient: PatientRecord
): RiskScore[] {
  const { genomic, medicalHistory } = patient;

  const hasBrac1Pathogenic = genomic.variants.some(
    (v) =>
      v.geneSymbol === "BRCA1" &&
      (v.acmgClassification === "pathogenic" ||
        v.acmgClassification === "likely_pathogenic" ||
        v.clinVarSignificance === "pathogenic" ||
        v.clinVarSignificance === "likely_pathogenic")
  );

  const hasApoE4 = genomic.variants.some(
    (v) =>
      v.geneSymbol === "APOE" &&
      typeof v.proteinChange === "string" &&
      v.proteinChange.toLowerCase().includes("e4")
  );

  const hasHypertension = medicalHistory.some((c) => c.code === "I10");
  const ldl = getLatestLab(patient, "LDL cholesterol");

  const breastCancerRisk = hasBrac1Pathogenic ? 0.85 : 0.25;

  let cardioRisk = 0.15;
  if (hasHypertension) cardioRisk += 0.15;
  if (typeof ldl === "number" && ldl > 130) cardioRisk += 0.1;
  if (hasApoE4) cardioRisk += 0.1;
  cardioRisk = Math.min(1, cardioRisk);

  const alzRisk = hasApoE4 ? 0.35 : 0.1;

  const scores: RiskScore[] = [
    {
      id: `${patient.demographics.patientId}-breast`,
      name: "Breast cancer genomic risk",
      score: breastCancerRisk,
      interpretation: hasBrac1Pathogenic
        ? "High risk driven by pathogenic BRCA1 variant; consider enhanced surveillance and PARP eligibility."
        : "Baseline population-level breast cancer risk."
    },
    {
      id: `${patient.demographics.patientId}-cardio`,
      name: "10-year cardiovascular risk (integrated)",
      score: cardioRisk,
      interpretation:
        "Composite cardiovascular risk derived from hypertension history, LDL values, and APOE-related risk."
    },
    {
      id: `${patient.demographics.patientId}-alz`,
      name: "Alzheimer disease genomic risk",
      score: alzRisk,
      interpretation: hasApoE4
        ? "Elevated Alzheimer disease risk associated with APOE e4 genotype."
        : "Baseline population-level Alzheimer disease risk."
    }
  ];

  return scores;
}

export async function recomputeRiskScores(
  patient: PatientRecord
): Promise<RiskScore[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const baseline = computeBaselineRiskScores(patient);

  return baseline.map((score) => {
    const jitter = (Math.random() - 0.5) * 0.05;
    const adjusted = Math.max(0, Math.min(1, score.score + jitter));
    return {
      ...score,
      score: adjusted,
      interpretation: `${score.interpretation} (recomputed by mock model)`
    };
  });
}

