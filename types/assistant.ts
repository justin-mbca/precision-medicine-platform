/**
 * Types for the Virtual Colleague clinical decision support assistant.
 */

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO
  /** Only for assistant: reasoning/explanation shown to user */
  reasoning?: string;
  /** Only for assistant: structured recommendations with status */
  recommendations?: RecommendationWithEvidence[];
  /** Only for assistant: overall confidence of the response (0–1) */
  confidence?: number;
  /** Only for assistant: message id for feedback */
  messageId?: string;
}

/** Green = favorable/safe, Yellow = caution, Red = concern/action needed */
export type RecommendationStatus = "green" | "yellow" | "red";

export interface RecommendationWithEvidence {
  id: string;
  title: string;
  status: RecommendationStatus;
  summary: string;
  confidence: number; // 0–1
  citations?: Citation[];
  /** Optional dimension label, e.g. "Drug-gene", "Cardiovascular risk" */
  dimension?: string;
}

export interface Citation {
  id: string;
  title: string;
  source: string; // e.g. "NCCN Guidelines v3.2024"
  url?: string;
  pmid?: string;
  year?: number;
}

export interface AssistantFeedback {
  messageId: string;
  helpful: boolean;
  comment?: string;
  timestamp: string;
}
