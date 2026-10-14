"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { VisitForm, toVisitPayload, type VisitFormValues } from "@/components/visit-form";
import { apiFetch, errorMessage } from "@/lib/api";

// toISOString liczy w UTC, wiec tuz po polnocy dawalby wczorajsza date
function todayLocal() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function NewVisitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const initial: VisitFormValues = {
    visitDate: todayLocal(),
    interview: "",
    examination: "",
    diagnosis: "",
    icd10Code: "",
    treatment: "",
    recommendations: "",
  };

  async function save(values: VisitFormValues) {
    const response = await apiFetch(`/patients/${id}/visits`, {
      method: "POST",
      body: JSON.stringify(toVisitPayload(values)),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Nie udało się zapisać wizyty."));
    }
    const visit = (await response.json()) as { id: string };
    router.push(`/visits/${visit.id}`);
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader title="Nowa wizyta" backHref={`/patients/${id}`} backLabel="Karta pacjenta" />
      <VisitForm initial={initial} submitLabel="Zapisz wizytę" onSave={save} />
    </main>
  );
}
