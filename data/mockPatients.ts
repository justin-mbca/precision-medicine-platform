import type { Patient } from "@/types/patient";

export const mockPatients: Patient[] = [
  {
    id: "p1",
    mrn: "MRN-001",
    firstName: "Alice",
    lastName: "Nguyen",
    dob: "1985-03-12",
    sex: "female",
    genomicVariants: [
      {
        id: "v1",
        gene: "BRCA1",
        variant: "c.68_69delAG",
        zygosity: "heterozygous",
        pathogenicity: "pathogenic",
        clinicalSignificance:
          "Associated with increased risk of breast and ovarian cancer"
      }
    ],
    emr: [
      {
        id: "e1",
        type: "diagnosis",
        code: "C50.9",
        description: "Malignant neoplasm of breast, unspecified",
        recordedAt: "2024-01-05T10:00:00Z"
      },
      {
        id: "e2",
        type: "lab",
        code: "LDL",
        description: "LDL cholesterol",
        recordedAt: "2024-01-10T09:30:00Z",
        value: 142,
        unit: "mg/dL"
      }
    ],
    riskScores: [
      {
        id: "r1",
        name: "Breast cancer polygenic risk",
        score: 0.82,
        interpretation: "High genomic risk; consider enhanced surveillance"
      }
    ],
    lastUpdated: "2024-01-15T12:00:00Z"
  },
  {
    id: "p2",
    mrn: "MRN-002",
    firstName: "David",
    lastName: "Patel",
    dob: "1973-08-22",
    sex: "male",
    genomicVariants: [
      {
        id: "v2",
        gene: "APOE",
        variant: "e4/e4",
        zygosity: "homozygous",
        pathogenicity: "VUS",
        clinicalSignificance:
          "Associated with increased Alzheimer’s disease risk"
      }
    ],
    emr: [
      {
        id: "e3",
        type: "diagnosis",
        code: "I10",
        description: "Essential (primary) hypertension",
        recordedAt: "2023-11-01T14:20:00Z"
      }
    ],
    riskScores: [
      {
        id: "r2",
        name: "Cardiovascular risk (10-year)",
        score: 0.34,
        interpretation: "Moderate risk; optimize lifestyle and medications"
      }
    ],
    lastUpdated: "2024-02-01T08:15:00Z"
  }
];

