"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { EmptyMessage, ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/lib/format";
import type { Me, RecentVisit } from "@/lib/types";

function VisitTable({ visits }: { visits: RecentVisit[] }) {
  const router = useRouter();
  return (
    // stale szerokosci, zeby kolumny obu tabel na pulpicie byly wyrownane
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-28">Data</TableHead>
          <TableHead className="w-48">Pacjent</TableHead>
          <TableHead className="hidden sm:table-cell">Rozpoznanie</TableHead>
          <TableHead className="hidden w-48 md:table-cell">Terapeuta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map((visit) => (
          <TableRow
            key={visit.id}
            className="cursor-pointer"
            onClick={() => router.push(`/visits/${visit.id}`)}
          >
            <TableCell className="tabular-nums">{formatDate(visit.visitDate)}</TableCell>
            <TableCell className="font-medium">
              <Link href={`/visits/${visit.id}`} className="hover:underline">
                {visit.patient.lastName} {visit.patient.firstName}
              </Link>
            </TableCell>
            <TableCell className="hidden truncate text-muted-foreground sm:table-cell">
              {visit.diagnosis ?? "-"}
            </TableCell>
            <TableCell className="hidden md:table-cell">{visit.therapist.fullName}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [visits, setVisits] = useState<RecentVisit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const meResponse = await apiFetch("/me");
        if (meResponse.status === 403) {
          setError("Twoje konto zostało dezaktywowane przez właściciela gabinetu.");
          return;
        }
        if (!meResponse.ok) {
          setError("Nie udało się pobrać profilu terapeuty.");
          return;
        }
        setMe((await meResponse.json()) as Me);
        const visitsResponse = await apiFetch("/visits/recent");
        if (!visitsResponse.ok) {
          setError("Nie udało się pobrać ostatnich wizyt.");
          return;
        }
        setVisits((await visitsResponse.json()) as RecentVisit[]);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, []);

  const openVisits = visits?.filter((visit) => !visit.closedAt) ?? [];
  const closedVisits = visits?.filter((visit) => visit.closedAt) ?? [];

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        title={me ? `Dzień dobry, ${me.fullName}` : "Pulpit"}
        description={
          visits === null
            ? "Ostatnia aktywność w gabinecie."
            : openVisits.length > 0
              ? `Wizyty do zamknięcia: ${openVisits.length}.`
              : "Wszystkie ostatnie wizyty są zamknięte."
        }
        actions={
          <Button asChild>
            <Link href="/patients/new">
              <UserPlus />
              Nowy pacjent
            </Link>
          </Button>
        }
      />
      {error ? (
        <ErrorMessage message={error} />
      ) : visits === null ? (
        <LoadingRows rows={6} />
      ) : visits.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyMessage>
              W gabinecie nie ma jeszcze wizyt. Zacznij od dodania pacjenta.
            </EmptyMessage>
          </CardContent>
        </Card>
      ) : (
        <>
          {openVisits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Do zamknięcia</CardTitle>
                <CardDescription>
                  Otwarte wizyty można jeszcze edytować. Po zamknięciu wpis staje się
                  niemodyfikowalny.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VisitTable visits={openVisits} />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Ostatnio zamknięte</CardTitle>
            </CardHeader>
            <CardContent>
              {closedVisits.length === 0 ? (
                <EmptyMessage>Nie ma jeszcze zamkniętych wizyt.</EmptyMessage>
              ) : (
                <VisitTable visits={closedVisits} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
