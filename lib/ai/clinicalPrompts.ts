/**
 * Prompt templates for the Virtual Colleague clinical decision support assistant.
 * Designed for OpenAI/Claude-style APIs; used with mock responses when no API key is set.
 */

import type { PatientRecord } from "@/types/medical";

const SYSTEM_PROMPT = `You are a Virtual Colleague: an AI clinical decision support assistant for precision medicine. You help clinicians by:
- Analyzing patient genomic and clinical data to provide evidence-based insights
- Answering questions about drug-gene interactions, disease risk, treatment options, and literature
- Providing recommendations with clear green/yellow/red status (green=favorable/safe, yellow=caution, red=concern/action needed)
- Citing guidelines and literature (NCCN, CPIC, etc.) where applicable
- Stating your confidence level and reasoning clearly

You respond in plain language suitable for a busy clinician. You do not make definitive diagnoses or replace clinical judgment. When uncertain, you say so and suggest next steps (e.g., genetics referral).`;

export const DRUG_INTERACTION_PROMPT = `The clinician is asking about drug-gene or drug-disease interactions. Use the patient's current medications, genomic variants (especially pharmacogenomic genes like TPMT, CYP2C19, etc.), and any drug-gene interaction data in the context.

Respond with:
1. A brief direct answer
2. Any relevant drug-gene interactions for this patient with green/yellow/red status
3. Specific recommendations (dose adjustment, alternative drug, monitoring) with citations
4. Your confidence (high/medium/low) and reasoning.`;

export const RISK_ASSESSMENT_PROMPT = `The clinician is asking about disease or risk assessment. Use the patient's genomic variants, family history (if noted), conditions, and risk scores in the context.

Respond with:
1. A concise risk summary (e.g., elevated/standard for specific conditions)
2. Key genomic and clinical drivers
3. Recommendations with green/yellow/red status (e.g., green=standard surveillance, yellow=enhanced monitoring, red=consider intervention or referral)
4. Citations and confidence.`;

export const TREATMENT_OPTIONS_PROMPT = `The clinician is asking about treatment options or personalized treatment. Use the patient's conditions, medications, genomic findings (e.g., BRCA and PARP inhibitors), and evidence-based recommendations in the context.

Respond with:
1. Options relevant to the patient's profile
2. Genomic considerations (e.g., PARP eligibility, TPMT-based dosing)
3. Recommendations with green/yellow/red status and citations
4. Confidence and reasoning.`;

export const LITERATURE_SYNTHESIS_PROMPT = `The clinician is asking for literature or evidence synthesis. Use any literature references, guideline sources, and variant annotations in the context.

Respond with:
1. A synthesized answer with key evidence
2. Citations (guideline name, PMID when available)
3. How it applies to this patient
4. Confidence and limitations.`;

export const GENERAL_PROMPT = `Answer the clinician's question using the patient context provided. Where relevant, include:
- Evidence-based recommendations with green/yellow/red status
- Citations to guidelines or literature
- Your confidence and brief reasoning.`;

/** Build a compact text summary of the patient record for inclusion in the prompt. */
export function buildPatientContextSummary(record: PatientRecord | null): string {
  if (!record) return "No specific patient selected. Answer in general terms.";

  const d = record.demographics;
  const lines: string[] = [
    `Patient: ${d.givenName} ${d.familyName} (ID ${d.patientId}), DOB ${d.dateOfBirth}, ${d.sex}.`,
    "",
    "Conditions:",
    ...record.medicalHistory.map(
      (c) => `- ${c.display} (${c.code}, ${c.status})`
    ),
    "",
    "Current medications:",
    ...record.currentMedications
      .filter((m) => m.isCurrent)
      .map((m) => `- ${m.drugName}, ${m.dose} ${m.route} ${m.frequency}`),
    "",
    "Genomic variants:",
    ...record.genomic.variants.map(
      (v) =>
        `- ${v.geneSymbol} ${v.codingChange} (${v.acmgClassification ?? v.clinVarSignificance ?? "?"}) ${v.zygosity}`
    ),
    "",
    "Drug-gene interactions (from context):",
    ...record.genomic.drugGeneInteractions.map(
      (dgi) =>
        `- ${dgi.geneSymbol}: ${dgi.drugName} — ${dgi.clinicalRecommendation} (${dgi.guidelineSource ?? "—"})`
    ),
    "",
    "Evidence-based recommendations on file:",
    ...record.genomic.evidenceBasedRecommendations.map(
      (r) => `- [${r.levelOfEvidence}] ${r.summary} (${r.source})`
    )
  ];

  return lines.join("\n");
}

/** Detect query type from user message for routing to the right template. */
export function detectQueryType(message: string): keyof typeof QUERY_PROMPTS {
  const lower = message.toLowerCase();
  if (
    lower.includes("drug") ||
    lower.includes("interaction") ||
    lower.includes("medication") ||
    lower.includes("dose") ||
    lower.includes("tpmt") ||
    lower.includes("cyp")
  )
    return "drug_interaction";
  if (
    lower.includes("risk") ||
    lower.includes("probability") ||
    lower.includes("likely") ||
    lower.includes("brca") ||
    lower.includes("cancer risk")
  )
    return "risk_assessment";
  if (
    lower.includes("treatment") ||
    lower.includes("therapy") ||
    lower.includes("option") ||
    lower.includes("parp") ||
    lower.includes("recommend")
  )
    return "treatment_options";
  if (
    lower.includes("literature") ||
    lower.includes("evidence") ||
    lower.includes("study") ||
    lower.includes("guideline") ||
    lower.includes("citation")
  )
    return "literature";
  return "general";
}

export const QUERY_PROMPTS = {
  drug_interaction: DRUG_INTERACTION_PROMPT,
  risk_assessment: RISK_ASSESSMENT_PROMPT,
  treatment_options: TREATMENT_OPTIONS_PROMPT,
  literature: LITERATURE_SYNTHESIS_PROMPT,
  general: GENERAL_PROMPT
} as const;

export { SYSTEM_PROMPT };
