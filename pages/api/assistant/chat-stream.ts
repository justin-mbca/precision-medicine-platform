import type { NextApiRequest, NextApiResponse } from "next";
import {
  buildPatientContextSummary,
  detectQueryType,
  QUERY_PROMPTS,
  SYSTEM_PROMPT
} from "@/lib/ai/clinicalPrompts";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { createSamplePatients } from "@/lib/mockData";
import { isMockMode } from "@/lib/ai/llmConfig";
import { streamChat } from "@/lib/ai/llmClient";
import { getMockChatResponse } from "@/lib/ai/mockGenerators";

interface RequestBody {
  messages: Array<{ role: string; content: string }>;
  selectedPatientId?: string;
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
  const systemPrompt = `${SYSTEM_PROMPT}\n\nPatient context:\n${patientContext}\n\nInstruction for this query: ${QUERY_PROMPTS[queryType]}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-RateLimit-Remaining", String(remaining - 1));
  res.flushHeaders?.();

  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 400));
    const mock = getMockChatResponse(lastMsg.content, queryType);
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const reasonChunks = mock.reasoning.match(/.{1,40}(\s|$)/g) ?? [mock.reasoning];
    for (const chunk of reasonChunks) {
      res.write(
        `data: ${JSON.stringify({ type: "reasoning", text: chunk })}\n\n`
      );
      await new Promise((r) => setTimeout(r, 30));
    }

    const answerChunks = mock.answer.split(/(?=\n\n)|(?=\*\*)/).filter(Boolean);
    for (const chunk of answerChunks) {
      res.write(
        `data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`
      );
      await new Promise((r) => setTimeout(r, 40));
    }

    res.write(
      `data: ${JSON.stringify({ type: "recommendations", recommendations: mock.recommendations })}\n\n`
    );
    res.write(
      `data: ${JSON.stringify({ type: "done", messageId, confidence: mock.confidence })}\n\n`
    );
  } else {
    try {
      for await (const chunk of streamChat(messages, systemPrompt, patientContext)) {
        if (chunk.type === "reasoning" && chunk.text) {
          res.write(
            `data: ${JSON.stringify({ type: "reasoning", text: chunk.text })}\n\n`
          );
        } else if (chunk.type === "chunk" && chunk.text) {
          res.write(
            `data: ${JSON.stringify({ type: "chunk", text: chunk.text })}\n\n`
          );
        } else if (chunk.type === "recommendations") {
          res.write(
            `data: ${JSON.stringify({ type: "recommendations", recommendations: chunk.recommendations ?? [] })}\n\n`
          );
        } else if (chunk.type === "done") {
          res.write(
            `data: ${JSON.stringify({ type: "done", messageId: chunk.messageId, confidence: chunk.confidence })}\n\n`
          );
        }
      }
    } catch (err) {
      res.write(
        `data: ${JSON.stringify({ type: "error", error: err instanceof Error ? err.message : String(err) })}\n\n`
      );
    }
  }

  res.end();
}
