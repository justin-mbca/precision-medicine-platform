import { useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GenomicDataViewer } from "@/components/genomic/GenomicDataViewer";
import { AIAnalysisPanel } from "@/components/genomic/AIAnalysisPanel";
import { usePatients } from "@/lib/usePatients";
import type { GeneVariant } from "@/types/medical";

export default function GenomicPage() {
  const { data: patients, loading, error } = usePatients();
  const [analyzingVariant, setAnalyzingVariant] = useState<GeneVariant | null>(
    null
  );

  const variants: GeneVariant[] =
    patients?.flatMap((p) => p.genomic.variants) ?? [];

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold mb-1">Unable to load genomic data</p>
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Genomic insights
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and analyze genetic variants across patients. Use search and
            filters to find variants of interest.
          </p>
        </div>

        <GenomicDataViewer
          variants={variants}
          loading={loading}
          onAnalyzeVariant={setAnalyzingVariant}
          viewMode="table"
        />
      </div>

      <AIAnalysisPanel
        variant={analyzingVariant}
        onClose={() => setAnalyzingVariant(null)}
        useStreaming={true}
      />
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
