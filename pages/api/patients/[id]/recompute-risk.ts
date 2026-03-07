import type { NextApiRequest, NextApiResponse } from "next";
import type { PatientRecord } from "@/types/medical";
import { createSamplePatients } from "@/lib/mockData";
import { recomputeRiskScores, type RiskScore } from "@/lib/ai/riskScoring";

type Data = { riskScores: RiskScore[] } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid patient id" });
  }

  const patients: PatientRecord[] = createSamplePatients();
  const patient =
    patients.find((p) => p.demographics.patientId === id) ?? null;

  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  try {
    const riskScores = await recomputeRiskScores(patient);
    return res.status(200).json({ riskScores });
  } catch {
    return res.status(500).json({ error: "Failed to recompute risk scores" });
  }
}

