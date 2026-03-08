/**
 * Prompt templates for AI-driven variant interpretation.
 * Used by the genomic analysis API to structure requests to LLMs.
 */

export interface VariantContext {
  geneSymbol: string;
  codingChange: string;
  proteinChange?: string;
  variantType?: string;
  clinicalSignificance?: string;
  associatedDiseases?: string[];
}

export const VARIANT_INTERPRETATION_PROMPT = `You are a clinical molecular geneticist assisting with variant interpretation for precision medicine.

Given the following variant:
- Gene: {{geneSymbol}}
- Coding change: {{codingChange}}
- Protein change: {{proteinChange}}
- Variant type: {{variantType}}
- Clinical significance: {{clinicalSignificance}}
- Associated conditions: {{associatedDiseases}}

Provide a clinical interpretation covering:
1. What this variant means biologically (include mechanistic detail when relevant, e.g., homologous recombination, HRD)
2. Clinical implications for the patient
3. Any actionable recommendations (e.g., surveillance, risk-reducing surgery, PARP inhibitors, genetic counseling)

Use plain language suitable for a clinician. Include technical terms where they add clinical value. Do not include disclaimers about consulting a genetic counselor.`;

export const VARIANT_SUMMARY_PROMPT = `Summarize this genetic variant for a busy clinician in 1–2 sentences:
Gene: {{geneSymbol}}, Change: {{codingChange}}, Significance: {{clinicalSignificance}}`;

export const VARIANT_EDUCATIONAL_PROMPT = `Explain this genetic variant to a clinician in simple terms:
{{geneSymbol}} {{codingChange}} ({{clinicalSignificance}}).
Include: gene function, variant effect, and why it matters clinically.`;

export function fillTemplate(
  template: string,
  context: VariantContext
): string {
  return template
    .replace(/\{\{geneSymbol\}\}/g, context.geneSymbol ?? "Unknown")
    .replace(/\{\{codingChange\}\}/g, context.codingChange ?? "—")
    .replace(/\{\{proteinChange\}\}/g, context.proteinChange ?? "—")
    .replace(/\{\{variantType\}\}/g, context.variantType ?? "unknown")
    .replace(
      /\{\{clinicalSignificance\}\}/g,
      context.clinicalSignificance ?? "unknown"
    )
    .replace(
      /\{\{associatedDiseases\}\}/g,
      context.associatedDiseases?.join(", ") ?? "None specified"
    );
}
