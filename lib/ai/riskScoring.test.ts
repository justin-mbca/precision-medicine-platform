import {
  computeBaselineRiskScores,
  recomputeRiskScores,
  type RiskScore,
} from "./riskScoring";
import type { PatientRecord } from "@/types/medical";

function minimalPatient(overrides: Partial<PatientRecord> = {}): PatientRecord {
  return {
    demographics: {
      patientId: "P001",
      givenName: "Test",
      familyName: "Patient",
      dateOfBirth: "1970-01-01",
      sex: "female",
      raceEthnicity: "white",
      country: "US",
    },
    medicalHistory: [],
    currentMedications: [],
    labResults: [],
    genomic: {
      variants: [],
      associatedConditions: [],
      variantAnnotations: [],
      drugGeneInteractions: [],
      evidenceBasedRecommendations: [],
      genomicFindings: [],
    },
    clinicalNotes: [],
    treatmentPlans: [],
    followUpRecommendations: [],
    ...overrides,
  };
}

describe("computeBaselineRiskScores", () => {
  it("returns three risk scores (breast, cardio, alz)", () => {
    const patient = minimalPatient();
    const scores = computeBaselineRiskScores(patient);
    expect(scores).toHaveLength(3);
    expect(scores.map((s) => s.name)).toEqual([
      "Breast cancer genomic risk",
      "10-year cardiovascular risk (integrated)",
      "Alzheimer disease genomic risk",
    ]);
  });

  it("sets high breast cancer risk when BRCA1 pathogenic", () => {
    const patient = minimalPatient({
      genomic: {
        variants: [
          {
            id: "v1",
            patientId: "P001",
            geneSymbol: "BRCA1",
            genomicChange: "chr17:g.43071077_43071078del",
            codingChange: "c.68_69delAG",
            zygosity: "heterozygous",
            acmgClassification: "pathogenic",
          } as any,
        ],
        associatedConditions: [],
        variantAnnotations: [],
        drugGeneInteractions: [],
        evidenceBasedRecommendations: [],
        genomicFindings: [],
      },
    });
    const scores = computeBaselineRiskScores(patient);
    const breast = scores.find((s) => s.name.includes("Breast"));
    expect(breast?.score).toBe(0.85);
    expect(breast?.interpretation).toContain("pathogenic BRCA1");
  });

  it("sets baseline breast risk when no BRCA1 pathogenic", () => {
    const patient = minimalPatient();
    const scores = computeBaselineRiskScores(patient);
    const breast = scores.find((s) => s.name.includes("Breast"));
    expect(breast?.score).toBe(0.25);
  });

  it("increases cardio risk for hypertension (I10)", () => {
    const patient = minimalPatient({
      medicalHistory: [
        {
          id: "c1",
          patientId: "P001",
          code: "I10",
          codeSystem: "ICD-10",
          display: "Essential hypertension",
          status: "active",
        } as any,
      ],
    });
    const scores = computeBaselineRiskScores(patient);
    const cardio = scores.find((s) => s.name.includes("cardiovascular"));
    expect(cardio!.score).toBe(0.3); // 0.15 + 0.15
  });

  it("increases cardio risk for high LDL", () => {
    const patient = minimalPatient({
      labResults: [
        {
          id: "l1",
          patientId: "P001",
          testName: "LDL cholesterol",
          collectedAt: "2024-01-15T10:00:00Z",
          value: 150,
        } as any,
      ],
    });
    const scores = computeBaselineRiskScores(patient);
    const cardio = scores.find((s) => s.name.includes("cardiovascular"));
    expect(cardio!.score).toBe(0.25); // 0.15 + 0.1
  });

  it("sets elevated Alzheimer risk for APOE e4", () => {
    const patient = minimalPatient({
      genomic: {
        variants: [
          {
            id: "v1",
            patientId: "P001",
            geneSymbol: "APOE",
            genomicChange: "chr19:g.45411941T>C",
            codingChange: "c.388T>C",
            proteinChange: "p.Cys130Arg (e4)",
            zygosity: "heterozygous",
          } as any,
        ],
        associatedConditions: [],
        variantAnnotations: [],
        drugGeneInteractions: [],
        evidenceBasedRecommendations: [],
        genomicFindings: [],
      },
    });
    const scores = computeBaselineRiskScores(patient);
    const alz = scores.find((s) => s.name.includes("Alzheimer"));
    expect(alz?.score).toBe(0.35);
    expect(alz?.interpretation).toContain("APOE e4");
  });
});

describe("recomputeRiskScores", () => {
  it("returns scores with jitter and recompute suffix", async () => {
    const patient = minimalPatient();
    const scores = await recomputeRiskScores(patient);
    expect(scores).toHaveLength(3);
    scores.forEach((s) => {
      expect(s.interpretation).toContain("recomputed by mock model");
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(1);
    });
  });
});
