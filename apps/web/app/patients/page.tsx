"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import { EmptyMessage, ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { ageFrom, formatDate } from "@/lib/format";
import type { Patient } from "@/lib/types";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const response = await apiFetch(`/patients${query}`);
        if (!response.ok) {
          setError("Nie udało się pobrać listy pacjentów.");
          return;
        }
        setError(null);
        setPatients((await response.json()) as Patient[]);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [search]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title="Pacjenci"
        description="Aktywni pacjenci gabinetu. Zarchiwizowani nie pojawiają się na liście."
        actions={
          <Button asChild>
            <Link href="/patients/new">
              <UserPlus />
              Dodaj pacjenta
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj po imieniu lub nazwisku"
              className="pl-8"
            />
          </div>
          {error ? (
            <ErrorMessage message={error} />
          ) : patients === null ? (
            <LoadingRows />
          ) : patients.length === 0 ? (
            <EmptyMessage>
              {search ? "Brak wyników dla tego wyszukiwania." : "Nie ma jeszcze żadnych pacjentów."}
            </EmptyMessage>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwisko i imię</TableHead>
                  <TableHead>Wiek</TableHead>
                  <TableHead>PESEL</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>E-mail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/patients/${patient.id}`)}
                  >
                    <TableCell className="font-medium">
                      {patient.lastName} {patient.firstName}
                    </TableCell>
                    <TableCell>
                      {patient.birthDate ? (
                        <span title={formatDate(patient.birthDate)}>
                          {ageFrom(patient.birthDate)} l.
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">{patient.pesel ?? "-"}</TableCell>
                    <TableCell className="tabular-nums">{patient.phone ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{patient.email ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
