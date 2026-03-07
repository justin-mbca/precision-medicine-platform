import type { NextApiRequest, NextApiResponse } from "next";
import {
  buildPatientContextSummary,
  detectQueryType,
  QUERY_PROMPTS,
  SYSTEM_PROMPT
} from "@/lib/ai/clinicalPrompts";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { createSamplePatients } from "@/lib/mockData";
import type {
  ChatMessage as ChatMessageType,
  RecommendationWithEvidence
} from "@/types/assistant";

interface RequestBody {
  messages: Array<{ role: string; content: string }>;
  selectedPatientId?: string;
}

/** Generate mock streaming response and optional recommendations based on query. */
function getMockResponse(
  lastMessage: string,
  queryType: ReturnType<typeof detectQueryType>
): {
  reasoning: string;
  answer: string;
  confidence: number;
  recommendations: RecommendationWithEvidence[];
} {
  const lower = lastMessage.toLowerCase();

  // Drug interaction
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

  // Risk assessment
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

  // Treatment options
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

  // Literature / general
  return {
    reasoning:
      "Synthesized patient context with guideline and literature references on file.",
    answer:
      "Based on the patient's genomic and clinical profile, key evidence supports: (1) **NCCN guidelines** for BRCA1 carriers—enhanced surveillance and PARP eligibility. (2) **CPIC** for TPMT if thiopurines are considered. (3) **APOE** and cardiovascular/cognitive risk from observational studies. I can go deeper on drug interactions, risk quantification, or treatment options if you specify.",
    confidence: 0.78,
    recommendations: []
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ok, remaining } = checkRateLimit(req);
  if (!ok) {
    res.setHeader("X-RateLimit-Remaining", "0");
    return res.status(429).json({
      error: "Too many requests. Please try again in a minute."
    });
  }

  let body: RequestBody;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { messages, selectedPatientId } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array required" });
  }

  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.role !== "user" || typeof lastMsg.content !== "string") {
    return res.status(400).json({ error: "Last message must be from user" });
  }

  const patients = createSamplePatients();
  const record = selectedPatientId
    ? patients.find((p) => p.demographics.patientId === selectedPatientId) ?? null
    : null;
  const patientContext = buildPatientContextSummary(record);
  const queryType = detectQueryType(lastMsg.content);
  const promptInstruction = QUERY_PROMPTS[queryType];

  // Simulate delay
  await new Promise((r) => setTimeout(r, 400));

  const mock = getMockResponse(lastMsg.content, queryType);
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-RateLimit-Remaining", String(remaining - 1));
  res.flushHeaders?.();

  // Stream reasoning
  const reasonChunks = mock.reasoning.match(/.{1,40}(\s|$)/g) ?? [mock.reasoning];
  for (const chunk of reasonChunks) {
    res.write(
      `data: ${JSON.stringify({ type: "reasoning", text: chunk })}\n\n`
    );
    await new Promise((r) => setTimeout(r, 30));
  }

  // Stream answer (paragraphs)
  const answerChunks = mock.answer.split(/(?=\n\n)|(?=\*\*)/).filter(Boolean);
  for (const chunk of answerChunks) {
    res.write(
      `data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`
    );
    await new Promise((r) => setTimeout(r, 40));
  }

  // Recommendations and metadata
  res.write(
    `data: ${JSON.stringify({ type: "recommendations", recommendations: mock.recommendations })}\n\n`
  );
  res.write(
    `data: ${JSON.stringify({ type: "done", messageId, confidence: mock.confidence })}\n\n`
  );
  res.end();
}
