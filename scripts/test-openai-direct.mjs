#!/usr/bin/env node
/**
 * Direct OpenAI API test - bypasses Next.js, loads key from .env.local.
 * Run: node scripts/test-openai-direct.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Load .env.local (ignore lines starting with #)
const env = {};
try {
  const envPath = join(rootDir, ".env.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || !trimmed) continue;
    const match = trimmed.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
} catch (e) {
  console.error("Could not load .env.local:", e.message);
  process.exit(1);
}

const OPENAI_API_KEY = env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY not set in .env.local");
  process.exit(1);
}

const prompt = `You are a clinical molecular geneticist assisting with variant interpretation for precision medicine.

Given the following variant:
- Gene: BRCA1
- Coding change: c.68_69delAG
- Protein change: p.Glu23Valfs
- Variant type: unknown
- Clinical significance: pathogenic
- Associated conditions: None specified

Provide a concise clinical interpretation (2–4 sentences) covering:
1. What this variant means biologically
2. Clinical implications for the patient
3. Any actionable recommendations (e.g., surveillance, drug adjustments)

Use plain language suitable for a clinician. Do not include disclaimers about consulting a genetic counselor.`;

async function main() {
  console.log("Testing OpenAI API directly...\n");
  console.log("Model: gpt-4o-mini");
  console.log("---\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.2
    })
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Error:", res.status, data);
    process.exit(1);
  }

  const interpretation = data.choices?.[0]?.message?.content?.trim() ?? "";
  console.log("Interpretation:\n", interpretation);
  console.log("\n---");
  console.log("Model:", data.model);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
