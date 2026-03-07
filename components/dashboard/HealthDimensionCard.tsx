"use client";

import {
  type HealthDimensionId,
  type HealthDimensionScore,
  DIMENSION_LABELS,
  getStatusColor
} from "@/types/dashboard";
import {
  ChevronRightIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/ui/Tooltip";

interface Props {
  dimension: HealthDimensionScore;
  onDrillDown: (id: HealthDimensionId) => void;
  "aria-label"?: string;
}

export function HealthDimensionCard({
  dimension,
  onDrillDown,
  "aria-label": ariaLabel
}: Props) {
  const label = DIMENSION_LABELS[dimension.dimensionId];
  const { bg, border, text, dot } = getStatusColor(dimension.status);
  const scorePercent = Math.round(dimension.score * 100);

  return (
    <article
      className={`
        group relative rounded-xl border-2 bg-white p-4 shadow-sm
        transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2
        print:break-inside-avoid
        ${border}
      `}
      aria-label={ariaLabel ?? `Health dimension: ${label}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className={`mt-1 h-3 w-3 shrink-0 rounded-full ${dot}`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {label}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 min-w-[60px] rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full transition-all ${bg}`}
                  style={{ width: `${scorePercent}%` }}
                  role="progressbar"
                  aria-valuenow={scorePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${label} score: ${scorePercent}%`}
                />
              </div>
              <span className={`text-xs font-medium tabular-nums ${text}`}>
                {scorePercent}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Tooltip content={dimension.summary}>
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label={`More info about ${label}`}
            >
              <InformationCircleIcon className="h-4 w-4" />
            </button>
          </Tooltip>
          <button
            type="button"
            onClick={() => onDrillDown(dimension.dimensionId)}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label={`View details for ${label}`}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
