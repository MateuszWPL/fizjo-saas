"use client";

import { useState } from "react";
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
  if (!response.ok) {
    throw new Error("Upload obrazka nie powiódł się");
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

const inputClass = "mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm";

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
    } catch {
      setError("Nie udało się zapisać ćwiczenia.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <label className="block text-sm text-stone-700">
        Nazwa
        <input
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="mt-3 block text-sm text-stone-700">
        Opis wykonania
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-sm text-stone-700">
          Serie
          <input
            type="number"
            min={1}
            max={99}
            value={values.defaultSets}
            onChange={(e) => set("defaultSets", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm text-stone-700">
          Powtórzenia
          <input
            type="number"
            min={1}
            max={99}
            value={values.defaultReps}
            onChange={(e) => set("defaultReps", e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <label className="mt-3 block text-sm text-stone-700">
        Obrazek (JPG, PNG lub WebP, do 5 MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-stone-600"
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {pending ? "Zapisywanie..." : submitLabel}
      </button>
    </form>
  );
}
