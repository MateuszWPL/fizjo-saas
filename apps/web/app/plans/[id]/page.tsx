"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Download, Mail, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ExercisePlan } from "@/lib/types";

export default function PlanPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<ExercisePlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch(`/plans/${id}`);
        if (!response.ok) {
          setError("Nie znaleziono zestawu zaleceń.");
          return;
        }
        setPlan((await response.json()) as ExercisePlan);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id]);

  // link <a href> nie wysle tokenu, wiec PDF pobieramy fetchem i podajemy
  // przegladarce jako tymczasowy URL do pliku
  async function downloadPdf() {
    setError(null);
    try {
      const response = await apiFetch(`/plans/${id}/pdf`);
      if (!response.ok) {
        setError("Nie udało się wygenerować PDF.");
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "zalecenia.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Brak połączenia z API.");
    }
  }

  async function sendEmail() {
    setSending(true);
    setError(null);
    setSentTo(null);
    try {
      const response = await apiFetch(`/plans/${id}/send`, { method: "POST" });
      if (!response.ok) {
        setError(await errorMessage(response, "Nie udało się wysłać e-maila."));
      } else {
        setSentTo(((await response.json()) as { sentTo: string }).sentTo);
      }
    } catch {
      setError("Brak połączenia z API.");
    }
    setSending(false);
  }

  async function remove() {
    if (!plan) {
      return;
    }
    try {
      const response = await apiFetch(`/plans/${id}`, { method: "DELETE" });
      if (!response.ok) {
        setError("Nie udało się usunąć zestawu.");
        return;
      }
      router.push(`/patients/${plan.patient.id}`);
    } catch {
      setError("Brak połączenia z API.");
    }
  }

  if (!plan) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        {error ? (
          <>
            <PageHeader title="Zestaw zaleceń" backHref="/patients" backLabel="Pacjenci" />
            <ErrorMessage message={error} />
          </>
        ) : (
          <LoadingRows rows={5} />
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        title={`Zestaw zaleceń z ${formatDate(plan.createdAt)}`}
        backHref={`/patients/${plan.patient.id}`}
        backLabel={`${plan.patient.firstName} ${plan.patient.lastName}`}
        description={`Wydał ${plan.therapist.fullName}`}
        actions={
          <>
            <Button variant="outline" onClick={downloadPdf}>
              <Download />
              Pobierz PDF
            </Button>
            <ConfirmButton
              label={
                <>
                  <Mail />
                  {sending ? "Wysyłanie..." : "Wyślij e-mailem"}
                </>
              }
              title="Wysłać zalecenia?"
              description={`PDF z zaleceniami trafi na adres ${plan.patient.email ?? ""}.`}
              confirmLabel="Wyślij"
              disabled={!plan.patient.email || sending}
              onConfirm={sendEmail}
            />
            <ConfirmButton
              label={
                <>
                  <Trash2 />
                  Usuń
                </>
              }
              title="Usunąć zestaw zaleceń?"
              description="Zestaw zniknie z karty pacjenta."
              confirmLabel="Usuń"
              variant="destructive"
              onConfirm={remove}
            />
          </>
        }
      />
      {error && <ErrorMessage message={error} />}
      {sentTo && (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>Wysłano zalecenia na {sentTo}.</AlertDescription>
        </Alert>
      )}
      {!plan.patient.email && (
        <p className="text-sm text-muted-foreground">
          Żeby wysłać zalecenia e-mailem, dodaj adres w danych pacjenta.
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Ćwiczenia</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Lp.</TableHead>
                <TableHead>Ćwiczenie</TableHead>
                <TableHead>Serie x powt.</TableHead>
                <TableHead>Uwagi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.items.map((item, index) => (
                <TableRow key={item.id} className="align-top">
                  <TableCell className="text-muted-foreground">{index + 1}.</TableCell>
                  <TableCell className="whitespace-normal">
                    <p className="font-medium">{item.exercise.name}</p>
                    {item.exercise.description && (
                      <p className="mt-0.5 text-muted-foreground">{item.exercise.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.sets || item.reps ? `${item.sets ?? "-"} x ${item.reps ?? "-"}` : "-"}
                  </TableCell>
                  <TableCell className="whitespace-normal">{item.note ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {plan.note && (
        <Card>
          <CardHeader>
            <CardTitle>Uwagi do zestawu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{plan.note}</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
