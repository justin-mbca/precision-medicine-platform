import { signOut, useSession } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role ?? "oncologist";

  const subtitle =
    role === "oncologist"
      ? "Oncology-focused genomic decision support (mock)."
      : "Integrated EMR + genomics for decision support (mock).";

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 bg-white">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Patient genomic overview
        </h1>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        {status === "loading" && (
          <span className="text-xs text-slate-400">Loading user…</span>
        )}
        {session && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {session.user?.name ?? "Clinician"}
              </p>
              <p className="text-xs text-slate-500">{session.user?.email}</p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {role}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

