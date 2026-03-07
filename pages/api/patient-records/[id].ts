import type { NextApiRequest, NextApiResponse } from "next";
import type { PatientRecord } from "@/types/medical";
import { createSamplePatients } from "@/lib/mockData";

type Data = { record: PatientRecord | null } | { error: string };

/**
 * GET /api/patient-records/[id]
 * Returns a single full PatientRecord by demographics.patientId.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id as string | undefined;
  if (!id) {
    return res.status(400).json({ error: "Missing patient id" });
  }

  setTimeout(() => {
    try {
      const records = createSamplePatients();
      const record =
        records.find((r) => r.demographics.patientId === id) ?? null;
      if (!record) {
        return res.status(404).json({ error: "Patient not found" });
      }
      return res.status(200).json({ record });
    } catch {
      return res.status(500).json({ error: "Failed to load patient record" });
    }
  }, 300);
}
