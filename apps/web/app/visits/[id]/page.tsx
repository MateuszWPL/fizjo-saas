"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Lock, Pencil } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { VisitBodyMap, type MarkerFormValues } from "@/components/visit-body-map";
import { visitFields } from "@/components/visit-form";
import { VisitStatusBadge } from "@/components/visit-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { BodyMarker, VisitAmendment, VisitDetail } from "@/lib/types";

export default function VisitPage() {
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [markers, setMarkers] = useState<BodyMarker[] | null>(null);
  const [markersError, setMarkersError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amendment, setAmendment] = useState("");
  const [amendmentError, setAmendmentError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch(`/visits/${id}`);
        if (!response.ok) {
          setError("Nie znaleziono wizyty.");
          return;
        }
        setVisit((await response.json()) as VisitDetail);
        const markersResponse = await apiFetch(`/visits/${id}/markers`);
        if (!markersResponse.ok) {
          setMarkersError("Nie udało się pobrać mapy bólu.");
          return;
        }
        setMarkers((await markersResponse.json()) as BodyMarker[]);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id]);

  async function close() {
    try {
      const response = await apiFetch(`/visits/${id}/close`, { method: "POST" });
      if (!response.ok) {
        setError("Nie udało się zamknąć wizyty.");
        return;
      }
      const updated = (await response.json()) as { closedAt: string | null };
      setVisit((current) => (current ? { ...current, closedAt: updated.closedAt } : current));
    } catch {
      setError("Brak połączenia z API.");
    }
  }

  async function saveMarker(group: string, values: MarkerFormValues) {
    const response = await apiFetch(`/visits/${id}/markers/${group}`, {
      method: "PUT",
      body: JSON.stringify({
        painLevel: values.painLevel,
        painType: values.painType || null,
        note: values.note || null,
      }),
    });
    if (!response.ok) {
      throw new Error("Zapis nie powiódł się");
    }
    const saved = (await response.json()) as BodyMarker;
    setMarkers((current) => {
      if (!current) {
        return current;
      }
      const rest = current.filter((marker) => marker.muscleGroup !== group);
      return [...rest, saved].sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup));
    });
  }

  async function deleteMarker(group: string) {
    const response = await apiFetch(`/visits/${id}/markers/${group}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Usunięcie nie powiodło się");
    }
    setMarkers((current) =>
      current ? current.filter((marker) => marker.muscleGroup !== group) : current,
    );
  }

  async function addAmendment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAmendmentError(null);
    try {
      const response = await apiFetch(`/visits/${id}/amendments`, {
        method: "POST",
        body: JSON.stringify({ content: amendment }),
      });
      if (!response.ok) {
        setAmendmentError(await errorMessage(response, "Nie udało się dodać adnotacji."));
        return;
      }
      const saved = (await response.json()) as VisitAmendment;
      setVisit((current) =>
        current ? { ...current, amendments: [...current.amendments, saved] } : current,
      );
      setAmendment("");
    } catch {
      setAmendmentError("Brak połączenia z API.");
    }
  }

  if (error && !visit) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <PageHeader title="Karta wizyty" backHref="/patients" backLabel="Pacjenci" />
        <ErrorMessage message={error} />
      </main>
    );
  }

  if (!visit) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <LoadingRows rows={8} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        title={`Wizyta ${formatDate(visit.visitDate)}`}
        backHref={`/patients/${visit.patient.id}`}
        backLabel={`${visit.patient.firstName} ${visit.patient.lastName}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <VisitStatusBadge closedAt={visit.closedAt} />
            <span>
              prowadzi {visit.therapist.fullName}
              {visit.therapist.licenseNumber && `, PWZFz ${visit.therapist.licenseNumber}`}
            </span>
          </span>
        }
        actions={
          !visit.closedAt && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/visits/${visit.id}/edit`}>
                  <Pencil />
                  Edytuj
                </Link>
              </Button>
              <ConfirmButton
                label={
                  <>
                    <Lock />
                    Zamknij wizytę
                  </>
                }
                title="Zamknąć wizytę?"
                description="Zamknięta wizyta staje się wpisem niemodyfikowalnym. Późniejsze poprawki można dodać tylko jako adnotacje z autorem i datą."
                confirmLabel="Zamknij wizytę"
                variant="default"
                onConfirm={close}
              />
            </>
          )
        }
      />
      {error && <ErrorMessage message={error} />}
      <Card>
        <CardHeader>
          <CardTitle>Mapa bólu</CardTitle>
          <CardDescription>
            {visit.closedAt
              ? "Wizyta jest zamknięta, mapa jest tylko do odczytu."
              : "Zaznacz bolesne mięśnie i oceń natężenie bólu w skali NRS."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {markersError ? (
            <ErrorMessage message={markersError} />
          ) : markers === null ? (
            <LoadingRows rows={4} />
          ) : (
            <VisitBodyMap
              markers={markers}
              readOnly={Boolean(visit.closedAt)}
              onSave={saveMarker}
              onDelete={deleteMarker}
            />
          )}
        </CardContent>
      </Card>
      <div className={visit.closedAt ? "grid gap-6 lg:grid-cols-[1fr_22rem]" : undefined}>
        <Card>
          <CardHeader>
            <CardTitle>Opis wizyty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visitFields.map(([field, label]) => (
              <section key={field}>
                <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {label}
                  {field === "diagnosis" && visit.icd10Code && (
                    <Badge variant="outline">ICD-10 {visit.icd10Code}</Badge>
                  )}
                </h3>
                {visit[field] ? (
                  <p className="mt-1 max-w-prose text-sm whitespace-pre-wrap">{visit[field]}</p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Nie uzupełniono.</p>
                )}
              </section>
            ))}
          </CardContent>
        </Card>
        {visit.closedAt && (
          <Card className="self-start">
            <CardHeader>
              <CardTitle>Adnotacje</CardTitle>
              <CardDescription>
                Poprawki do zamkniętej wizyty. Treść wpisu się nie zmienia, adnotacja go uzupełnia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {visit.amendments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak adnotacji.</p>
              ) : (
                <ul className="space-y-3">
                  {visit.amendments.map((item) => (
                    <li key={item.id} className="rounded-md border p-3 text-sm">
                      <p className="whitespace-pre-wrap">{item.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.author.fullName}, {new Date(item.createdAt).toLocaleString("pl-PL")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <form onSubmit={addAmendment} className="space-y-2">
                <Label htmlFor="amendment">Nowa adnotacja</Label>
                <Textarea
                  id="amendment"
                  rows={3}
                  required
                  value={amendment}
                  onChange={(e) => setAmendment(e.target.value)}
                />
                {amendmentError && <ErrorMessage message={amendmentError} />}
                <Button type="submit" size="sm">
                  Dodaj adnotację
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
