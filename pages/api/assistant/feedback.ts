import type { NextApiRequest, NextApiResponse } from "next";
import type { AssistantFeedback } from "@/types/assistant";

/** In-memory store for demo; replace with DB in production. */
const feedbackStore: AssistantFeedback[] = [];

type Data = { ok: true } | { error: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { messageId, helpful, comment } = body;

  if (!messageId || typeof helpful !== "boolean") {
    return res.status(400).json({
      error: "messageId (string) and helpful (boolean) required"
    });
  }

  const entry: AssistantFeedback = {
    messageId,
    helpful,
    comment: typeof comment === "string" ? comment : undefined,
    timestamp: new Date().toISOString()
  };
  feedbackStore.push(entry);

  return res.status(200).json({ ok: true });
}
