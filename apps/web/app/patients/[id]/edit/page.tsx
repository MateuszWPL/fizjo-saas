"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PatientForm, toPatientPayload, type PatientFormValues } from "@/components/patient-form";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Patient } from "@/lib/types";

export default function EditPatientPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<PatientFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        const response = await apiFetch(`/patients/${id}`);
        if (!response.ok) {
          setError("Nie znaleziono pacjenta.");
          return;
        }
        const patient = (await response.json()) as Patient;
        setInitial({
          firstName: patient.firstName,
          lastName: patient.lastName,
          birthDate: patient.birthDate ? patient.birthDate.slice(0, 10) : "",
          phone: patient.phone ?? "",
          email: patient.email ?? "",
          notes: patient.notes ?? "",
        });
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id, router]);

  async function save(values: PatientFormValues) {
    const response = await apiFetch(`/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toPatientPayload(values)),
    });
    if (!response.ok) {
      throw new Error("Zapis nie powiódł się");
    }
    router.push(`/patients/${id}`);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link
        href={`/patients/${id}`}
        className="text-sm text-stone-500 underline hover:text-stone-700"
      >
        Wróć do pacjenta
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-stone-800">Edycja pacjenta</h1>
      <div className="mt-4">
        {error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : initial === null ? (
          <p className="text-sm text-stone-500">Ładowanie...</p>
        ) : (
          <PatientForm initial={initial} submitLabel="Zapisz zmiany" onSave={save} />
        )}
      </div>
    </main>
  );
}
