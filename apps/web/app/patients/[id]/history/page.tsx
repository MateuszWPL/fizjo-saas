"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BodyMap } from "@/components/body-map";
import { muscleGroupLabels } from "@/lib/body-map/muscle-groups";
import { fillsFromMarkers, painColor, painTextColor } from "@/lib/body-map/pain-scale";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { PainHistoryVisit, Patient } from "@/lib/types";

export default function PainHistoryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<PainHistoryVisit[] | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        const patientResponse = await apiFetch(`/patients/${id}`);
        if (!patientResponse.ok) {
          setError("Nie znaleziono pacjenta.");
          return;
        }
        setPatient((await patientResponse.json()) as Patient);
        const historyResponse = await apiFetch(`/patients/${id}/pain-history`);
        if (!historyResponse.ok) {
          setError("Nie udało się pobrać historii bólu.");
          return;
        }
        const visits = (await historyResponse.json()) as PainHistoryVisit[];
        setHistory(visits);
        if (visits.length > 0) {
          setSelectedVisitId(visits[visits.length - 1].id);
        }
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id, router]);

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <p className="text-sm text-red-700">{error}</p>
        <Link href={`/patients/${id}`} className="mt-2 inline-block text-sm text-stone-500 underline">
          Wróć do pacjenta
        </Link>
      </main>
    );
  }

  if (!patient || history === null) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <p className="text-sm text-stone-500">Ładowanie...</p>
      </main>
    );
  }

  const selectedVisit = history.find((visit) => visit.id === selectedVisitId);
  const groupFills = fillsFromMarkers(selectedVisit?.bodyMarkers ?? []);

  const allGroups = [...new Set(history.flatMap((v) => v.bodyMarkers.map((m) => m.muscleGroup)))];
  allGroups.sort((a, b) => muscleGroupLabels[a].localeCompare(muscleGroupLabels[b], "pl"));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href={`/patients/${id}`} className="text-sm text-stone-500 underline hover:text-stone-700">
        Wróć do pacjenta
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-stone-800">
        Historia bólu: {patient.lastName} {patient.firstName}
      </h1>
      {history.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          Żadna wizyta tego pacjenta nie ma jeszcze oznaczeń bólu.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {history.map((visit) => (
              <button
                key={visit.id}
                onClick={() => setSelectedVisitId(visit.id)}
                className={
                  visit.id === selectedVisitId
                    ? "rounded bg-stone-800 px-3 py-1.5 text-sm font-medium text-white"
                    : "rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
                }
              >
                {new Date(visit.visitDate).toLocaleDateString("pl-PL")}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-8">
            <BodyMap view="front" groupFills={groupFills} />
            <BodyMap view="back" groupFills={groupFills} />
          </div>
          <h2 className="mt-8 font-medium text-stone-800">Przebieg NRS per mięsień</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2 pr-4 font-medium">Mięsień</th>
                  {history.map((visit) => (
                    <th key={visit.id} className="px-2 py-2 text-center font-medium">
                      {new Date(visit.visitDate).toLocaleDateString("pl-PL")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allGroups.map((group) => (
                  <tr key={group} className="border-b border-stone-100">
                    <td className="py-2 pr-4 text-stone-800">{muscleGroupLabels[group]}</td>
                    {history.map((visit) => {
                      const marker = visit.bodyMarkers.find((m) => m.muscleGroup === group);
                      if (!marker) {
                        return (
                          <td key={visit.id} className="px-2 py-2 text-center text-stone-400">
                            -
                          </td>
                        );
                      }
                      return (
                        <td key={visit.id} className="px-2 py-2 text-center">
                          <span
                            title={marker.painType ?? undefined}
                            className="inline-block w-8 rounded py-0.5 font-medium"
                            style={{
                              background: painColor(marker.painLevel),
                              color: painTextColor(marker.painLevel),
                            }}
                          >
                            {marker.painLevel}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
