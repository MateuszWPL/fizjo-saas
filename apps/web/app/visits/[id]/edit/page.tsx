"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import {
  VisitForm,
  toVisitPayload,
  visitToFormValues,
  type VisitFormValues,
} from "@/components/visit-form";
import { apiFetch, errorMessage } from "@/lib/api";
import type { VisitDetail } from "@/lib/types";

export default function EditVisitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<VisitFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch(`/visits/${id}`);
        if (!response.ok) {
          setError("Nie znaleziono wizyty.");
          return;
        }
        const visit = (await response.json()) as VisitDetail;
        if (visit.closedAt) {
          setError("Zamknięta wizyta jest niemodyfikowalna. Poprawki dodaj jako adnotację.");
          return;
        }
        setInitial(visitToFormValues(visit));
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id]);

  async function save(values: VisitFormValues) {
    const response = await apiFetch(`/visits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toVisitPayload(values)),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Nie udało się zapisać zmian."));
    }
    router.push(`/visits/${id}`);
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader title="Edycja wizyty" backHref={`/visits/${id}`} backLabel="Karta wizyty" />
      {error ? (
        <ErrorMessage message={error} />
      ) : initial === null ? (
        <LoadingRows rows={6} />
      ) : (
        <VisitForm initial={initial} submitLabel="Zapisz zmiany" onSave={save} />
      )}
    </main>
  );
}
