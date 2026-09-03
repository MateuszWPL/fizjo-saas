"use client";

import { useState } from "react";

export interface VisitFormValues {
  visitDate: string;
  interview: string;
  examination: string;
  diagnosis: string;
  recommendations: string;
}

// puste pole jedzie jako null, zeby dalo sie wyczyscic wartosc przy edycji
export function toVisitPayload(values: VisitFormValues) {
  return {
    visitDate: values.visitDate,
    interview: values.interview || null,
    examination: values.examination || null,
    diagnosis: values.diagnosis || null,
    recommendations: values.recommendations || null,
  };
}

interface VisitFormProps {
  initial: VisitFormValues;
  submitLabel: string;
  onSave: (values: VisitFormValues) => Promise<void>;
}

const inputClass = "mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm";

export const visitFields = [
  ["interview", "Wywiad"],
  ["examination", "Badanie"],
  ["diagnosis", "Rozpoznanie"],
  ["recommendations", "Zalecenia"],
] as const;

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
    } catch {
      setError("Nie udało się zapisać wizyty.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <label className="block text-sm text-stone-700">
        Data wizyty
        <input
          type="date"
          required
          value={values.visitDate}
          onChange={(e) => set("visitDate", e.target.value)}
          className="mt-1 rounded border border-stone-300 px-2 py-1.5 text-sm"
        />
      </label>
      {visitFields.map(([field, label]) => (
        <label key={field} className="mt-3 block text-sm text-stone-700">
          {label}
          <textarea
            rows={3}
            value={values[field]}
            onChange={(e) => set(field, e.target.value)}
            className={inputClass}
          />
        </label>
      ))}
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
