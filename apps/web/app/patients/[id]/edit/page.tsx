"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import {
  PatientForm,
  patientToFormValues,
  toPatientPayload,
  type PatientFormValues,
} from "@/components/patient-form";
import { apiFetch, errorMessage } from "@/lib/api";
import type { Patient } from "@/lib/types";

export default function EditPatientPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<PatientFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch(`/patients/${id}`);
        if (!response.ok) {
          setError("Nie znaleziono pacjenta.");
          return;
        }
        setInitial(patientToFormValues((await response.json()) as Patient));
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id]);

  async function save(values: PatientFormValues) {
    const response = await apiFetch(`/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toPatientPayload(values)),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Nie udało się zapisać zmian."));
    }
    router.push(`/patients/${id}`);
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader title="Edycja pacjenta" backHref={`/patients/${id}`} backLabel="Karta pacjenta" />
      {error ? (
        <ErrorMessage message={error} />
      ) : initial === null ? (
        <LoadingRows rows={6} />
      ) : (
        <PatientForm initial={initial} submitLabel="Zapisz zmiany" onSave={save} />
      )}
    </main>
  );
}
