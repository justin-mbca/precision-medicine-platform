/**
 * Synoptic dashboard types for the precision medicine platform.
 * 14 health dimensions with green/yellow/red status for quick assessment.
 */

export type DimensionStatus = "green" | "yellow" | "red";

export type HealthDimensionId =
  | "cardiovascular"
  | "metabolic"
  | "cancer_risk"
  | "neurological"
  | "immune"
  | "renal"
  | "hepatic"
  | "respiratory"
  | "hematologic"
  | "endocrine"
  | "gastrointestinal"
  | "musculoskeletal"
  | "dermatologic"
  | "mental_health";

export interface HealthDimensionMeta {
  id: HealthDimensionId;
  label: string;
  shortLabel: string;
  description: string;
  helpText: string;
}

export interface DimensionContributor {
  label: string;
  impact: number; // 0–1
  status: DimensionStatus;
  source: "genomic" | "condition" | "lab" | "medication";
}

export interface HealthDimensionScore {
  dimensionId: HealthDimensionId;
  status: DimensionStatus;
  score: number; // 0–1, higher = more concern
  summary: string;
  contributors: DimensionContributor[];
  genomicFindings: string[];
  aiRecommendation?: string;
  lastUpdated: string;
}

export interface DimensionInsight {
  text: string;
  recommendation?: string;
}

/** Label lookup for dimension IDs */
export const DIMENSION_LABELS: Record<HealthDimensionId, string> = {
  cardiovascular: "Cardiovascular Health",
  metabolic: "Metabolic Function",
  cancer_risk: "Cancer Risk",
  neurological: "Neurological Health",
  immune: "Immune Function",
  renal: "Renal Function",
  hepatic: "Hepatic Function",
  respiratory: "Respiratory Health",
  hematologic: "Hematologic Function",
  endocrine: "Endocrine Function",
  gastrointestinal: "Gastrointestinal Health",
  musculoskeletal: "Musculoskeletal Health",
  dermatologic: "Dermatologic Health",
  mental_health: "Mental Health"
};

export const STATUS_COLORS: Record<DimensionStatus, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444"
};

export function getStatusColor(status: DimensionStatus): {
  bg: string;
  border: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case "green":
      return {
        bg: "bg-emerald-500",
        border: "border-emerald-200",
        text: "text-emerald-700",
        dot: "bg-emerald-500"
      };
    case "yellow":
      return {
        bg: "bg-amber-500",
        border: "border-amber-200",
        text: "text-amber-700",
        dot: "bg-amber-500"
      };
    case "red":
      return {
        bg: "bg-red-500",
        border: "border-red-200",
        text: "text-red-700",
        dot: "bg-red-500"
      };
  }
}

export interface DimensionDrillDownData {
  dimension: HealthDimensionMeta;
  score: HealthDimensionScore;
  trendData: { date: string; value: number }[];
  relatedConditions: { name: string; status: string; code?: string }[];
  relatedLabs: { name: string; value: string; unit?: string; flag?: string; date: string }[];
  relatedVariants: { gene: string; variant: string; significance: string }[];
  citations: { title: string; source: string; year?: number }[];
}

export const HEALTH_DIMENSIONS: HealthDimensionMeta[] = [
  {
    id: "cardiovascular",
    label: "Cardiovascular Health",
    shortLabel: "Cardio",
    description: "Heart and vascular health, blood pressure, lipid profile",
    helpText: "Integrates hypertension, LDL/HDL, APOE genotype, and cardiac history."
  },
  {
    id: "metabolic",
    label: "Metabolic Function",
    shortLabel: "Metabolic",
    description: "Glucose, insulin resistance, metabolic syndrome markers",
    helpText: "Includes HbA1c, fasting glucose, BMI-related factors."
  },
  {
    id: "cancer_risk",
    label: "Cancer Risk",
    shortLabel: "Cancer",
    description: "Hereditary cancer syndromes, tumor markers, surveillance",
    helpText: "BRCA1/2, Lynch syndrome, polygenic risk, and tumor markers."
  },
  {
    id: "neurological",
    label: "Neurological Health",
    shortLabel: "Neuro",
    description: "Cognitive risk, Alzheimer disease, stroke risk",
    helpText: "APOE genotype, cognitive screening, neurological history."
  },
  {
    id: "immune",
    label: "Immune Function",
    shortLabel: "Immune",
    description: "Immunocompetence, autoimmune markers, infection risk",
    helpText: "WBC, inflammatory markers, immunosuppression status."
  },
  {
    id: "renal",
    label: "Renal Function",
    shortLabel: "Renal",
    description: "Kidney function, eGFR, proteinuria",
    helpText: "eGFR, creatinine, BUN, albuminuria."
  },
  {
    id: "hepatic",
    label: "Hepatic Function",
    shortLabel: "Hepatic",
    description: "Liver enzymes, synthetic function",
    helpText: "ALT, AST, bilirubin, albumin."
  },
  {
    id: "respiratory",
    label: "Respiratory Health",
    shortLabel: "Respiratory",
    description: "Lung function, oxygenation, chronic lung disease",
    helpText: "SpO2, spirometry, COPD/asthma history."
  },
  {
    id: "hematologic",
    label: "Hematologic Function",
    shortLabel: "Hematologic",
    description: "Blood counts, coagulation, anemia",
    helpText: "CBC, hemoglobin, platelets, coagulation studies."
  },
  {
    id: "endocrine",
    label: "Endocrine Function",
    shortLabel: "Endocrine",
    description: "Thyroid, adrenal, bone metabolism",
    helpText: "TSH, calcium, vitamin D, bone markers."
  },
  {
    id: "gastrointestinal",
    label: "Gastrointestinal Health",
    shortLabel: "GI",
    description: "Digestive function, GI cancer risk",
    helpText: "Colonoscopy history, Lynch risk, GI symptoms."
  },
  {
    id: "musculoskeletal",
    label: "Musculoskeletal Health",
    shortLabel: "MSK",
    description: "Bone density, arthritis, mobility",
    helpText: "DEXA, fracture history, joint function."
  },
  {
    id: "dermatologic",
    label: "Dermatologic Health",
    shortLabel: "Derm",
    description: "Skin cancer risk, dermatologic conditions",
    helpText: "Melanoma risk, BCC/SCC history, skin exams."
  },
  {
    id: "mental_health",
    label: "Mental Health",
    shortLabel: "Mental",
    description: "Depression, anxiety, psychosocial factors",
    helpText: "PHQ-9, GAD-7, substance use, social determinants."
  }
];
