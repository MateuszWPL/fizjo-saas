"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { Therapist } from "@/lib/types";

interface Stats {
  patients: number;
  visitsThisMonth: number;
}

const emptyForm = { fullName: "", email: "", licenseNumber: "", password: "" };

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [therapists, setTherapists] = useState<Therapist[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loadTherapists = useCallback(async () => {
    const response = await apiFetch("/admin/therapists");
    if (!response.ok) {
      setError("Nie udało się pobrać listy terapeutów.");
      return;
    }
    setTherapists((await response.json()) as Therapist[]);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch("/admin/stats");
        if (response.status === 403) {
          setError("Panel jest dostępny tylko dla właściciela gabinetu.");
          return;
        }
        if (!response.ok) {
          setError("Nie udało się pobrać statystyk.");
          return;
        }
        setStats((await response.json()) as Stats);
        await loadTherapists();
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [loadTherapists]);

  async function toggleActive(therapist: Therapist) {
    setError(null);
    try {
      const response = await apiFetch(`/admin/therapists/${therapist.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !therapist.active }),
      });
      if (!response.ok) {
        setError("Nie udało się zmienić statusu konta.");
        return;
      }
      await loadTherapists();
    } catch {
      setError("Brak połączenia z API.");
    }
  }

  async function createTherapist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    try {
      const response = await apiFetch("/admin/therapists", {
        method: "POST",
        body: JSON.stringify({ ...form, licenseNumber: form.licenseNumber || null }),
      });
      if (response.status === 409) {
        setFormError("Konto z tym adresem e-mail już istnieje.");
      } else if (response.status === 400) {
        setFormError("Sprawdź dane: poprawny e-mail i hasło co najmniej 8 znaków.");
      } else if (!response.ok) {
        setFormError("Nie udało się założyć konta.");
      } else {
        setForm(emptyForm);
        await loadTherapists();
      }
    } catch {
      setFormError("Brak połączenia z API.");
    }
    setPending(false);
  }

  function setField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader title="Panel gabinetu" description="Konta terapeutów i podstawowe liczniki." />
      {error && <ErrorMessage message={error} />}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>Aktywni pacjenci</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">{stats.patients}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Wizyty w tym miesiącu</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {stats.visitsThisMonth}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}
      {!error && (
        <Card>
          <CardHeader>
            <CardTitle>Konta terapeutów</CardTitle>
            <CardDescription>
              Dezaktywowane konto traci dostęp do danych gabinetu, a jego wpisy zostają.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {therapists === null ? (
              <LoadingRows />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imię i nazwisko</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>PWZFz</TableHead>
                    <TableHead>Rola</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {therapists.map((therapist) => (
                    <TableRow key={therapist.id}>
                      <TableCell className="font-medium">{therapist.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {therapist.email ?? "-"}
                      </TableCell>
                      <TableCell className="tabular-nums">{therapist.licenseNumber ?? "-"}</TableCell>
                      <TableCell>
                        {therapist.role === "OWNER" ? "właściciel" : "terapeuta"}
                      </TableCell>
                      <TableCell>
                        {therapist.active ? (
                          <Badge variant="secondary">aktywne</Badge>
                        ) : (
                          <Badge variant="destructive">dezaktywowane</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {therapist.role === "THERAPIST" && (
                          <ConfirmButton
                            label={therapist.active ? "Dezaktywuj" : "Przywróć"}
                            title={
                              therapist.active ? "Dezaktywować konto?" : "Przywrócić konto?"
                            }
                            description={`Konto: ${therapist.fullName}.`}
                            confirmLabel={therapist.active ? "Dezaktywuj" : "Przywróć"}
                            variant={therapist.active ? "destructive" : "outline"}
                            onConfirm={() => toggleActive(therapist)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
      {!error && therapists && (
        <Card>
          <CardHeader>
            <CardTitle>Nowe konto terapeuty</CardTitle>
            <CardDescription>
              Przekaż terapeucie e-mail i hasło startowe, zaloguje się nimi od razu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createTherapist} className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Imię i nazwisko</Label>
                <Input
                  id="fullName"
                  required
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Numer PWZFz</Label>
                <Input
                  id="licenseNumber"
                  value={form.licenseNumber}
                  onChange={(e) => setField("licenseNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Hasło startowe (min. 8 znaków)</Label>
                <Input
                  id="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                />
              </div>
              {formError && (
                <div className="sm:col-span-2">
                  <ErrorMessage message={formError} />
                </div>
              )}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={pending}>
                  <UserPlus />
                  {pending ? "Zakładanie..." : "Załóż konto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
