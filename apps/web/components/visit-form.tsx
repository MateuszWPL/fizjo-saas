"use client";

import { useState } from "react";
import { ErrorMessage } from "@/components/load-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Visit } from "@/lib/types";

export interface VisitFormValues {
  visitDate: string;
  interview: string;
  examination: string;
  diagnosis: string;
  icd10Code: string;
  treatment: string;
  recommendations: string;
}

// kolejnosc pol jak w karcie indywidualnej opieki fizjoterapeutycznej
export const visitFields = [
  ["interview", "Wywiad"],
  ["examination", "Badanie i stan funkcjonalny"],
  ["diagnosis", "Rozpoznanie"],
  ["treatment", "Postępowanie fizjoterapeutyczne"],
  ["recommendations", "Zalecenia"],
] as const;

export function visitToFormValues(visit: Visit): VisitFormValues {
  return {
    visitDate: visit.visitDate.slice(0, 10),
    interview: visit.interview ?? "",
    examination: visit.examination ?? "",
    diagnosis: visit.diagnosis ?? "",
    icd10Code: visit.icd10Code ?? "",
    treatment: visit.treatment ?? "",
    recommendations: visit.recommendations ?? "",
  };
}

// puste pole jedzie jako null, zeby dalo sie wyczyscic wartosc przy edycji
export function toVisitPayload(values: VisitFormValues) {
  return {
    visitDate: values.visitDate,
    interview: values.interview || null,
    examination: values.examination || null,
    diagnosis: values.diagnosis || null,
    icd10Code: values.icd10Code || null,
    treatment: values.treatment || null,
    recommendations: values.recommendations || null,
  };
}

interface VisitFormProps {
  initial: VisitFormValues;
  submitLabel: string;
  onSave: (values: VisitFormValues) => Promise<void>;
}

export function VisitForm({ initial, submitLabel, onSave }: VisitFormProps) {
  const [values, setValues] = useState<VisitFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set(field: keyof VisitFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSave(values);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nie udało się zapisać wizyty.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Karta wizyty</CardTitle>
          <CardDescription>
            Pola odpowiadają karcie indywidualnej opieki fizjoterapeutycznej. Mapę bólu
            uzupełnisz po zapisaniu wizyty.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="visitDate">Data wizyty</Label>
              <Input
                id="visitDate"
                type="date"
                required
                value={values.visitDate}
                onChange={(e) => set("visitDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icd10Code">Kod rozpoznania ICD-10</Label>
              <Input
                id="icd10Code"
                placeholder="np. M54.5"
                pattern="[A-Z][0-9]{2}(\.[0-9]{1,2})?"
                title="Litera i dwie cyfry, opcjonalnie kropka i podkod, np. M54 albo M54.5"
                value={values.icd10Code}
                onChange={(e) => set("icd10Code", e.target.value.toUpperCase())}
              />
            </div>
          </div>
          {visitFields.map(([field, label]) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{label}</Label>
              <Textarea
                id={field}
                rows={3}
                value={values[field]}
                onChange={(e) => set(field, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      {error && <ErrorMessage message={error} />}
      <Button type="submit" disabled={pending}>
        {pending ? "Zapisywanie..." : submitLabel}
      </Button>
    </form>
  );
}
