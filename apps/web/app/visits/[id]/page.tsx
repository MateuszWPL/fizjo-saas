"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { visitFields } from "@/components/visit-form";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { VisitDetail } from "@/lib/types";

export default function VisitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<VisitDetail | null>(null);
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
    </main>
  );
}
