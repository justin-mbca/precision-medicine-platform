import type { ChatMessage } from "@/types/assistant";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { RecommendationCard } from "./RecommendationCard";
import { FeedbackButtons } from "./FeedbackButtons";

interface Props {
  message: ChatMessage;
}

function renderContent(content: string) {
  // Simple markdown-like: **bold** and newlines
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-brand-600 px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] space-y-2">
        {message.reasoning && (
          <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 italic">
            {message.reasoning}
          </div>
        )}
        <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
          <div className="prose prose-sm max-w-none">
            {renderContent(message.content)}
          </div>
          {message.confidence != null && (
            <div className="mt-2">
              <ConfidenceBadge confidence={message.confidence} size="sm" />
            </div>
          )}
        </div>
        {message.recommendations && message.recommendations.length > 0 && (
          <div className="space-y-2">
            {message.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
        {message.messageId && (
          <FeedbackButtons messageId={message.messageId} />
        )}
      </div>
    </div>
  );
}
