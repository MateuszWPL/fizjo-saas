"use client";

import { useState } from "react";
import { ErrorMessage } from "@/components/load-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

export interface ExerciseFormValues {
  name: string;
  description: string;
  defaultSets: string;
  defaultReps: string;
}

export function toExercisePayload(values: ExerciseFormValues) {
  return {
    name: values.name,
    description: values.description || null,
    defaultSets: values.defaultSets ? Number(values.defaultSets) : null,
    defaultReps: values.defaultReps ? Number(values.defaultReps) : null,
  };
}

export async function uploadExerciseImage(id: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const response = await apiFetch(`/exercises/${id}/image`, { method: "POST", body: form });
  if (response.status === 400) {
    throw new Error("Nieprawidłowy plik obrazka. Dozwolone są JPG, PNG i WebP do 5 MB.");
  }
  if (!response.ok) {
    throw new Error("Upload obrazka nie powiódł się.");
  }
}

interface ExerciseFormProps {
  initial?: ExerciseFormValues;
  submitLabel: string;
  onSave: (values: ExerciseFormValues, file: File | null) => Promise<void>;
}

const emptyValues: ExerciseFormValues = {
  name: "",
  description: "",
  defaultSets: "",
  defaultReps: "",
};

export function ExerciseForm({ initial, submitLabel, onSave }: ExerciseFormProps) {
  const [values, setValues] = useState<ExerciseFormValues>(initial ?? emptyValues);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set(field: keyof ExerciseFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSave(values, file);
    } catch (saveError) {
      setError(
        saveError instanceof Error && saveError.message
          ? saveError.message
          : "Nie udało się zapisać ćwiczenia.",
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa</Label>
            <Input
              id="name"
              required
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Opis wykonania</Label>
            <Textarea
              id="description"
              rows={4}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultSets">Domyślne serie</Label>
              <Input
                id="defaultSets"
                type="number"
                min={1}
                max={99}
                value={values.defaultSets}
                onChange={(e) => set("defaultSets", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultReps">Domyślne powtórzenia</Label>
              <Input
                id="defaultReps"
                type="number"
                min={1}
                max={99}
                value={values.defaultReps}
                onChange={(e) => set("defaultReps", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Obrazek (JPG, PNG lub WebP, do 5 MB)</Label>
            <Input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </CardContent>
      </Card>
      {error && <ErrorMessage message={error} />}
      <Button type="submit" disabled={pending}>
        {pending ? "Zapisywanie..." : submitLabel}
      </Button>
    </form>
  );
}
