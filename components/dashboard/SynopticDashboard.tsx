"use client";

import { useState, useMemo } from "react";
import { usePatients } from "@/lib/usePatients";
import { computeDimensionScores } from "@/lib/dashboardData";
import type { HealthDimensionScore, HealthDimensionId } from "@/types/dashboard";
import { HealthDimensionCard } from "./HealthDimensionCard";
import { DimensionDrillDown } from "./DimensionDrillDown";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import type { PatientRecord } from "@/types/medical";

export function SynopticDashboard() {
  const { data: patients, loading, error } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [drillDownDimension, setDrillDownDimension] =
    useState<HealthDimensionId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">(
    "90d"
  );

  const selectedPatient = useMemo(() => {
    if (!patients) return null;
    if (selectedPatientId)
      return patients.find((p) => p.demographics.patientId === selectedPatientId) ?? null;
    return patients[0] ?? null;
  }, [patients, selectedPatientId]);

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.demographics.givenName.toLowerCase().includes(q) ||
        p.demographics.familyName.toLowerCase().includes(q) ||
        p.demographics.patientId.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const dimensionScores = useMemo((): HealthDimensionScore[] => {
    if (!selectedPatient) return [];
    return computeDimensionScores(selectedPatient as PatientRecord);
  }, [selectedPatient]);

  const drillDownData = useMemo(() => {
    if (!drillDownDimension || !selectedPatient) return null;
    const score = dimensionScores.find((s) => s.dimensionId === drillDownDimension);
    if (!score) return null;
    return { patient: selectedPatient, score };
  }, [drillDownDimension, selectedPatient, dimensionScores]);

  if (loading) {
    return (
      <div className="space-y-6 print:hidden">
        <div className="h-12 w-64 rounded-lg bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !patients?.length) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-semibold mb-1">Unable to load dashboard data</p>
        <p>{error ?? "No patient data available."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 print:hidden">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search patients by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            aria-label="Search patients"
          />
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-slate-500" aria-hidden />
          <select
            value={dateRange}
            onChange={(e) =>
              setDateRange(e.target.value as "7d" | "30d" | "90d" | "all")
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
            aria-label="Date range for data"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Patient selector */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <UserCircleIcon className="h-5 w-5 text-slate-500" aria-hidden />
        <span className="text-sm font-medium text-slate-700">
          Selected patient:
        </span>
        <select
          value={selectedPatient?.demographics.patientId ?? ""}
          onChange={(e) =>
            setSelectedPatientId(e.target.value || null)
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-brand-500"
          aria-label="Select patient"
        >
          {filteredPatients.map((p) => (
            <option
              key={p.demographics.patientId}
              value={p.demographics.patientId}
            >
              {p.demographics.givenName} {p.demographics.familyName} (
              {p.demographics.patientId})
            </option>
          ))}
        </select>
      </div>

      {/* Patient summary header (print-friendly) */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200 print:shadow-none print:border">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Synoptic health overview
        </h2>
        <p className="text-lg font-semibold text-slate-900">
          {selectedPatient?.demographics.givenName}{" "}
          {selectedPatient?.demographics.familyName}
        </p>
        <p className="text-sm text-slate-600">
          ID {selectedPatient?.demographics.patientId} • DOB{" "}
          {selectedPatient?.demographics.dateOfBirth} •{" "}
          {selectedPatient?.demographics.sex.toUpperCase()}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Data range: {dateRange === "all" ? "All time" : `Last ${dateRange.replace("d", "")} days`} • Generated for clinical review (mock)
        </p>
      </div>

      {/* 14 health dimensions grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3"
        role="list"
        aria-label="Health dimension status cards"
      >
        {dimensionScores.map((score) => (
          <HealthDimensionCard
            key={score.dimensionId}
            dimension={score}
            onDrillDown={() => setDrillDownDimension(score.dimensionId)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 print:mt-4">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full bg-emerald-500"
            aria-hidden
          />
          Normal / low risk
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full bg-amber-500"
            aria-hidden
          />
          Monitor / moderate
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full bg-red-500"
            aria-hidden
          />
          Action needed / high risk
        </span>
      </div>

      {/* Drill-down modal */}
      {drillDownData && (
        <DimensionDrillDown
          dimensionId={drillDownData.score.dimensionId}
          score={drillDownData.score}
          patient={drillDownData.patient}
          insight={
            drillDownData.score.aiRecommendation
              ? {
                  text: drillDownData.score.aiRecommendation!,
                  recommendation: undefined
                }
              : null
          }
          onClose={() => setDrillDownDimension(null)}
        />
      )}
    </div>
  );
}
