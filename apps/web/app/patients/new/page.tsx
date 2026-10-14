"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PatientForm, toPatientPayload, type PatientFormValues } from "@/components/patient-form";
import { apiFetch, errorMessage } from "@/lib/api";
import type { Patient } from "@/lib/types";

export default function NewPatientPage() {
  const router = useRouter();

  async function save(values: PatientFormValues) {
    const response = await apiFetch("/patients", {
      method: "POST",
      body: JSON.stringify(toPatientPayload(values)),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Nie udało się zapisać pacjenta."));
    }
    const patient = (await response.json()) as Patient;
    router.push(`/patients/${patient.id}`);
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader title="Nowy pacjent" backHref="/patients" backLabel="Pacjenci" />
      <PatientForm submitLabel="Dodaj pacjenta" onSave={save} />
    </main>
  );
}
