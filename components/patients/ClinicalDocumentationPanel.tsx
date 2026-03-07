import type { PatientRecord } from "@/types/medical";
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

interface Props {
  patient: PatientRecord;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function priorityColor(priority: "low" | "medium" | "high"): string {
  switch (priority) {
    case "high":
      return "bg-amber-100 text-amber-800";
    case "medium":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-50 text-slate-600";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function ClinicalDocumentationPanel({ patient }: Props) {
  const { clinicalNotes, treatmentPlans, followUpRecommendations } = patient;

  return (
    <section className="space-y-6">
      <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
        Clinical documentation
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Clinical notes */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <DocumentTextIcon className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Clinical notes
            </h3>
          </div>
          {clinicalNotes.length === 0 ? (
            <p className="text-xs text-slate-500">No notes on file.</p>
          ) : (
            <ul className="space-y-3">
              {clinicalNotes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                >
                  <p className="font-medium text-slate-900">{note.title}</p>
                  <p className="mt-1 text-slate-600">{note.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 uppercase">
                      {note.noteType.replace("_", " ")}
                    </span>
                    <span className="text-slate-400">
                      {formatDate(note.createdAt)} · {note.authorRole}
                    </span>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Treatment plans */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Treatment plans
            </h3>
          </div>
          {treatmentPlans.length === 0 ? (
            <p className="text-xs text-slate-500">No active plans.</p>
          ) : (
            <ul className="space-y-3">
              {treatmentPlans.map((plan) => (
                <li
                  key={plan.id}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                >
                  <p className="font-medium text-slate-900 mb-1">Goals</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    {plan.goals.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                  <p className="font-medium text-slate-900 mt-2 mb-0.5">
                    Planned medications
                  </p>
                  <p className="text-slate-600">
                    {plan.plannedMedications.join(", ")}
                  </p>
                  {plan.genomicConsiderations &&
                    plan.genomicConsiderations.length > 0 && (
                      <>
                        <p className="font-medium text-slate-900 mt-2 mb-0.5">
                          Genomic considerations
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {plan.genomicConsiderations.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  {plan.followUpIntervalMonths != null && (
                    <p className="mt-2 text-slate-500">
                      Follow-up every {plan.followUpIntervalMonths} month
                      {plan.followUpIntervalMonths !== 1 ? "s" : ""}
                    </p>
                  )}
                  <p className="mt-1 text-slate-400">
                    Updated {formatDate(plan.updatedAt ?? plan.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Follow-up recommendations */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <FlagIcon className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Follow-up recommendations
            </h3>
          </div>
          {followUpRecommendations.length === 0 ? (
            <p className="text-xs text-slate-500">No open recommendations.</p>
          ) : (
            <ul className="space-y-3">
              {followUpRecommendations.map((rec) => (
                <li
                  key={rec.id}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                >
                  <p className="text-slate-900">{rec.recommendationText}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${priorityColor(rec.priority)}`}
                    >
                      {rec.priority}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${statusColor(rec.status)}`}
                    >
                      {rec.status.replace("_", " ")}
                    </span>
                    {rec.dueDate && (
                      <span className="text-slate-500">
                        Due {formatDate(rec.dueDate)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
