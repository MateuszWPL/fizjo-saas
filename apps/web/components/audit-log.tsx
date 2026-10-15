"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyMessage, ErrorMessage, LoadingRows } from "@/components/load-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { AuditAction, AuditEvent } from "@/lib/types";

const actionLabels: Record<AuditAction, string> = {
  PATIENT_VIEWED: "Wgląd w kartę pacjenta",
  PATIENT_CREATED: "Dodanie pacjenta",
  PATIENT_UPDATED: "Zmiana danych pacjenta",
  PATIENT_ARCHIVED: "Archiwizacja pacjenta",
  PATIENT_EXPORTED: "Eksport kopii dokumentacji",
  VISIT_VIEWED: "Wgląd w wizytę",
  VISIT_CREATED: "Nowa wizyta",
  VISIT_UPDATED: "Edycja wizyty",
  VISIT_CLOSED: "Zamknięcie wizyty",
  VISIT_AMENDED: "Adnotacja do wizyty",
  PLAN_CREATED: "Nowy zestaw zaleceń",
  PLAN_PDF_DOWNLOADED: "Pobranie PDF zaleceń",
  PLAN_EMAILED: "Wysyłka zaleceń e-mailem",
  OUTCOME_RECORDED: "Pomiar kwestionariuszem",
  THERAPIST_CREATED: "Nowe konto terapeuty",
  THERAPIST_DEACTIVATED: "Dezaktywacja konta",
  THERAPIST_RESTORED: "Przywrócenie konta",
};

export function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch("/audit-events");
        if (!response.ok) {
          setError("Nie udało się pobrać dziennika zdarzeń.");
          return;
        }
        setEvents((await response.json()) as AuditEvent[]);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dziennik zdarzeń</CardTitle>
        <CardDescription>
          Kto i kiedy miał wgląd w dokumentację albo ją zmienił. Ostatnie 200 wpisów, wpisów nie da
          się edytować ani usuwać.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorMessage message={error} />
        ) : events === null ? (
          <LoadingRows />
        ) : events.length === 0 ? (
          <EmptyMessage>Dziennik jest pusty.</EmptyMessage>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kiedy</TableHead>
                <TableHead>Kto</TableHead>
                <TableHead>Zdarzenie</TableHead>
                <TableHead className="hidden sm:table-cell">Dotyczy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="tabular-nums">
                    {new Date(event.createdAt).toLocaleString("pl-PL", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>{event.actor.fullName}</TableCell>
                  <TableCell>{actionLabels[event.action]}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {event.patient ? (
                      <Link href={`/patients/${event.patient.id}`} className="hover:underline">
                        {event.patient.lastName} {event.patient.firstName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{event.details ?? "-"}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
