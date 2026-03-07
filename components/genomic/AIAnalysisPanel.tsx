import { useState, useCallback } from "react";
import type { GeneVariant } from "@/types/medical";
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface Props {
  variant: GeneVariant | null;
  onClose: () => void;
  useStreaming?: boolean;
}

export function AIAnalysisPanel({
  variant,
  onClose,
  useStreaming = true
}: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!variant) return;
    setLoading(true);
    setError(null);
    setText("");

    try {
      if (useStreaming) {
        const res = await fetch("/api/genomic/analyze-variant-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variant)
        });
        if (!res.ok) throw new Error("Analysis failed");
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No response body");

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "chunk") setText((t) => t + data.text);
              } catch {
                // skip malformed
              }
            }
          }
        }
        if (buffer.startsWith("data: ")) {
          try {
            const data = JSON.parse(buffer.slice(6));
            if (data.type === "chunk") setText((t) => t + data.text);
          } catch {
            // skip
          }
        }
      } else {
        const res = await fetch("/api/genomic/analyze-variant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variant)
        });
        if (!res.ok) throw new Error("Analysis failed");
        const data = (await res.json()) as { interpretation: string };
        setText(data.interpretation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [variant, useStreaming]);

  if (!variant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900">
              AI variant interpretation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-medium text-slate-900">
            {variant.geneSymbol} {variant.codingChange}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {variant.proteinChange ?? "—"} · {variant.zygosity}
          </p>
        </div>

        <div className="p-4 min-h-[120px]">
          {!text && !loading && (
            <button
              onClick={runAnalysis}
              className="w-full rounded-lg border-2 border-dashed border-slate-200 py-8 text-sm text-slate-500 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700 transition-colors"
            >
              Run AI analysis
            </button>
          )}
          {loading && !text && (
            <div className="flex items-center gap-2 text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <span className="text-sm">Analyzing variant…</span>
            </div>
          )}
          {(text || loading) && (
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {text}
              {loading && (
                <span className="inline-block w-2 h-4 bg-brand-500 animate-pulse ml-0.5" />
              )}
            </div>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100">
          {text && !loading && (
            <button
              onClick={runAnalysis}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Re-run
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
