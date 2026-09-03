"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { PatientForm, toPatientPayload, type PatientFormValues } from "@/components/patient-form";
import { apiFetch } from "@/lib/api";
import type { Patient } from "@/lib/types";

export default function NewPatientPage() {
  const router = useRouter();

  async function save(values: PatientFormValues) {
    const response = await apiFetch("/patients", {
      method: "POST",
      body: JSON.stringify(toPatientPayload(values)),
    });
    if (!response.ok) {
      throw new Error("Zapis nie powiódł się");
    }
    const patient = (await response.json()) as Patient;
    router.push(`/patients/${patient.id}`);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/patients" className="text-sm text-stone-500 underline hover:text-stone-700">
        Wróć do listy
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-stone-800">Nowy pacjent</h1>
      <div className="mt-4">
        <PatientForm submitLabel="Dodaj pacjenta" onSave={save} />
      </div>
    </main>
  );
}
