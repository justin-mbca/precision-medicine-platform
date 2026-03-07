import type { PatientRecord } from "@/types/medical";

export async function fetchPatients(): Promise<PatientRecord[]> {
  const res = await fetch("/api/patients");

  if (!res.ok) {
    let message = `Failed to load patient data (status ${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { patients: PatientRecord[] };
  return data.patients;
}
