"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { visitFields } from "@/components/visit-form";
import { VisitBodyMap, type MarkerFormValues } from "@/components/visit-body-map";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { BodyMarker, VisitDetail } from "@/lib/types";

export default function VisitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [markers, setMarkers] = useState<BodyMarker[] | null>(null);
  const [markersError, setMarkersError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        const response = await apiFetch(`/visits/${id}`);
        if (!response.ok) {
          setError("Nie znaleziono wizyty.");
          return;
        }
        setVisit((await response.json()) as VisitDetail);
        const markersResponse = await apiFetch(`/visits/${id}/markers`);
        if (!markersResponse.ok) {
          setMarkersError("Nie udało się pobrać mapy bólu.");
          return;
        }
        setMarkers((await markersResponse.json()) as BodyMarker[]);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id, router]);

  async function close() {
    if (!window.confirm("Zamknąć wizytę? Zamkniętej wizyty nie da się już edytować.")) {
      return;
    }
    const response = await apiFetch(`/visits/${id}/close`, { method: "POST" });
    if (!response.ok) {
      setError("Nie udało się zamknąć wizyty.");
      return;
    }
    const updated = (await response.json()) as { closedAt: string | null };
    setVisit((current) => (current ? { ...current, closedAt: updated.closedAt } : current));
  }

  async function saveMarker(group: string, values: MarkerFormValues) {
    const response = await apiFetch(`/visits/${id}/markers/${group}`, {
      method: "PUT",
      body: JSON.stringify({
        painLevel: values.painLevel,
        painType: values.painType || null,
        note: values.note || null,
      }),
    });
    if (!response.ok) {
      throw new Error("Zapis nie powiódł się");
    }
    const saved = (await response.json()) as BodyMarker;
    setMarkers((current) => {
      if (!current) {
        return current;
      }
      const rest = current.filter((marker) => marker.muscleGroup !== group);
      return [...rest, saved].sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup));
    });
  }

  async function deleteMarker(group: string) {
    const response = await apiFetch(`/visits/${id}/markers/${group}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Usunięcie nie powiodło się");
    }
    setMarkers((current) =>
      current ? current.filter((marker) => marker.muscleGroup !== group) : current,
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-red-700">{error}</p>
        <Link href="/patients" className="mt-2 inline-block text-sm text-stone-500 underline">
          Wróć do pacjentów
        </Link>
      </main>
    );
  }

  if (!visit) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-stone-500">Ładowanie...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link
        href={`/patients/${visit.patient.id}`}
        className="text-sm text-stone-500 underline hover:text-stone-700"
      >
        Wróć do pacjenta
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">
          Wizyta {new Date(visit.visitDate).toLocaleDateString("pl-PL")}
        </h1>
        {!visit.closedAt && (
          <div className="flex gap-3 text-sm">
            <Link
              href={`/visits/${visit.id}/edit`}
              className="text-stone-800 underline hover:text-stone-600"
            >
              Edytuj
            </Link>
            <button onClick={close} className="text-red-700 underline hover:text-red-800">
              Zamknij wizytę
            </button>
          </div>
        )}
      </div>
      <p className="mt-1 text-sm text-stone-600">
        {visit.patient.lastName} {visit.patient.firstName}, prowadzi {visit.therapist.fullName}
      </p>
      {visit.closedAt && (
        <p className="mt-2 text-sm text-amber-700">
          Wizyta zamknięta {new Date(visit.closedAt).toLocaleDateString("pl-PL")}, wpis
          niemodyfikowalny.
        </p>
      )}
      <div className="mt-4 max-w-xl space-y-4">
        {visitFields.map(([field, label]) => (
          <section key={field}>
            <h2 className="text-sm font-medium text-stone-500">{label}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-stone-800">
              {visit[field] || "-"}
            </p>
          </section>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="font-medium text-stone-800">Mapa bólu</h2>
        {markersError ? (
          <p className="mt-2 text-sm text-red-700">{markersError}</p>
        ) : markers === null ? (
          <p className="mt-2 text-sm text-stone-500">Ładowanie...</p>
        ) : (
          <div className="mt-4">
            <VisitBodyMap
              markers={markers}
              readOnly={Boolean(visit.closedAt)}
              onSave={saveMarker}
              onDelete={deleteMarker}
            />
          </div>
        )}
      </div>
    </main>
  );
}
