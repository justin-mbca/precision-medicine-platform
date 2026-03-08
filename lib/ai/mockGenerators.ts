/**
 * Mock response generators used when USE_MOCK_AI=true.
 */

import type { GeneVariant } from "@/types/medical";
import type { RecommendationWithEvidence } from "@/types/assistant";
import { detectQueryType } from "@/lib/ai/clinicalPrompts";

export function generateMockVariantInterpretation(variant: GeneVariant): string {
  const sig =
    variant.acmgClassification ?? variant.clinVarSignificance ?? "unknown";
  const gene = variant.geneSymbol;

  if (gene === "BRCA1" && sig === "pathogenic") {
    return `This pathogenic BRCA1 frameshift variant (${variant.codingChange}) results in a truncated, nonfunctional protein and is a well-established cause of hereditary breast and ovarian cancer syndrome. Carriers have substantially elevated lifetime risks of breast and ovarian cancer. Clinical implications: recommend enhanced surveillance (annual MRI + mammography from age 30–35), discussion of risk-reducing surgery, and consider PARP inhibitor eligibility if cancer develops. Genetic counseling for at-risk relatives is indicated.`;
  }
  if (gene === "APOE" && variant.proteinChange?.includes("e4")) {
    return `The APOE ε4 allele (${variant.codingChange}) is associated with increased risk of late-onset Alzheimer disease and may modify cardiovascular risk. Homozygous ε4/ε4 confers higher risk than heterozygous. Clinical implications: no disease-modifying interventions are currently evidence-based for prevention; focus on cardiovascular risk factor optimization. Consider cognitive screening in appropriate clinical context. Avoid over-interpretation in asymptomatic individuals.`;
  }
  if (gene === "TPMT") {
    return `This TPMT variant (${variant.codingChange}) is associated with reduced thiopurine methyltransferase activity and increased risk of myelosuppression with azathioprine or 6-mercaptopurine. Clinical implications: consider preemptive genotyping before initiating thiopurines; reduce starting dose or use alternative therapy per CPIC guidelines. Monitor blood counts closely if thiopurines are used.`;
  }

  return `The ${variant.geneSymbol} variant ${variant.codingChange} (${sig}) may have clinical significance. Interpret in the context of the patient's phenotype and family history. Consider referral to a genetics specialist for comprehensive evaluation.`;
}

export interface MockChatResponse {
  reasoning: string;
  answer: string;
  confidence: number;
  recommendations: RecommendationWithEvidence[];
}

export function getMockChatResponse(
  lastMessage: string,
  queryType: ReturnType<typeof detectQueryType>
): MockChatResponse {
  const lower = lastMessage.toLowerCase();

  if (
    queryType === "drug_interaction" ||
    lower.includes("olaparib") ||
    lower.includes("atorvastatin") ||
    lower.includes("tpmt")
  ) {
    return {
      reasoning:
        "Reviewed current medications (Olaparib, Atorvastatin) and genomic variants (BRCA1 pathogenic, APOE e4/e4, TPMT). Matched against drug-gene interaction database and CPIC/NCCN sources.",
      answer:
        "**Drug-gene summary:** (1) **Olaparib** — Indicated given pathogenic BRCA1; NCCN supports PARP inhibitor use in this setting. (2) **Atorvastatin** — APOE e4/e4 may be associated with attenuated LDL response; consider monitoring lipids and titrating to goal. (3) No TPMT variants in this panel affect current thiopurine use; if azathioprine/6-MP is considered, preemptive TPMT genotyping is recommended.",
      confidence: 0.85,
      recommendations: [
        {
          id: "rec-1",
          title: "Olaparib and BRCA1",
          status: "green",
          summary: "PARP inhibitor appropriate; continue per oncology plan.",
          confidence: 0.9,
          dimension: "Drug-gene",
          citations: [
            {
              id: "c1",
              title: "NCCN Breast Cancer Guidelines",
              source: "NCCN v3.2024",
              year: 2024
            }
          ]
        },
        {
          id: "rec-2",
          title: "Atorvastatin and APOE",
          status: "yellow",
          summary: "Monitor LDL and consider dose titration to meet guideline targets.",
          confidence: 0.75,
          dimension: "Drug-gene",
          citations: [
            {
              id: "c2",
              title: "APOE and statin response",
              source: "Expert consensus / observational data",
              year: 2020
            }
          ]
        }
      ]
    };
  }

  if (queryType === "risk_assessment" || lower.includes("risk") || lower.includes("brca")) {
    return {
      reasoning:
        "Evaluated pathogenic BRCA1 variant, family history context, and current conditions. Applied NCCN risk categories for breast/ovarian cancer.",
      answer:
        "**Risk summary:** This patient has **elevated** lifetime risk for breast and ovarian cancer due to pathogenic BRCA1. Cardiovascular risk is **moderate** (hypertension, APOE e4/e4). Alzheimer disease risk is **elevated** with APOE e4/e4. Recommend enhanced breast surveillance (MRI + mammography from age 30–35), cardiovascular risk factor optimization, and cognitive screening when clinically indicated.",
      confidence: 0.88,
      recommendations: [
        {
          id: "rec-3",
          title: "Breast/ovarian cancer risk",
          status: "red",
          summary: "High risk; ensure enhanced surveillance and risk-reduction discussion.",
          confidence: 0.95,
          dimension: "Cancer risk",
          citations: [
            {
              id: "c3",
              title: "NCCN Genetic/Familial High-Risk Assessment",
              source: "NCCN",
              year: 2024
            }
          ]
        },
        {
          id: "rec-4",
          title: "Cardiovascular risk",
          status: "yellow",
          summary: "Moderate; optimize BP and lipids per guidelines.",
          confidence: 0.8,
          dimension: "Cardiovascular",
          citations: []
        }
      ]
    };
  }

  if (queryType === "treatment_options" || lower.includes("treatment") || lower.includes("parp")) {
    return {
      reasoning:
        "Considered current treatment plan (Olaparib, Atorvastatin), BRCA1 status, and NCCN/evidence-based recommendations.",
      answer:
        "**Treatment context:** Patient is already on **olaparib** (PARP inhibitor), which is evidence-based for BRCA1-associated breast cancer. **Atorvastatin** is appropriate for lipid management; consider repeating lipids to assess response. No change to current regimen is required based on genomics; continue enhanced surveillance and follow-up per oncology and primary care plans.",
      confidence: 0.82,
      recommendations: [
        {
          id: "rec-5",
          title: "PARP inhibitor therapy",
          status: "green",
          summary: "Current olaparib use is aligned with NCCN guidelines for BRCA1 carriers.",
          confidence: 0.9,
          dimension: "Oncology",
          citations: [
            {
              id: "c4",
              title: "NCCN Breast Cancer Guidelines",
              source: "NCCN v3.2024",
              year: 2024
            }
          ]
        }
      ]
    };
  }

  return {
    reasoning:
      "Synthesized patient context with guideline and literature references on file.",
    answer:
      "Based on the patient's genomic and clinical profile, key evidence supports: (1) **NCCN guidelines** for BRCA1 carriers—enhanced surveillance and PARP eligibility. (2) **CPIC** for TPMT if thiopurines are considered. (3) **APOE** and cardiovascular/cognitive risk from observational studies. I can go deeper on drug interactions, risk quantification, or treatment options if you specify.",
    confidence: 0.78,
    recommendations: []
  };
}
