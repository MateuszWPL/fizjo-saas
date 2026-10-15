"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  VisitForm,
  toVisitPayload,
  visitFields,
  type VisitFormValues,
} from "@/components/visit-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Patient, Visit } from "@/lib/types";

// toISOString liczy w UTC, wiec tuz po polnocy dawalby wczorajsza date
function todayLocal() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function PreviousVisit({ visit }: { visit: Visit | null }) {
  return (
    <Card className="self-start">
      <CardHeader>
        <CardTitle>Poprzednia wizyta</CardTitle>
        <CardDescription>
          {visit ? (
            <Link href={`/visits/${visit.id}`} className="hover:underline">
              {formatDate(visit.visitDate)}, {visit.therapist.fullName}
            </Link>
          ) : (
            "To pierwsza wizyta pacjenta."
          )}
        </CardDescription>
      </CardHeader>
      {visit && (
        <CardContent className="space-y-3 text-sm">
          {visitFields
            .filter(([field]) => field !== "interview" && visit[field])
            .map(([field, label]) => (
              <section key={field}>
                <h3 className="flex items-center gap-2 text-muted-foreground">
                  {label}
                  {field === "diagnosis" && visit.icd10Code && (
                    <Badge variant="outline">{visit.icd10Code}</Badge>
                  )}
                </h3>
                <p className="line-clamp-4 whitespace-pre-wrap">{visit[field]}</p>
              </section>
            ))}
        </CardContent>
      )}
    </Card>
  );
}

export default function NewVisitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  // undefined: jeszcze sie laduje, null: pacjent nie ma wizyt
  const [previous, setPrevious] = useState<Visit | null | undefined>(undefined);
  const [previousError, setPreviousError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [patientResponse, visitsResponse] = await Promise.all([
          apiFetch(`/patients/${id}`),
          apiFetch(`/patients/${id}/visits`),
        ]);
        if (patientResponse.ok) {
          setPatient((await patientResponse.json()) as Patient);
        }
        if (!visitsResponse.ok) {
          setPreviousError(true);
          return;
        }
        const visits = (await visitsResponse.json()) as Visit[];
        setPrevious(visits[0] ?? null);
      } catch {
        setPreviousError(true);
      }
    }
    load();
  }, [id]);

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
      <PageHeader
        title={patient ? `Nowa wizyta: ${patient.firstName} ${patient.lastName}` : "Nowa wizyta"}
        backHref={`/patients/${id}`}
        backLabel="Karta pacjenta"
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <VisitForm initial={initial} submitLabel="Zapisz wizytę" onSave={save} />
        {previousError ? (
          <p className="text-sm text-muted-foreground">Nie udało się pobrać poprzedniej wizyty.</p>
        ) : (
          previous !== undefined && <PreviousVisit visit={previous} />
        )}
      </div>
    </main>
  );
}
