/**
 * LLM client for variant interpretation and clinical chat.
 *
 * When USE_MOCK_AI=true, callers use mock generators instead.
 * When USE_MOCK_AI=false, these functions call the configured LLM provider.
 */

import type { GeneVariant } from "@/types/medical";
import {
  hasLLMApiKey,
  LLM_PROVIDER,
  OPENAI_API_KEY,
  ANTHROPIC_API_KEY
} from "./llmConfig";

export interface ChatStreamChunk {
  type: "reasoning" | "chunk" | "recommendations" | "done";
  text?: string;
  recommendations?: unknown[];
  messageId?: string;
  confidence?: number;
}

/**
 * Call LLM for variant interpretation (non-streaming).
 * Placeholder: implements OpenAI and Anthropic API calls.
 */
export async function interpretVariant(
  prompt: string,
  _variant: GeneVariant
): Promise<string> {
  if (!hasLLMApiKey()) {
    throw new Error(
      "LLM mode enabled but no API key. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.local"
    );
  }

  if (LLM_PROVIDER === "openai") {
    return callOpenAICompletion(prompt);
  }

  if (LLM_PROVIDER === "anthropic") {
    return callAnthropicCompletion(prompt);
  }

  throw new Error(`Unknown LLM provider: ${LLM_PROVIDER}`);
}

/**
 * Placeholder: OpenAI Chat Completions API.
 */
async function callOpenAICompletion(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * Placeholder: Anthropic Messages API.
 */
async function callAnthropicCompletion(prompt: string): Promise<string> {
  const response = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const textBlock = data.content?.find((c) => c.type === "text");
  return textBlock?.text?.trim() ?? "";
}

/**
 * Stream LLM response for clinical chat.
 * Placeholder: returns async generator that yields chunks.
 * For structured recommendations, consider JSON mode or post-processing.
 */
export async function* streamChat(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  _patientContext: string
): AsyncGenerator<ChatStreamChunk> {
  if (!hasLLMApiKey()) {
    throw new Error(
      "LLM mode enabled but no API key. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.local"
    );
  }

  if (LLM_PROVIDER === "openai") {
    yield* streamOpenAIChat(messages, systemPrompt);
    return;
  }

  if (LLM_PROVIDER === "anthropic") {
    yield* streamAnthropicChat(messages, systemPrompt);
    return;
  }

  throw new Error(`Unknown LLM provider: ${LLM_PROVIDER}`);
}

/**
 * Placeholder: OpenAI streaming.
 */
async function* streamOpenAIChat(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): AsyncGenerator<ChatStreamChunk> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      stream: true,
      max_tokens: 2048,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{
                delta?: { content?: string };
                finish_reason?: string;
              }>;
            };
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield { type: "chunk", text: content };
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield {
    type: "recommendations",
    recommendations: []
  };
  yield {
    type: "done",
    messageId,
    confidence: 0.8
  };
}

/**
 * Placeholder: Anthropic streaming.
 */
async function* streamAnthropicChat(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): AsyncGenerator<ChatStreamChunk> {
  const response = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-3-haiku-20240307",
        max_tokens: 2048,
        system: systemPrompt,
        messages,
        stream: true,
        temperature: 0.2
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data) as {
              type?: string;
              delta?: { type?: string; text?: string };
              message?: { stop_reason?: string };
            };
            const text = parsed.delta?.text;
            if (text) {
              yield { type: "chunk", text };
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield {
    type: "recommendations",
    recommendations: []
  };
  yield {
    type: "done",
    messageId,
    confidence: 0.8
  };
}
