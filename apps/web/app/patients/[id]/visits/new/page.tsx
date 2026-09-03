"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { VisitForm, toVisitPayload, type VisitFormValues } from "@/components/visit-form";
import { apiFetch } from "@/lib/api";

export default function NewVisitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const initial: VisitFormValues = {
    visitDate: new Date().toISOString().slice(0, 10),
    interview: "",
    examination: "",
    diagnosis: "",
    recommendations: "",
  };

  async function save(values: VisitFormValues) {
    const response = await apiFetch(`/patients/${id}/visits`, {
      method: "POST",
      body: JSON.stringify(toVisitPayload(values)),
    });
    if (!response.ok) {
      throw new Error("Zapis nie powiódł się");
    }
    const visit = (await response.json()) as { id: string };
    router.push(`/visits/${visit.id}`);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link
        href={`/patients/${id}`}
        className="text-sm text-stone-500 underline hover:text-stone-700"
      >
        Wróć do pacjenta
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-stone-800">Nowa wizyta</h1>
      <div className="mt-4">
        <VisitForm initial={initial} submitLabel="Dodaj wizytę" onSave={save} />
      </div>
    </main>
  );
}
