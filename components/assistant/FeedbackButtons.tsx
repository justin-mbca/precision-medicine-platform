import { useState } from "react";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from "@heroicons/react/24/solid";

interface Props {
  messageId: string;
  onFeedback?: (helpful: boolean) => void;
}

export function FeedbackButtons({ messageId, onFeedback }: Props) {
  const [sent, setSent] = useState<"up" | "down" | null>(null);

  async function submit(helpful: boolean) {
    if (sent !== null) return;
    setSent(helpful ? "up" : "down");
    try {
      await fetch("/api/assistant/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, helpful })
      });
      onFeedback?.(helpful);
    } catch {
      setSent(null);
    }
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-[10px] text-slate-500 mr-1">Helpful?</span>
      <button
        onClick={() => submit(true)}
        disabled={sent !== null}
        className={`p-1 rounded ${
          sent === "up"
            ? "text-emerald-600"
            : "text-slate-400 hover:text-slate-600"
        }`}
        title="Yes, helpful"
      >
        {sent === "up" ? (
          <HandThumbUpSolid className="h-4 w-4" />
        ) : (
          <HandThumbUpIcon className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={() => submit(false)}
        disabled={sent !== null}
        className={`p-1 rounded ${
          sent === "down"
            ? "text-red-500"
            : "text-slate-400 hover:text-slate-600"
        }`}
        title="Not helpful"
      >
        {sent === "down" ? (
          <HandThumbDownSolid className="h-4 w-4" />
        ) : (
          <HandThumbDownIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
