import { useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SynopticDashboard } from "@/components/dashboard/SynopticDashboard";
import { PatientOverview } from "@/components/patients/PatientOverview";

export default function Home() {
  const [view, setView] = useState<"synoptic" | "detailed">("synoptic");

  return (
    <DashboardLayout wide={view === "synoptic"}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setView("synoptic")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "synoptic"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Synoptic
            </button>
            <button
              onClick={() => setView("detailed")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "detailed"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
        {view === "synoptic" ? <SynopticDashboard /> : <PatientOverview />}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false
      }
    };
  }

  return { props: {} };
};

