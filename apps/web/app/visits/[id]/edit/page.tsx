"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { VisitForm, toVisitPayload, type VisitFormValues } from "@/components/visit-form";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { VisitDetail } from "@/lib/types";

export default function EditVisitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<VisitFormValues | null>(null);
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
        const visit = (await response.json()) as VisitDetail;
        if (visit.closedAt) {
          setError("Zamknięta wizyta jest niemodyfikowalna.");
          return;
        }
        setInitial({
          visitDate: visit.visitDate.slice(0, 10),
          interview: visit.interview ?? "",
          examination: visit.examination ?? "",
          diagnosis: visit.diagnosis ?? "",
          recommendations: visit.recommendations ?? "",
        });
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id, router]);

  async function save(values: VisitFormValues) {
    const response = await apiFetch(`/visits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toVisitPayload(values)),
    });
    if (!response.ok) {
      throw new Error("Zapis nie powiódł się");
    }
    router.push(`/visits/${id}`);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link
        href={`/visits/${id}`}
        className="text-sm text-stone-500 underline hover:text-stone-700"
      >
        Wróć do wizyty
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-stone-800">Edycja wizyty</h1>
      <div className="mt-4">
        {error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : initial === null ? (
          <p className="text-sm text-stone-500">Ładowanie...</p>
        ) : (
          <VisitForm initial={initial} submitLabel="Zapisz zmiany" onSave={save} />
        )}
      </div>
    </main>
  );
}
