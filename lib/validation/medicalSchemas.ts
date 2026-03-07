import { z } from "zod";

/**
 * Zod schemas aligned with the TypeScript interfaces in `types/medical.ts`.
 * These can be used to validate incoming API payloads or mock data.
 */

export const zBiologicalSex = z.enum([
  "male",
  "female",
  "intersex",
  "unknown"
] as const);

export const zRaceEthnicity = z.enum([
  "asian",
  "black",
  "white",
  "hispanic_latino",
  "native_american",
  "pacific_islander",
  "other",
  "unknown"
] as const);

export const zDemographics = z.object({
  patientId: z.string().min(1),
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sex: zBiologicalSex,
  raceEthnicity: zRaceEthnicity,
  country: z.string().min(1),
  regionOrState: z.string().optional()
});

export const zConditionStatus = z.enum([
  "active",
  "inactive",
  "resolved",
  "remission"
] as const);

export const zMedicalCondition = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  code: z.string().min(1),
  codeSystem: z.enum(["ICD-10", "SNOMED-CT", "Other"] as const),
  display: z.string().min(1),
  onsetDate: z.string().datetime().optional(),
  resolutionDate: z.string().datetime().optional(),
  status: zConditionStatus,
  notes: z.string().optional()
});

export const zMedicationRoute = z.enum([
  "oral",
  "iv",
  "subcutaneous",
  "intramuscular",
  "topical",
  "other"
] as const);

export const zMedicationOrder = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  drugName: z.string().min(1),
  genericName: z.string().optional(),
  rxNormCode: z.string().optional(),
  dose: z.string().min(1),
  route: zMedicationRoute,
  frequency: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isCurrent: z.boolean(),
  indication: z.string().optional()
});

export const zLabFlag = z.enum([
  "normal",
  "high",
  "low",
  "critical_high",
  "critical_low"
] as const);

export const zLabResult = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  testName: z.string().min(1),
  loincCode: z.string().optional(),
  collectedAt: z.string().datetime(),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  referenceRange: z
    .object({
      low: z.number().optional(),
      high: z.number().optional(),
      text: z.string().optional()
    })
    .optional(),
  flag: zLabFlag.optional()
});

export const zZygosity = z.enum([
  "heterozygous",
  "homozygous",
  "hemizygous",
  "unknown"
] as const);

export const zClinVarSignificance = z.enum([
  "benign",
  "likely_benign",
  "vus",
  "likely_pathogenic",
  "pathogenic",
  "drug_response",
  "other"
] as const);

export const zAcmgClassification = z.enum([
  "benign",
  "likely_benign",
  "vus",
  "likely_pathogenic",
  "pathogenic"
] as const);

export const zAlleleFrequency = z.object({
  source: z.enum(["gnomAD", "1000G", "Other"] as const),
  population: z.string().optional(),
  value: z.number().min(0).max(1)
});

export const zVariantType = z.enum(["SNP", "indel", "CNV", "fusion", "other"] as const);

export const zLiteratureReference = z.object({
  pmid: z.string().optional(),
  title: z.string().min(1),
  journal: z.string().optional(),
  year: z.number().int().optional(),
  url: z.string().url().optional()
});

export const zGeneVariant = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  geneSymbol: z.string().min(1),
  transcriptId: z.string().optional(),
  genomicChange: z.string().min(1),
  codingChange: z.string().min(1),
  proteinChange: z.string().optional(),
  zygosity: zZygosity,
  variantType: zVariantType.optional(),
  clinVarSignificance: zClinVarSignificance.optional(),
  acmgClassification: zAcmgClassification.optional(),
  alleleFrequencies: z.array(zAlleleFrequency).optional(),
  pathogenicityScore: z.number().min(0).max(1).optional(),
  associatedDiseases: z.array(z.string().min(1)).optional(),
  literatureReferences: z.array(zLiteratureReference).optional()
});

export const zAssociatedCondition = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().optional(),
  codeSystem: z.enum(["OMIM", "Orphanet", "ICD-10", "Other"] as const).optional(),
  category: z.enum(["cancer", "cardio", "neuro", "pharmacogenomic", "other"] as const),
  description: z.string().optional()
});

export const zEvidenceLevel = z.enum(["A", "B", "C", "D"] as const);

export const zVariantAnnotation = z.object({
  id: z.string().min(1),
  variantId: z.string().min(1),
  conditionIds: z.array(z.string().min(1)),
  evidenceLevel: zEvidenceLevel,
  guidelineSources: z.array(z.string().min(1)),
  summary: z.string().min(1)
});

export const zDrugGeneInteraction = z.object({
  id: z.string().min(1),
  geneSymbol: z.string().min(1),
  variantPattern: z.string().min(1),
  drugName: z.string().min(1),
  rxNormCode: z.string().optional(),
  effect: z.string().min(1),
  clinicalRecommendation: z.string().min(1),
  evidenceLevel: zEvidenceLevel,
  guidelineSource: z.string().optional()
});

export const zEvidenceBasedRecommendation = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  source: z.string().min(1),
  levelOfEvidence: zEvidenceLevel,
  strengthOfRecommendation: z.enum([
    "strong",
    "moderate",
    "weak",
    "informational"
  ] as const),
  summary: z.string().min(1),
  rationale: z.string().optional(),
  referenceLinks: z.array(z.string().url()).optional()
});

export const zClinicalNoteType = z.enum([
  "consultation",
  "follow_up",
  "tumor_board",
  "treatment_plan",
  "other"
] as const);

export const zClinicalNote = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  noteType: zClinicalNoteType,
  authorRole: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  body: z.string().min(1),
  tags: z.array(z.string().min(1)).optional()
});

export const zTreatmentPlan = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  goals: z.array(z.string().min(1)),
  plannedMedications: z.array(z.string().min(1)),
  genomicConsiderations: z.array(z.string().min(1)).optional(),
  followUpIntervalMonths: z.number().int().positive().optional()
});

export const zRecommendationStatus = z.enum([
  "open",
  "in_progress",
  "completed"
] as const);

export const zFollowUpRecommendation = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  recommendationText: z.string().min(1),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(["low", "medium", "high"] as const),
  status: zRecommendationStatus
});

export const zGenomicFinding = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  variantId: z.string().min(1),
  clinicalSignificance: z.union([
    zClinVarSignificance,
    zAcmgClassification
  ]),
  associatedConditionIds: z.array(z.string().min(1)),
  drugGeneInteractionIds: z.array(z.string().min(1)),
  evidenceRecommendationIds: z.array(z.string().min(1)),
  generatedAt: z.string().datetime()
});

export const zPatientRecord = z.object({
  demographics: zDemographics,
  medicalHistory: z.array(zMedicalCondition),
  currentMedications: z.array(zMedicationOrder),
  labResults: z.array(zLabResult),
  genomic: z.object({
    variants: z.array(zGeneVariant),
    associatedConditions: z.array(zAssociatedCondition),
    variantAnnotations: z.array(zVariantAnnotation),
    drugGeneInteractions: z.array(zDrugGeneInteraction),
    evidenceBasedRecommendations: z.array(zEvidenceBasedRecommendation),
    genomicFindings: z.array(zGenomicFinding)
  }),
  clinicalNotes: z.array(zClinicalNote),
  treatmentPlans: z.array(zTreatmentPlan),
  followUpRecommendations: z.array(zFollowUpRecommendation)
});

export type PatientRecordInput = z.input<typeof zPatientRecord>;

