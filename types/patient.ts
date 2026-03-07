export type Sex = "male" | "female" | "other";

export interface GenomicVariant {
  id: string;
  gene: string;
  variant: string;
  zygosity: "heterozygous" | "homozygous";
  pathogenicity:
    | "benign"
    | "likely benign"
    | "VUS"
    | "likely pathogenic"
    | "pathogenic";
  clinicalSignificance: string;
}

export interface EMRRecord {
  id: string;
  type: "diagnosis" | "medication" | "lab" | "procedure";
  code: string;
  description: string;
  recordedAt: string; // ISO 8601
  value?: string | number;
  unit?: string;
}

export interface RiskScore {
  id: string;
  name: string;
  score: number; // 0–1 for now
  interpretation: string;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  sex: Sex;
  genomicVariants: GenomicVariant[];
  emr: EMRRecord[];
  riskScores: RiskScore[];
  lastUpdated: string;
}

