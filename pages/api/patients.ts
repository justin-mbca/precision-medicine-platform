import type { NextApiRequest, NextApiResponse } from "next";
import type { PatientRecord } from "@/types/medical";
import { createSamplePatients } from "@/lib/mockData";

type Data =
  | { patients: PatientRecord[] }
  | { patient: PatientRecord | null }
  | { error: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id as string | undefined;

  // Simulate latency and a real backend call
  setTimeout(() => {
    try {
      const patients = createSamplePatients();

      if (id) {
        const patient =
          patients.find((p) => p.demographics.patientId === id) ?? null;
        if (!patient) {
          return res.status(404).json({ error: "Patient not found" });
        }
        return res.status(200).json({ patient });
      }

      return res.status(200).json({ patients });
    } catch {
      return res.status(500).json({ error: "Failed to load patients" });
    }
  }, 400);
}

