import { useState, useEffect, useRef } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VirtualColleagueChat } from "@/components/assistant/VirtualColleagueChat";
import { usePatients } from "@/lib/usePatients";

export default function AssistantPage() {
  const { data: patients, error } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const hasSetInitial = useRef(false);

  useEffect(() => {
    if (patients?.length && !hasSetInitial.current) {
      hasSetInitial.current = true;
      setSelectedPatientId(patients[0].demographics.patientId);
    }
  }, [patients]);

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold mb-1">Unable to load patients</p>
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Virtual Colleague
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-powered clinical decision support. Ask about drug-gene
            interactions, risk assessment, treatment options, and evidence.
          </p>
        </div>

        <VirtualColleagueChat
          patients={patients ?? null}
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
        />
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
