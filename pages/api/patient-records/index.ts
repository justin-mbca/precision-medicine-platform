import type { NextApiRequest, NextApiResponse } from "next";
import type { PatientRecord } from "@/types/medical";
import { createSamplePatients } from "@/lib/mockData";

type Data = { records: PatientRecord[] } | { error: string };

/**
 * GET /api/patient-records
 * Returns full PatientRecord[] (clinical notes, treatment plans, follow-ups, genomic data).
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  setTimeout(() => {
    try {
      const records = createSamplePatients();
      return res.status(200).json({ records });
    } catch {
      return res.status(500).json({ error: "Failed to load patient records" });
    }
  }, 300);
}
