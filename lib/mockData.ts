import {
  type PatientRecord,
  type AssociatedCondition,
  type DrugGeneInteraction,
  type GeneVariant,
  type EvidenceBasedRecommendation,
  type ClinicalNote,
  type TreatmentPlan,
  type FollowUpRecommendation,
  type LabResult,
  type MedicalCondition,
  type MedicationOrder
} from "@/types/medical";
import { zPatientRecord } from "@/lib/validation/medicalSchemas";

/**
 * Helper to create ISO timestamps relative to "now" without depending on real PHI dates.
 */
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Synthetic but clinically plausible genomic variants.
 */
function createGenomicVariants(patientId: string): GeneVariant[] {
  return [
    {
      id: `${patientId}-var-brca1`,
      patientId,
      geneSymbol: "BRCA1",
      transcriptId: "NM_007294.4",
      genomicChange: "chr17:g.43071077_43071078del",
      codingChange: "c.68_69delAG",
      proteinChange: "p.Glu23Valfs",
      zygosity: "heterozygous",
      variantType: "indel",
      clinVarSignificance: "pathogenic",
      acmgClassification: "pathogenic",
      alleleFrequencies: [
        {
          source: "gnomAD",
          population: "NFE",
          value: 0.00012
        }
      ],
      pathogenicityScore: 0.95,
      associatedDiseases: [
        "Hereditary breast and ovarian cancer syndrome",
        "Breast cancer",
        "Ovarian cancer"
      ],
      literatureReferences: [
        {
          pmid: "20301425",
          title: "BRCA1 c.68_69delAG (185delAG) is a founder mutation in the Ashkenazi Jewish population",
          journal: "Am J Hum Genet",
          year: 2010,
          url: "https://pubmed.ncbi.nlm.nih.gov/20301425/"
        },
        {
          pmid: "25614872",
          title: "NCCN Guidelines: Genetic/Familial High-Risk Assessment: Breast, Ovarian, and Pancreatic",
          journal: "J Natl Compr Canc Netw",
          year: 2020
        }
      ]
    },
    {
      id: `${patientId}-var-apoe`,
      patientId,
      geneSymbol: "APOE",
      transcriptId: "NM_000041.3",
      genomicChange: "chr19:g.45411941T>C",
      codingChange: "c.388T>C",
      proteinChange: "p.Cys130Arg (e4)",
      zygosity: "homozygous",
      variantType: "SNP",
      clinVarSignificance: "other",
      acmgClassification: "vus",
      alleleFrequencies: [
        {
          source: "gnomAD",
          population: "EUR",
          value: 0.14
        }
      ],
      pathogenicityScore: 0.5,
      associatedDiseases: [
        "Late-onset Alzheimer disease",
        "Cardiovascular disease risk modifier"
      ],
      literatureReferences: [
        {
          pmid: "23485494",
          title: "APOE ε4: the most prevalent genetic risk factor for Alzheimer disease",
          journal: "Nat Rev Neurol",
          year: 2013,
          url: "https://pubmed.ncbi.nlm.nih.gov/23485494/"
        }
      ]
    },
    {
      id: `${patientId}-var-tpmt`,
      patientId,
      geneSymbol: "TPMT",
      transcriptId: "NM_000367.6",
      genomicChange: "chr6:g.18139228A>G",
      codingChange: "c.238G>C",
      proteinChange: "p.Ala80Pro",
      zygosity: "heterozygous",
      variantType: "SNP",
      clinVarSignificance: "drug_response",
      acmgClassification: "likely_pathogenic",
      alleleFrequencies: [
        {
          source: "gnomAD",
          population: "NFE",
          value: 0.031
        }
      ],
      pathogenicityScore: 0.72,
      associatedDiseases: [
        "Thiopurine-induced myelosuppression",
        "Azathioprine/6-MP toxicity"
      ],
      literatureReferences: [
        {
          pmid: "21205996",
          title: "Clinical Pharmacogenetics Implementation Consortium guideline for thiopurine methyltransferase genotype",
          journal: "Clin Pharmacol Ther",
          year: 2011,
          url: "https://pubmed.ncbi.nlm.nih.gov/21205996/"
        }
      ]
    }
  ];
}

function createAssociatedConditions(): AssociatedCondition[] {
  return [
    {
      id: "cond-breast-cancer",
      name: "Hereditary breast and ovarian cancer syndrome",
      code: "C50.9",
      codeSystem: "ICD-10",
      category: "cancer",
      description:
        "Increased lifetime risk of breast and ovarian cancer associated with pathogenic BRCA1/2 variants."
    },
    {
      id: "cond-alzheimer",
      name: "Late-onset Alzheimer disease risk",
      code: "G30.1",
      codeSystem: "ICD-10",
      category: "neuro",
      description: "Increased risk of late-onset Alzheimer disease."
    }
  ];
}

function createDrugGeneInteractions(): DrugGeneInteraction[] {
  return [
    {
      id: "dgi-parp-brca1",
      geneSymbol: "BRCA1",
      variantPattern: "any pathogenic loss-of-function",
      drugName: "Olaparib",
      rxNormCode: "1801280",
      effect: "Increased sensitivity to PARP inhibition",
      clinicalRecommendation:
        "Consider PARP inhibitor therapy in appropriate oncologic context per NCCN guidelines.",
      evidenceLevel: "A",
      guidelineSource: "NCCN Breast Cancer Guidelines v3.2024"
    },
    {
      id: "dgi-apoe-statins",
      geneSymbol: "APOE",
      variantPattern: "e4/e4",
      drugName: "Atorvastatin",
      rxNormCode: "83367",
      effect: "Potentially altered lipid-lowering response",
      clinicalRecommendation:
        "Monitor LDL response closely; may require dose adjustment to achieve guideline targets.",
      evidenceLevel: "B",
      guidelineSource: "Expert consensus, observational studies"
    }
  ];
}

function createEvidenceRecommendations(patientId: string): EvidenceBasedRecommendation[] {
  return [
    {
      id: `${patientId}-rec-brca1-surveillance`,
      patientId,
      source: "NCCN Breast Cancer Risk Reduction Guidelines v3.2024",
      levelOfEvidence: "A",
      strengthOfRecommendation: "strong",
      summary:
        "Enhanced breast cancer surveillance with annual MRI and mammography starting at age 30–35.",
      rationale:
        "Pathogenic BRCA1 variant confers substantially increased lifetime risk of breast cancer.",
      referenceLinks: ["https://www.nccn.org"]
    },
    {
      id: `${patientId}-rec-lifestyle-cv`,
      patientId,
      source: "ACC/AHA Primary Prevention Guidelines",
      levelOfEvidence: "B",
      strengthOfRecommendation: "moderate",
      summary:
        "Aggressive management of cardiovascular risk factors given elevated polygenic and APOE-related risk.",
      rationale:
        "Combined genomic and clinical risk suggests benefit from tighter lipid and blood pressure control.",
      referenceLinks: ["https://www.acc.org"]
    }
  ];
}

function createMedicalHistory(patientId: string): MedicalCondition[] {
  return [
    {
      id: `${patientId}-hx-breast`,
      patientId,
      code: "C50.9",
      codeSystem: "ICD-10",
      display: "Malignant neoplasm of breast, unspecified",
      onsetDate: daysAgo(380),
      status: "active",
      notes: "Diagnosed after abnormal screening mammogram; BRCA1-positive."
    },
    {
      id: `${patientId}-hx-htn`,
      patientId,
      code: "I10",
      codeSystem: "ICD-10",
      display: "Essential (primary) hypertension",
      onsetDate: daysAgo(3650),
      status: "active"
    }
  ];
}

function createMedications(patientId: string): MedicationOrder[] {
  return [
    {
      id: `${patientId}-med-atorvastatin`,
      patientId,
      drugName: "Atorvastatin 40 mg tablet",
      genericName: "atorvastatin",
      rxNormCode: "617318",
      dose: "40 mg",
      route: "oral",
      frequency: "once daily",
      startDate: daysAgo(730),
      isCurrent: true,
      indication: "Hyperlipidemia"
    },
    {
      id: `${patientId}-med-olaparib`,
      patientId,
      drugName: "Olaparib 300 mg tablet",
      genericName: "olaparib",
      rxNormCode: "1801280",
      dose: "300 mg",
      route: "oral",
      frequency: "twice daily",
      startDate: daysAgo(120),
      isCurrent: true,
      indication: "BRCA1-positive breast cancer"
    }
  ];
}

function createLabs(patientId: string): LabResult[] {
  return [
    {
      id: `${patientId}-lab-ldl`,
      patientId,
      testName: "LDL cholesterol",
      loincCode: "2089-1",
      collectedAt: daysAgo(14),
      value: 82,
      unit: "mg/dL",
      referenceRange: {
        high: 130
      },
      flag: "normal"
    },
    {
      id: `${patientId}-lab-ca125`,
      patientId,
      testName: "CA-125",
      loincCode: "10334-1",
      collectedAt: daysAgo(30),
      value: 18,
      unit: "U/mL",
      referenceRange: {
        high: 35
      },
      flag: "normal"
    }
  ];
}

function createClinicalNotes(patientId: string): ClinicalNote[] {
  return [
    {
      id: `${patientId}-note-consult`,
      patientId,
      noteType: "consultation",
      authorRole: "medical oncologist",
      createdAt: daysAgo(120),
      title: "Initial oncology consultation",
      summary:
        "Discussed BRCA1-positive breast cancer diagnosis and treatment options.",
      body:
        "Patient presents with early-stage BRCA1-positive breast cancer. " +
        "Reviewed surgical options, systemic therapy, and role of PARP inhibitors. " +
        "Strong family history of breast cancer on maternal side.",
      tags: ["oncology", "genetics"]
    },
    {
      id: `${patientId}-note-plan`,
      patientId,
      noteType: "treatment_plan",
      authorRole: "medical oncologist",
      createdAt: daysAgo(110),
      updatedAt: daysAgo(30),
      title: "Updated treatment plan with PARP inhibitor",
      summary: "Initiated PARP inhibitor based on BRCA1 variant and NCCN guidance.",
      body:
        "Given pathogenic BRCA1 variant and high risk of recurrence, initiated olaparib " +
        "as adjuvant therapy consistent with NCCN guidelines. Monitored labs and tolerance.",
      tags: ["treatment-plan", "parp-inhibitor"]
    }
  ];
}

function createTreatmentPlans(patientId: string): TreatmentPlan[] {
  return [
    {
      id: `${patientId}-tp-1`,
      patientId,
      createdAt: daysAgo(110),
      updatedAt: daysAgo(30),
      goals: [
        "Reduce risk of breast cancer recurrence",
        "Optimize cardiovascular risk profile"
      ],
      plannedMedications: ["Olaparib", "Atorvastatin"],
      genomicConsiderations: [
        "Pathogenic BRCA1 variant supports PARP inhibitor therapy",
        "APOE e4/e4 genotype supports aggressive lipid management"
      ],
      followUpIntervalMonths: 3
    }
  ];
}

function createFollowUps(patientId: string): FollowUpRecommendation[] {
  return [
    {
      id: `${patientId}-fu-mri`,
      patientId,
      recommendationText:
        "Schedule annual breast MRI and mammography per high-risk screening protocol.",
      dueDate: daysAgo(-200), // future date
      priority: "high",
      status: "open"
    },
    {
      id: `${patientId}-fu-lipids`,
      patientId,
      recommendationText:
        "Repeat fasting lipid panel and assess statin response in 6 months.",
      dueDate: daysAgo(-180),
      priority: "medium",
      status: "open"
    }
  ];
}

/**
 * Create a fully-populated synthetic patient record.
 */
export function createSamplePatientRecord(patientId: string): PatientRecord {
  const demographics: PatientRecord["demographics"] = {
    patientId,
    givenName: "Alice",
    familyName: "Nguyen",
    dateOfBirth: "1985-03-12",
    sex: "female",
    raceEthnicity: "asian",
    country: "USA",
    regionOrState: "CA"
  };

  const conditions = createMedicalHistory(patientId);
  const meds = createMedications(patientId);
  const labs = createLabs(patientId);
  const variants = createGenomicVariants(patientId);
  const associatedConditions = createAssociatedConditions();
  const dgis = createDrugGeneInteractions();
  const recs = createEvidenceRecommendations(patientId);
  const notes = createClinicalNotes(patientId);
  const plans = createTreatmentPlans(patientId);
  const followUps = createFollowUps(patientId);

  const genomicFindings = variants.map((variant, idx) => ({
    id: `${patientId}-finding-${idx + 1}`,
    patientId,
    variantId: variant.id,
    clinicalSignificance:
      variant.acmgClassification ?? variant.clinVarSignificance ?? "vus",
    associatedConditionIds:
      variant.geneSymbol === "BRCA1"
        ? ["cond-breast-cancer"]
        : ["cond-alzheimer"],
    drugGeneInteractionIds:
      variant.geneSymbol === "BRCA1"
        ? ["dgi-parp-brca1"]
        : ["dgi-apoe-statins"],
    evidenceRecommendationIds: recs.map((r) => r.id),
    generatedAt: daysAgo(30)
  }));

  const record: PatientRecord = {
    demographics,
    medicalHistory: conditions,
    currentMedications: meds,
    labResults: labs,
    genomic: {
      variants,
      associatedConditions,
      variantAnnotations: [
        {
          id: `${patientId}-ann-brca1`,
          variantId: `${patientId}-var-brca1`,
          conditionIds: ["cond-breast-cancer"],
          evidenceLevel: "A",
          guidelineSources: ["NCCN Breast Cancer Guidelines v3.2024"],
          summary:
            "Pathogenic BRCA1 frameshift variant associated with high lifetime risk of breast and ovarian cancer."
        }
      ],
      drugGeneInteractions: dgis,
      evidenceBasedRecommendations: recs,
      genomicFindings
    },
    clinicalNotes: notes,
    treatmentPlans: plans,
    followUpRecommendations: followUps
  };

  // Validate in development to catch schema drift.
  if (process.env.NODE_ENV !== "production") {
    zPatientRecord.parse(record);
  }

  return record;
}

/**
 * Returns a small panel of sample patients for UI development and testing.
 */
export function createSamplePatients(): PatientRecord[] {
  const primary = createSamplePatientRecord("p-brca1-001");

  // Derive a second patient by tweaking key fields to demonstrate variability.
  const secondary: PatientRecord = {
    ...primary,
    demographics: {
      ...primary.demographics,
      patientId: "p-cardio-002",
      givenName: "David",
      familyName: "Patel",
      dateOfBirth: "1973-08-22",
      sex: "male",
      raceEthnicity: "south_asian" as any // will still validate as "other"/"unknown" if adjusted
    },
    medicalHistory: primary.medicalHistory.map((cond) => ({
      ...cond,
      patientId: "p-cardio-002"
    })),
    currentMedications: primary.currentMedications.map((med) => ({
      ...med,
      patientId: "p-cardio-002"
    })),
    labResults: primary.labResults.map((lab) => ({
      ...lab,
      patientId: "p-cardio-002"
    })),
    genomic: {
      ...primary.genomic,
      variants: primary.genomic.variants.map((v) => ({
        ...v,
        patientId: "p-cardio-002",
        id: v.id.replace("p-brca1-001", "p-cardio-002")
      })),
      evidenceBasedRecommendations: primary.genomic.evidenceBasedRecommendations.map(
        (r) => ({
          ...r,
          patientId: "p-cardio-002",
          id: r.id.replace("p-brca1-001", "p-cardio-002")
        })
      ),
      genomicFindings: primary.genomic.genomicFindings.map((f) => ({
        ...f,
        patientId: "p-cardio-002",
        id: f.id.replace("p-brca1-001", "p-cardio-002"),
        variantId: f.variantId.replace("p-brca1-001", "p-cardio-002")
      }))
    },
    clinicalNotes: primary.clinicalNotes.map((n) => ({
      ...n,
      patientId: "p-cardio-002",
      id: n.id.replace("p-brca1-001", "p-cardio-002")
    })),
    treatmentPlans: primary.treatmentPlans.map((tp) => ({
      ...tp,
      patientId: "p-cardio-002",
      id: tp.id.replace("p-brca1-001", "p-cardio-002")
    })),
    followUpRecommendations: primary.followUpRecommendations.map((fu) => ({
      ...fu,
      patientId: "p-cardio-002",
      id: fu.id.replace("p-brca1-001", "p-cardio-002")
    }))
  };

  return [primary, secondary];
}

