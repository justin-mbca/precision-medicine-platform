/**
 * Core clinical and genomic data models for the precision medicine platform.
 *
 * These interfaces are designed for MOCK / synthetic datasets only.
 * Do not use real patient identifiers or PHI in development environments.
 */

export type BiologicalSex = "male" | "female" | "intersex" | "unknown";

export type RaceEthnicity =
  | "asian"
  | "black"
  | "white"
  | "hispanic_latino"
  | "native_american"
  | "pacific_islander"
  | "other"
  | "unknown";

/**
 * Demographics intentionally avoid highly identifying elements (e.g. full address).
 */
export interface Demographics {
  patientId: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string; // ISO date only (YYYY-MM-DD)
  sex: BiologicalSex;
  raceEthnicity: RaceEthnicity;
  country: string;
  regionOrState?: string;
}

export type ConditionStatus = "active" | "inactive" | "resolved" | "remission";

export interface MedicalCondition {
  id: string;
  patientId: string;
  code: string; // e.g. ICD-10
  codeSystem: "ICD-10" | "SNOMED-CT" | "Other";
  display: string;
  onsetDate?: string; // ISO datetime
  resolutionDate?: string; // ISO datetime
  status: ConditionStatus;
  notes?: string;
}

export type MedicationRoute =
  | "oral"
  | "iv"
  | "subcutaneous"
  | "intramuscular"
  | "topical"
  | "other";

export interface MedicationOrder {
  id: string;
  patientId: string;
  drugName: string;
  genericName?: string;
  rxNormCode?: string;
  dose: string;
  route: MedicationRoute;
  frequency: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  indication?: string;
}

export type LabFlag = "normal" | "high" | "low" | "critical_high" | "critical_low";

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  loincCode?: string;
  collectedAt: string; // ISO datetime
  value: number | string;
  unit?: string;
  referenceRange?: {
    low?: number;
    high?: number;
    text?: string;
  };
  flag?: LabFlag;
}

/**
 * Genomic data models
 */

export type Zygosity = "heterozygous" | "homozygous" | "hemizygous" | "unknown";

export type ClinVarSignificance =
  | "benign"
  | "likely_benign"
  | "vus"
  | "likely_pathogenic"
  | "pathogenic"
  | "drug_response"
  | "other";

export type AcmgClassification =
  | "benign"
  | "likely_benign"
  | "vus"
  | "likely_pathogenic"
  | "pathogenic";

export interface AlleleFrequency {
  source: "gnomAD" | "1000G" | "Other";
  population?: string; // e.g. "NFE", "AFR"
  value: number; // 0–1
}

export type VariantType = "SNP" | "indel" | "CNV" | "fusion" | "other";

export interface LiteratureReference {
  pmid?: string;
  title: string;
  journal?: string;
  year?: number;
  url?: string;
}

export interface GeneVariant {
  id: string;
  patientId: string;
  geneSymbol: string;
  transcriptId?: string;
  genomicChange: string; // e.g. "chr17:g.43071077_43071078del"
  codingChange: string; // e.g. "c.68_69delAG"
  proteinChange?: string; // e.g. "p.Glu23Valfs"
  zygosity: Zygosity;
  variantType?: VariantType;
  clinVarSignificance?: ClinVarSignificance;
  acmgClassification?: AcmgClassification;
  alleleFrequencies?: AlleleFrequency[];
  pathogenicityScore?: number; // 0–1 combined score
  associatedDiseases?: string[];
  literatureReferences?: LiteratureReference[];
}

export interface AssociatedCondition {
  id: string;
  name: string;
  code?: string; // OMIM, Orphanet, or ICD-10
  codeSystem?: "OMIM" | "Orphanet" | "ICD-10" | "Other";
  category: "cancer" | "cardio" | "neuro" | "pharmacogenomic" | "other";
  description?: string;
}

export type EvidenceLevel =
  | "A" // high-quality evidence, guideline supported
  | "B"
  | "C"
  | "D";

export interface VariantAnnotation {
  id: string;
  variantId: string;
  conditionIds: string[];
  evidenceLevel: EvidenceLevel;
  guidelineSources: string[]; // e.g. "NCCN v3.2024"
  summary: string;
}

export interface DrugGeneInteraction {
  id: string;
  geneSymbol: string;
  variantPattern: string; // e.g. "any pathogenic loss-of-function"
  drugName: string;
  rxNormCode?: string;
  effect: string; // e.g. "decreased clearance"
  clinicalRecommendation: string;
  evidenceLevel: EvidenceLevel;
  guidelineSource?: string; // e.g. "CPIC Guideline for TPMT"
}

export interface EvidenceBasedRecommendation {
  id: string;
  patientId: string;
  source: string; // guideline or publication
  levelOfEvidence: EvidenceLevel;
  strengthOfRecommendation: "strong" | "moderate" | "weak" | "informational";
  summary: string;
  rationale?: string;
  referenceLinks?: string[];
}

/**
 * Clinical documentation
 */

export type ClinicalNoteType =
  | "consultation"
  | "follow_up"
  | "tumor_board"
  | "treatment_plan"
  | "other";

export interface ClinicalNote {
  id: string;
  patientId: string;
  noteType: ClinicalNoteType;
  authorRole: string; // e.g. "medical oncologist"
  createdAt: string;
  updatedAt?: string;
  title: string;
  summary: string;
  body: string;
  tags?: string[];
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  createdAt: string;
  updatedAt?: string;
  goals: string[];
  plannedMedications: string[];
  genomicConsiderations?: string[];
  followUpIntervalMonths?: number;
}

export type RecommendationStatus = "open" | "in_progress" | "completed";

export interface FollowUpRecommendation {
  id: string;
  patientId: string;
  recommendationText: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: RecommendationStatus;
}

/**
 * Integration: genomic findings linked to clinical context.
 */

export interface GenomicFinding {
  id: string;
  patientId: string;
  variantId: string;
  clinicalSignificance: ClinVarSignificance | AcmgClassification;
  associatedConditionIds: string[];
  drugGeneInteractionIds: string[];
  evidenceRecommendationIds: string[];
  generatedAt: string;
}

/**
 * High-level aggregate model for a single patient record.
 */
export interface PatientRecord {
  demographics: Demographics;
  medicalHistory: MedicalCondition[];
  currentMedications: MedicationOrder[];
  labResults: LabResult[];
  genomic: {
    variants: GeneVariant[];
    associatedConditions: AssociatedCondition[];
    variantAnnotations: VariantAnnotation[];
    drugGeneInteractions: DrugGeneInteraction[];
    evidenceBasedRecommendations: EvidenceBasedRecommendation[];
    genomicFindings: GenomicFinding[];
  };
  clinicalNotes: ClinicalNote[];
  treatmentPlans: TreatmentPlan[];
  followUpRecommendations: FollowUpRecommendation[];
}

