import type { NextApiRequest, NextApiResponse } from "next";
import type { GeneVariant } from "@/types/medical";
import {
  fillTemplate,
  VARIANT_INTERPRETATION_PROMPT,
  type VariantContext
} from "@/lib/ai/promptTemplates";

function generateMockInterpretation(variant: GeneVariant): string {
  const sig =
    variant.acmgClassification ?? variant.clinVarSignificance ?? "unknown";
  const gene = variant.geneSymbol;

  if (gene === "BRCA1" && sig === "pathogenic") {
    return `This pathogenic BRCA1 frameshift variant (${variant.codingChange}) results in a truncated, nonfunctional protein and is a well-established cause of hereditary breast and ovarian cancer syndrome. Carriers have substantially elevated lifetime risks of breast and ovarian cancer. Clinical implications: recommend enhanced surveillance (annual MRI + mammography from age 30–35), discussion of risk-reducing surgery, and consider PARP inhibitor eligibility if cancer develops. Genetic counseling for at-risk relatives is indicated.`;
  }
  if (gene === "APOE" && variant.proteinChange?.includes("e4")) {
    return `The APOE ε4 allele (${variant.codingChange}) is associated with increased risk of late-onset Alzheimer disease and may modify cardiovascular risk. Homozygous ε4/ε4 confers higher risk than heterozygous. Clinical implications: no disease-modifying interventions are currently evidence-based for prevention; focus on cardiovascular risk factor optimization. Consider cognitive screening in appropriate clinical context.`;
  }
  if (gene === "TPMT") {
    return `This TPMT variant (${variant.codingChange}) is associated with reduced thiopurine methyltransferase activity and increased risk of myelosuppression with azathioprine or 6-mercaptopurine. Clinical implications: consider preemptive genotyping before initiating thiopurines; reduce starting dose or use alternative therapy per CPIC guidelines.`;
  }

  return `The ${variant.geneSymbol} variant ${variant.codingChange} (${sig}) may have clinical significance. Interpret in the context of the patient's phenotype and family history. Consider referral to a genetics specialist.`;
}

/**
 * POST /api/genomic/analyze-variant-stream
 * Streams AI analysis as Server-Sent Events (SSE) for real-time feedback.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const variant = req.body as Partial<GeneVariant>;
  if (!variant?.id || !variant?.geneSymbol || !variant?.codingChange) {
    return res.status(400).json({
      error: "Missing required fields: id, geneSymbol, codingChange"
    });
  }

  const context: VariantContext = {
    geneSymbol: variant.geneSymbol,
    codingChange: variant.codingChange,
    proteinChange: variant.proteinChange,
    variantType: variant.variantType,
    clinicalSignificance:
      variant.acmgClassification ?? variant.clinVarSignificance,
    associatedDiseases: variant.associatedDiseases
  };
  const prompt = fillTemplate(VARIANT_INTERPRETATION_PROMPT, context);
  const fullText = generateMockInterpretation(variant as GeneVariant);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Simulate streaming: send sentence by sentence with small delays
  const sentences = fullText.match(/[^.!?]+[.!?]+/g) ?? [fullText];

  for (let i = 0; i < sentences.length; i++) {
    const chunk = sentences[i];
    res.write(`data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`);
    await new Promise((r) => setTimeout(r, 80));
  }

  res.write(
    `data: ${JSON.stringify({ type: "done", variantId: variant.id, promptUsed: prompt })}\n\n`
  );
  res.end();
}
