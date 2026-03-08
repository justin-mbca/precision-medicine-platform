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

  let fullText: string;
  if (isMockMode()) {
    fullText = generateMockVariantInterpretation(variant as GeneVariant);
  } else {
    try {
      fullText = await interpretVariant(prompt, variant as GeneVariant);
    } catch (err) {
      res.status(500).json({
        error: "LLM interpretation failed",
        details: err instanceof Error ? err.message : String(err)
      });
      return;
    }
  }

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
