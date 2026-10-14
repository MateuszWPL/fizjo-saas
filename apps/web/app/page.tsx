"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import { EmptyMessage, ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { VisitStatusBadge } from "@/components/visit-status-badge";
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

export default function DashboardPage() {
  const router = useRouter();
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

  const openVisits = visits?.filter((visit) => !visit.closedAt).length ?? 0;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title={me ? `Dzień dobry, ${me.fullName}` : "Pulpit"}
        description={
          visits && openVisits > 0
            ? `Otwarte wizyty wśród ostatnich: ${openVisits}. Zamknięta wizyta staje się wpisem niemodyfikowalnym.`
            : "Ostatnia aktywność w gabinecie."
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/patients">
                <Users />
                Lista pacjentów
              </Link>
            </Button>
            <Button asChild>
              <Link href="/patients/new">
                <UserPlus />
                Nowy pacjent
              </Link>
            </Button>
          </>
        }
      />
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ostatnie wizyty</CardTitle>
            <CardDescription>Kliknij wiersz, żeby otworzyć kartę wizyty.</CardDescription>
          </CardHeader>
          <CardContent>
            {visits === null ? (
              <LoadingRows />
            ) : visits.length === 0 ? (
              <EmptyMessage>
                W gabinecie nie ma jeszcze wizyt. Zacznij od dodania pacjenta.
              </EmptyMessage>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Pacjent</TableHead>
                    <TableHead>Rozpoznanie</TableHead>
                    <TableHead>Terapeuta</TableHead>
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
                      <TableCell>{formatDate(visit.visitDate)}</TableCell>
                      <TableCell className="font-medium">
                        {visit.patient.lastName} {visit.patient.firstName}
                      </TableCell>
                      <TableCell className="max-w-64 truncate text-muted-foreground">
                        {visit.diagnosis ?? "-"}
                      </TableCell>
                      <TableCell>{visit.therapist.fullName}</TableCell>
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
      )}
    </main>
  );
}
