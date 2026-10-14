"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { BodyMap } from "@/components/body-map";
import { EmptyMessage, ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { PainLegend } from "@/components/pain-legend";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { muscleGroupLabels } from "@/lib/body-map/muscle-groups";
import { fillsFromMarkers, painColor, painTextColor } from "@/lib/body-map/pain-scale";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { PainHistoryVisit, Patient } from "@/lib/types";

export default function PainHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<PainHistoryVisit[] | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const patientResponse = await apiFetch(`/patients/${id}`);
        if (!patientResponse.ok) {
          setError("Nie znaleziono pacjenta.");
          return;
        }
        setPatient((await patientResponse.json()) as Patient);
        const historyResponse = await apiFetch(`/patients/${id}/pain-history`);
        if (!historyResponse.ok) {
          setError("Nie udało się pobrać historii bólu.");
          return;
        }
        const visits = (await historyResponse.json()) as PainHistoryVisit[];
        setHistory(visits);
        if (visits.length > 0) {
          setSelectedVisitId(visits[visits.length - 1].id);
        }
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id]);

  const title = patient ? `Historia bólu: ${patient.firstName} ${patient.lastName}` : "Historia bólu";

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <PageHeader title={title} backHref={`/patients/${id}`} backLabel="Karta pacjenta" />
        <ErrorMessage message={error} />
      </main>
    );
  }

  if (!patient || history === null) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <LoadingRows rows={8} />
      </main>
    );
  }

  const selectedVisit = history.find((visit) => visit.id === selectedVisitId);
  const groupFills = fillsFromMarkers(selectedVisit?.bodyMarkers ?? []);
  const allGroups = [...new Set(history.flatMap((v) => v.bodyMarkers.map((m) => m.muscleGroup)))];
  allGroups.sort((a, b) => muscleGroupLabels[a].localeCompare(muscleGroupLabels[b], "pl"));

  function levelAt(visitIndex: number, group: string) {
    return history?.[visitIndex]?.bodyMarkers.find((m) => m.muscleGroup === group)?.painLevel;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        title={title}
        backHref={`/patients/${id}`}
        backLabel="Karta pacjenta"
        description="Mapa bólu z wybranej wizyty i zmiana natężenia w czasie."
      />
      {history.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyMessage>Żadna wizyta tego pacjenta nie ma jeszcze oznaczeń bólu.</EmptyMessage>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Mapa bólu z wizyty</CardTitle>
              <CardDescription>Wybierz datę wizyty.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {history.map((visit) => (
                  <Button
                    key={visit.id}
                    size="sm"
                    variant={visit.id === selectedVisitId ? "default" : "outline"}
                    onClick={() => setSelectedVisitId(visit.id)}
                  >
                    {formatDate(visit.visitDate)}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                <BodyMap view="front" groupFills={groupFills} />
                <BodyMap view="back" groupFills={groupFills} />
              </div>
              <PainLegend />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Przebieg NRS per mięsień</CardTitle>
              <CardDescription>
                Strzałka pokazuje zmianę względem poprzedniej wizyty, na której mięsień był
                oznaczony.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mięsień</TableHead>
                    {history.map((visit) => (
                      <TableHead key={visit.id} className="text-center">
                        {formatDate(visit.visitDate)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allGroups.map((group) => (
                    <TableRow key={group}>
                      <TableCell className="font-medium">{muscleGroupLabels[group]}</TableCell>
                      {history.map((visit, index) => {
                        const level = levelAt(index, group);
                        if (level === undefined) {
                          return (
                            <TableCell key={visit.id} className="text-center text-muted-foreground">
                              -
                            </TableCell>
                          );
                        }
                        let previous: number | undefined;
                        for (let i = index - 1; i >= 0 && previous === undefined; i--) {
                          previous = levelAt(i, group);
                        }
                        return (
                          <TableCell key={visit.id} className="text-center">
                            <span className="inline-flex items-center gap-1">
                              <span
                                className="inline-block w-8 rounded py-0.5 font-medium"
                                style={{
                                  background: painColor(level),
                                  color: painTextColor(level),
                                }}
                              >
                                {level}
                              </span>
                              {previous !== undefined && level < previous && (
                                <ArrowDown className="size-4 text-primary" aria-label="spadek" />
                              )}
                              {previous !== undefined && level > previous && (
                                <ArrowUp className="size-4 text-destructive" aria-label="wzrost" />
                              )}
                            </span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
