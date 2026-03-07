import { useEffect, useState } from "react";
import type { PatientRecord } from "@/types/medical";
import { fetchPatients } from "./patientService";

interface UsePatientsState {
  data: PatientRecord[] | null;
  loading: boolean;
  error: string | null;
}

export function usePatients(): UsePatientsState {
  const [data, setData] = useState<PatientRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchPatients();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

