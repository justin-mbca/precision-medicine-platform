#!/usr/bin/env node
/**
 * Test OpenAI variant interpretation.
 *
 * Prerequisites:
 * 1. Add OPENAI_API_KEY=sk-your-key to .env.local
 * 2. Set USE_MOCK_AI=false in .env.local
 * 3. Run: npm run dev
 * 4. In another terminal: node scripts/test-openai-variant.mjs
 */

const API_URL = process.env.API_URL ?? "http://localhost:3000";

const variant = {
  id: "v1",
  geneSymbol: "BRCA1",
  codingChange: "c.68_69delAG",
  proteinChange: "p.Glu23Valfs",
  acmgClassification: "pathogenic"
};

async function main() {
  console.log("Testing variant interpretation (OpenAI)...\n");
  console.log("Input variant:", JSON.stringify(variant, null, 2));
  console.log("\nCalling POST", `${API_URL}/api/genomic/analyze-variant`);
  console.log("---\n");

  const res = await fetch(`${API_URL}/api/genomic/analyze-variant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variant)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Error:", res.status, data);
    process.exit(1);
  }

  console.log("Interpretation:\n", data.interpretation);
  console.log("\n---");
  console.log("Prompt used:", data.promptUsed?.slice(0, 100) + "...");
  console.log("Generated at:", data.generatedAt);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
