"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  ClipboardList,
  ClipboardPlus,
  FileDown,
  LineChart,
  ListPlus,
  Pencil,
} from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { EmptyMessage, ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { VisitStatusBadge } from "@/components/visit-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { ageFrom, formatDate, sexLabels } from "@/lib/format";
import { formatScore, interpretScore } from "@/lib/outcomes";
import type { ExercisePlanSummary, OutcomeMeasure, Patient, Visit } from "@/lib/types";

export default function PatientPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [visitsError, setVisitsError] = useState<string | null>(null);
  const [plans, setPlans] = useState<ExercisePlanSummary[] | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<OutcomeMeasure[] | null>(null);
  const [outcomesError, setOutcomesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch(`/patients/${id}`);
        if (!response.ok) {
          setError("Nie znaleziono pacjenta.");
          return;
        }
        setPatient((await response.json()) as Patient);
        const visitsResponse = await apiFetch(`/patients/${id}/visits`);
        if (visitsResponse.ok) {
          setVisits((await visitsResponse.json()) as Visit[]);
        } else {
          setVisitsError("Nie udało się pobrać listy wizyt.");
        }
        const plansResponse = await apiFetch(`/patients/${id}/plans`);
        if (plansResponse.ok) {
          setPlans((await plansResponse.json()) as ExercisePlanSummary[]);
        } else {
          setPlansError("Nie udało się pobrać zestawów zaleceń.");
        }
        const outcomesResponse = await apiFetch(`/patients/${id}/outcomes`);
        if (outcomesResponse.ok) {
          setOutcomes((await outcomesResponse.json()) as OutcomeMeasure[]);
        } else {
          setOutcomesError("Nie udało się pobrać pomiarów.");
        }
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id]);

  // link <a href> nie wysle tokenu, wiec PDF pobieramy fetchem jak w zestawach zalecen
  async function downloadDocumentation() {
    setExportError(null);
    try {
      const response = await apiFetch(`/patients/${id}/documentation`);
      if (!response.ok) {
        setExportError("Nie udało się wygenerować kopii dokumentacji.");
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `dokumentacja-${patient?.lastName ?? "pacjenta"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Brak połączenia z API.");
    }
  }

  async function archive() {
    try {
      const response = await apiFetch(`/patients/${id}/archive`, { method: "POST" });
      if (!response.ok) {
        setError("Nie udało się zarchiwizować pacjenta.");
        return;
      }
      router.push("/patients");
    } catch {
      setError("Brak połączenia z API.");
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <PageHeader title="Karta pacjenta" backHref="/patients" backLabel="Pacjenci" />
        <ErrorMessage message={error} />
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <LoadingRows rows={6} />
      </main>
    );
  }

  const details = [
    ["PESEL", patient.pesel],
    ["Data urodzenia", patient.birthDate ? formatDate(patient.birthDate) : null],
    ["Płeć", patient.sex ? sexLabels[patient.sex] : null],
    ["Telefon", patient.phone],
    ["E-mail", patient.email],
    ["Adres", patient.address],
  ] as const;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        backHref="/patients"
        backLabel="Pacjenci"
        description={
          <span className="flex flex-wrap gap-2">
            {patient.birthDate && (
              <Badge variant="outline">{ageFrom(patient.birthDate)} lat</Badge>
            )}
            {patient.sex && <Badge variant="outline">{sexLabels[patient.sex]}</Badge>}
            {patient.archivedAt && <Badge variant="destructive">Zarchiwizowany</Badge>}
          </span>
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/patients/${patient.id}/history`}>
                <LineChart />
                Historia bólu
              </Link>
            </Button>
            <Button variant="outline" onClick={downloadDocumentation}>
              <FileDown />
              Kopia dokumentacji
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/patients/${patient.id}/edit`}>
                <Pencil />
                Edytuj
              </Link>
            </Button>
            <ConfirmButton
              label={
                <>
                  <Archive />
                  Archiwizuj
                </>
              }
              title="Zarchiwizować pacjenta?"
              description="Pacjent zniknie z listy, ale jego dokumentacja zostanie zachowana."
              confirmLabel="Archiwizuj"
              variant="destructive"
              onConfirm={archive}
            />
          </>
        }
      />
      {exportError && (
        <div className="mb-6">
          <ErrorMessage message={exportError} />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Dane pacjenta</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium break-words">{value ?? "-"}</dd>
                </div>
              ))}
              {patient.notes && (
                <div>
                  <dt className="text-muted-foreground">Notatki</dt>
                  <dd className="whitespace-pre-wrap">{patient.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
        {/* min-w-0, bo szeroka tabela rozpychalaby kolumne siatki poza ekran */}
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wizyty</CardTitle>
              <CardAction>
                <Button size="sm" asChild>
                  <Link href={`/patients/${patient.id}/visits/new`}>
                    <ClipboardPlus />
                    Nowa wizyta
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {visitsError ? (
                <ErrorMessage message={visitsError} />
              ) : visits === null ? (
                <LoadingRows />
              ) : visits.length === 0 ? (
                <EmptyMessage>Nie ma jeszcze żadnych wizyt.</EmptyMessage>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Rozpoznanie</TableHead>
                      <TableHead className="hidden md:table-cell">Terapeuta</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((visit) => (
                      <TableRow
                        key={visit.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/visits/${visit.id}`)}
                      >
                        <TableCell className="tabular-nums">
                          <Link href={`/visits/${visit.id}`} className="hover:underline">
                            {formatDate(visit.visitDate)}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-56 truncate">
                          {visit.icd10Code && (
                            <span className="mr-1 font-medium">{visit.icd10Code}</span>
                          )}
                          <span className="text-muted-foreground">{visit.diagnosis ?? "-"}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {visit.therapist.fullName}
                        </TableCell>
                        <TableCell>
                          <VisitStatusBadge closedAt={visit.closedAt} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Zestawy zaleceń</CardTitle>
              <CardAction>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/patients/${patient.id}/plans/new`}>
                    <ListPlus />
                    Nowy zestaw
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {plansError ? (
                <ErrorMessage message={plansError} />
              ) : plans === null ? (
                <LoadingRows />
              ) : plans.length === 0 ? (
                <EmptyMessage>Nie ma jeszcze żadnych zestawów.</EmptyMessage>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wydano</TableHead>
                      <TableHead>Terapeuta</TableHead>
                      <TableHead>Liczba ćwiczeń</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow
                        key={plan.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/plans/${plan.id}`)}
                      >
                        <TableCell className="tabular-nums">
                          <Link href={`/plans/${plan.id}`} className="hover:underline">
                            {formatDate(plan.createdAt)}
                          </Link>
                        </TableCell>
                        <TableCell>{plan.therapist.fullName}</TableCell>
                        <TableCell>{plan._count.items}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Kwestionariusze niepełnosprawności</CardTitle>
              <CardAction className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/patients/${patient.id}/outcomes/odi`}>
                    <ClipboardList />
                    ODI
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/patients/${patient.id}/outcomes/ndi`}>
                    <ClipboardList />
                    NDI
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {outcomesError ? (
                <ErrorMessage message={outcomesError} />
              ) : outcomes === null ? (
                <LoadingRows />
              ) : outcomes.length === 0 ? (
                <EmptyMessage>
                  Brak pomiarów. ODI służy do bólu lędźwi, NDI do bólu szyi.
                </EmptyMessage>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Kwestionariusz</TableHead>
                      <TableHead>Wynik</TableHead>
                      <TableHead className="hidden md:table-cell">Interpretacja</TableHead>
                      <TableHead>Zmiana</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outcomes
                      .map((measure, index) => {
                        // zmiana wzgledem poprzedniego pomiaru tym samym kwestionariuszem
                        const previous = outcomes
                          .slice(0, index)
                          .filter((other) => other.type === measure.type)
                          .at(-1);
                        return { measure, change: previous ? measure.score - previous.score : null };
                      })
                      .reverse()
                      .map(({ measure, change }) => (
                        <TableRow key={measure.id}>
                          <TableCell className="tabular-nums">
                            {formatDate(measure.createdAt)}
                          </TableCell>
                          <TableCell>{measure.type}</TableCell>
                          <TableCell className="font-medium tabular-nums">
                            {formatScore(measure.type, measure.score)}
                          </TableCell>
                          <TableCell className="hidden text-muted-foreground md:table-cell">
                            {interpretScore(measure.type, measure.score)}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {change === null || change === 0 ? (
                              <span className="text-muted-foreground">-</span>
                            ) : change < 0 ? (
                              <span className="inline-flex items-center gap-1 text-primary">
                                <ArrowDown className="size-4" aria-label="poprawa" />
                                {change}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-destructive">
                                <ArrowUp className="size-4" aria-label="pogorszenie" />+{change}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
