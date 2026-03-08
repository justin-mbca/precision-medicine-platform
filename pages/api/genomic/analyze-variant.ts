import type { NextApiRequest, NextApiResponse } from "next";
import type { GeneVariant } from "@/types/medical";
import {
  fillTemplate,
  VARIANT_INTERPRETATION_PROMPT,
  type VariantContext
} from "@/lib/ai/promptTemplates";
import { isMockMode } from "@/lib/ai/llmConfig";
import { interpretVariant } from "@/lib/ai/llmClient";
import { generateMockVariantInterpretation } from "@/lib/ai/mockGenerators";

/**
 * POST /api/genomic/analyze-variant
 * Accepts a GeneVariant in the body. Returns a streaming JSON response simulating AI analysis.
 *
 * For real streaming, we would use a ReadableStream; here we simulate with a single delayed response
 * that could be extended to chunked streaming.
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

  // Build prompt context for logging / future LLM integration
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

  let interpretation: string;
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 800));
    interpretation = generateMockVariantInterpretation(variant as GeneVariant);
  } else {
    try {
      interpretation = await interpretVariant(prompt, variant as GeneVariant);
    } catch (err) {
      return res.status(500).json({
        error: "LLM interpretation failed",
        details: err instanceof Error ? err.message : String(err)
      });
    }
  }

  return res.status(200).json({
    variantId: variant.id,
    promptUsed: prompt,
    interpretation,
    generatedAt: new Date().toISOString()
  });
}
