import { useState, useRef, useEffect } from "react";
import type { PatientRecord } from "@/types/medical";
import type { ChatMessage } from "@/types/assistant";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface Props {
  patients: PatientRecord[] | null;
  selectedPatientId: string | null;
  onSelectPatient: (id: string | null) => void;
}

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function VirtualColleagueChat({
  patients,
  selectedPatientId,
  onSelectPatient
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    const assistantPlaceholder: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    try {
      const conversation = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/assistant/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation,
          selectedPatientId: selectedPatientId ?? undefined
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          res.status === 429
            ? "Too many requests. Please wait a minute."
            : (err as { error?: string }).error ?? `Error ${res.status}`
        );
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let reasoning = "";
      let answer = "";
      let recommendations: ChatMessage["recommendations"] = [];
      let messageId = "";
      let confidence = 0;

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "reasoning") reasoning += data.text ?? "";
            if (data.type === "chunk") answer += data.text ?? "";
            if (data.type === "recommendations")
              recommendations = data.recommendations ?? [];
            if (data.type === "done") {
              messageId = data.messageId ?? "";
              confidence = data.confidence ?? 0;
            }
          } catch {
            // skip
          }
        }
      }
      if (buffer.startsWith("data: ")) {
        try {
          const data = JSON.parse(buffer.slice(6));
          if (data.type === "reasoning") reasoning += data.text ?? "";
          if (data.type === "chunk") answer += data.text ?? "";
          if (data.type === "recommendations")
            recommendations = data.recommendations ?? [];
          if (data.type === "done") {
            messageId = data.messageId ?? "";
            confidence = data.confidence ?? 0;
          }
        } catch {
          // skip
        }
      }

      setMessages((prev) => {
        const out = [...prev];
        const idx = out.findIndex((m) => m.id === assistantPlaceholder.id);
        if (idx >= 0) {
          out[idx] = {
            ...out[idx],
            content: answer || "No response generated.",
            reasoning: reasoning || undefined,
            recommendations: recommendations?.length ? recommendations : undefined,
            confidence,
            messageId: messageId || undefined
          };
        }
        return out;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantPlaceholder.id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[400px] rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header + patient selector */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-slate-900">Virtual Colleague</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Patient context:</label>
          <select
            value={selectedPatientId ?? ""}
            onChange={(e) =>
              onSelectPatient(e.target.value ? e.target.value : null)
            }
            className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-brand-500"
          >
            <option value="">None</option>
            {patients?.map((p) => (
              <option
                key={p.demographics.patientId}
                value={p.demographics.patientId}
              >
                {p.demographics.givenName} {p.demographics.familyName} (
                {p.demographics.patientId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 text-sm">
            <p className="font-medium">Ask about drug-gene interactions, risk, or treatment.</p>
            <p className="mt-1">Try: &quot;What drug-gene interactions should I consider?&quot;</p>
          </div>
        )}
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">Thinking</span>
                <span className="animate-pulse">...</span>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this patient..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
