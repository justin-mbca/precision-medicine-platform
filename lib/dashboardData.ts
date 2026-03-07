import type { PatientRecord } from "@/types/medical";
import type {
  HealthDimensionId,
  HealthDimensionScore,
  DimensionStatus,
  DimensionContributor
} from "@/types/dashboard";

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

function statusFromScore(score: number): DimensionStatus {
  if (score <= 0.33) return "green";
  if (score <= 0.66) return "yellow";
  return "red";
}

function statusFromScoreInverse(score: number): DimensionStatus {
  if (score >= 0.66) return "green";
  if (score >= 0.33) return "yellow";
  return "red";
}

function now(): string {
  return new Date().toISOString();
}

/**
 * Computes health dimension scores from patient genomic and clinical data.
 * Integrates EMR, labs, and genomic findings for each dimension.
 */
export function computeDimensionScores(
  patient: PatientRecord
): HealthDimensionScore[] {
  const { genomic, medicalHistory, labResults } = patient;

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
  const hasDiabetes = medicalHistory.some(
    (c) =>
      c.code === "E11" ||
      c.code === "E10" ||
      c.display?.toLowerCase().includes("diabetes")
  );
  const hasCancerHistory = medicalHistory.some(
    (c) =>
      c.code?.startsWith("C") ||
      c.display?.toLowerCase().includes("cancer") ||
      c.display?.toLowerCase().includes("neoplasm")
  );

  const ldl = getLatestLab(patient, "LDL cholesterol");
  const hba1c = getLatestLab(patient, "HbA1c");
  const creatinine = getLatestLab(patient, "Creatinine");
  const alt = getLatestLab(patient, "ALT");
  const wbc = getLatestLab(patient, "WBC");

  const cardioContributors: DimensionContributor[] = [];
  let cardioScore = 0.2;
  if (hasHypertension) {
    cardioScore += 0.25;
    cardioContributors.push({
      label: "Hypertension",
      impact: 0.4,
      status: "yellow",
      source: "condition"
    });
  }
  if (typeof ldl === "number" && ldl > 130) {
    cardioScore += 0.2;
    cardioContributors.push({
      label: `LDL elevated (${ldl} mg/dL)`,
      impact: 0.35,
      status: "yellow",
      source: "lab"
    });
  }
  if (hasApoE4) {
    cardioScore += 0.15;
    cardioContributors.push({
      label: "APOE e4 genotype",
      impact: 0.25,
      status: "yellow",
      source: "genomic"
    });
  }
  if (cardioContributors.length === 0) {
    cardioContributors.push({
      label: "No major risk factors",
      impact: 0.2,
      status: "green",
      source: "lab"
    });
  }
  cardioScore = Math.min(1, cardioScore);

  const metabolicContributors: DimensionContributor[] = [];
  let metabolicScore = 0.15;
  if (hasDiabetes) {
    metabolicScore += 0.4;
    metabolicContributors.push({
      label: "Diabetes",
      impact: 0.5,
      status: "red",
      source: "condition"
    });
  }
  if (typeof hba1c === "number" && hba1c > 6.5) {
    metabolicScore += 0.35;
    metabolicContributors.push({
      label: `HbA1c elevated (${hba1c}%)`,
      impact: 0.45,
      status: "red",
      source: "lab"
    });
  }
  if (metabolicContributors.length === 0) {
    metabolicContributors.push({
      label: "Metabolic parameters normal",
      impact: 0.15,
      status: "green",
      source: "lab"
    });
  }
  metabolicScore = Math.min(1, metabolicScore);

  const cancerContributors: DimensionContributor[] = [];
  const cancerScore = hasBrac1Pathogenic ? 0.88 : hasCancerHistory ? 0.6 : 0.25;
  if (hasBrac1Pathogenic) {
    cancerContributors.push({
      label: "Pathogenic BRCA1 variant",
      impact: 0.85,
      status: "red",
      source: "genomic"
    });
  }
  if (hasCancerHistory && !hasBrac1Pathogenic) {
    cancerContributors.push({
      label: "Cancer history",
      impact: 0.6,
      status: "yellow",
      source: "condition"
    });
  }
  if (cancerContributors.length === 0) {
    cancerContributors.push({
      label: "Baseline cancer risk",
      impact: 0.25,
      status: "green",
      source: "genomic"
    });
  }

  const neuroContributors: DimensionContributor[] = [];
  const neuroScore = hasApoE4 ? 0.5 : 0.15;
  if (hasApoE4) {
    neuroContributors.push({
      label: "APOE e4 genotype",
      impact: 0.5,
      status: "yellow",
      source: "genomic"
    });
  } else {
    neuroContributors.push({
      label: "No major neurological risk",
      impact: 0.15,
      status: "green",
      source: "genomic"
    });
  }

  const immuneScore =
    typeof wbc === "number" && (wbc < 4 || wbc > 11) ? 0.55 : 0.2;
  const immuneStatus =
    typeof wbc === "number" && wbc >= 4 && wbc <= 11 ? "green" : "yellow";
  const immuneContributors: DimensionContributor[] = [
    {
      label:
        typeof wbc === "number"
          ? `WBC ${wbc} K/µL`
          : "WBC not in current data",
      impact: immuneScore,
      status: immuneStatus,
      source: "lab"
    }
  ];

  const cr = typeof creatinine === "number" ? creatinine : 0.9;
  const gfrEst = cr > 0 ? 140 / cr : 100;
  const renalScore =
    gfrEst < 60 ? 0.7 : gfrEst < 90 ? 0.4 : 0.15;
  const renalStatus = statusFromScoreInverse(
    gfrEst >= 90 ? 0.9 : gfrEst >= 60 ? 0.6 : 0.3
  );
  const renalContributors: DimensionContributor[] = [
    {
      label: `Creatinine ${cr} mg/dL (eGFR ~${Math.round(gfrEst)})`,
      impact: renalScore,
      status: renalStatus,
      source: "lab"
    }
  ];

  const hepaticScore = typeof alt === "number" && alt > 40 ? 0.6 : 0.2;
  const hepaticContributors: DimensionContributor[] = [
    {
      label:
        typeof alt === "number"
          ? `ALT ${alt} U/L`
          : "Liver enzymes not in current data",
      impact: hepaticScore,
      status: typeof alt === "number" && alt <= 40 ? "green" : "yellow",
      source: "lab"
    }
  ];

  const dimensions: HealthDimensionScore[] = [
    {
      dimensionId: "cardiovascular",
      status: statusFromScore(cardioScore),
      score: cardioScore,
      summary: hasHypertension
        ? "Hypertension present; LDL and APOE genotype contribute to cardiovascular risk."
        : "No major cardiovascular risk factors identified.",
      contributors: cardioContributors,
      genomicFindings: hasApoE4
        ? genomic.variants
            .filter((v) => v.geneSymbol === "APOE")
            .map((v) => `${v.geneSymbol} ${v.codingChange} (${v.proteinChange ?? "—"})`)
        : [],
      aiRecommendation:
        hasApoE4 && typeof ldl === "number" && ldl > 130
          ? "APOE e4 genotype and elevated LDL support aggressive lipid management per guidelines."
          : undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "metabolic",
      status: statusFromScore(metabolicScore),
      score: metabolicScore,
      summary: hasDiabetes
        ? "Diabetes documented; metabolic parameters require monitoring."
        : "No significant metabolic dysfunction identified.",
      contributors: metabolicContributors,
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "cancer_risk",
      status: statusFromScore(cancerScore),
      score: cancerScore,
      summary: hasBrac1Pathogenic
        ? "Pathogenic BRCA1 variant confers high hereditary cancer risk."
        : hasCancerHistory
          ? "Cancer history present; ongoing surveillance recommended."
          : "Baseline cancer risk; no high-penetrance variants identified.",
      contributors: cancerContributors,
      genomicFindings: genomic.variants
        .filter(
          (v) =>
            v.geneSymbol === "BRCA1" ||
            v.geneSymbol === "BRCA2" ||
            v.associatedDiseases?.some((d) => d.toLowerCase().includes("cancer"))
        )
        .map((v) => `${v.geneSymbol} ${v.codingChange} (${v.acmgClassification ?? v.clinVarSignificance ?? "—"})`),
      aiRecommendation: hasBrac1Pathogenic
        ? "NCCN guidelines support enhanced breast/ovarian surveillance and PARP inhibitor eligibility discussion."
        : undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "neurological",
      status: statusFromScore(neuroScore),
      score: neuroScore,
      summary: hasApoE4
        ? "APOE e4 genotype associated with increased Alzheimer disease risk."
        : "No major neurological risk factors from genomic profile.",
      contributors: neuroContributors,
      genomicFindings: genomic.variants
        .filter((v) => v.geneSymbol === "APOE")
        .map((v) => `${v.geneSymbol} ${v.codingChange} (${v.proteinChange ?? "—"})`),
      aiRecommendation: hasApoE4
        ? "Consider cognitive screening and lifestyle interventions per AAN guidelines."
        : undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "immune",
      status: immuneStatus,
      score: immuneScore,
      summary:
        typeof wbc === "number" && (wbc < 4 || wbc > 11)
          ? "WBC outside reference range; consider follow-up."
          : "Immune parameters within expected range.",
      contributors: immuneContributors,
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "renal",
      status: renalStatus,
      score: renalScore,
      summary:
        typeof creatinine === "number" && creatinine > 1.2
          ? "Creatinine elevated; assess eGFR and kidney function."
          : "Renal function within expected range.",
      contributors: renalContributors,
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "hepatic",
      status: statusFromScoreInverse(
        typeof alt === "number" && alt <= 40 ? 0.85 : 0.45
      ),
      score: hepaticScore,
      summary:
        typeof alt === "number" && alt > 40
          ? "ALT elevated; consider hepatic workup."
          : "Hepatic enzymes within reference range.",
      contributors: hepaticContributors,
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "respiratory",
      status: "green",
      score: 0.2,
      summary:
        "No respiratory conditions or abnormal findings in current data.",
      contributors: [
        { label: "No respiratory data", impact: 0.2, status: "green", source: "lab" }
      ],
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "hematologic",
      status: "green",
      score: 0.25,
      summary: "Hematologic parameters within expected range.",
      contributors: [
        {
          label: "CBC/labs not in current data",
          impact: 0.25,
          status: "green",
          source: "lab"
        }
      ],
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "endocrine",
      status: statusFromScore(hasDiabetes ? 0.55 : 0.2),
      score: hasDiabetes ? 0.55 : 0.2,
      summary: hasDiabetes
        ? "Endocrine disorder (diabetes) documented."
        : "No significant endocrine dysfunction identified.",
      contributors: hasDiabetes
        ? [
            {
              label: "Diabetes",
              impact: 0.55,
              status: "yellow",
              source: "condition"
            }
          ]
        : [
            {
              label: "No endocrine dysfunction",
              impact: 0.2,
              status: "green",
              source: "condition"
            }
          ],
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "gastrointestinal",
      status: "green",
      score: 0.2,
      summary: "No GI conditions or abnormal findings in current data.",
      contributors: [
        {
          label: "No GI data",
          impact: 0.2,
          status: "green",
          source: "condition"
        }
      ],
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "musculoskeletal",
      status: "green",
      score: 0.2,
      summary: "No musculoskeletal conditions in current data.",
      contributors: [
        {
          label: "No MSK data",
          impact: 0.2,
          status: "green",
          source: "condition"
        }
      ],
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "dermatologic",
      status: "green",
      score: 0.2,
      summary: "No dermatologic conditions in current data.",
      contributors: [
        {
          label: "No dermatologic data",
          impact: 0.2,
          status: "green",
          source: "condition"
        }
      ],
      genomicFindings: [],
      aiRecommendation: undefined,
      lastUpdated: now()
    },
    {
      dimensionId: "mental_health",
      status: "green",
      score: 0.25,
      summary:
        "No documented mental health conditions; consider screening in high-risk contexts.",
      contributors: hasApoE4
        ? [
            {
              label: "APOE e4 may influence mood",
              impact: 0.25,
              status: "green",
              source: "genomic"
            }
          ]
        : [
            {
              label: "No mental health data",
              impact: 0.25,
              status: "green",
              source: "condition"
            }
          ],
      genomicFindings: [],
      aiRecommendation: hasApoE4
        ? "APOE e4 may influence mood; consider psychosocial support in at-risk patients."
        : undefined,
      lastUpdated: now()
    }
  ];

  return dimensions;
}
