"use client";

import { useState } from "react";

export interface PatientFormValues {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyPatientForm: PatientFormValues = {
  firstName: "",
  lastName: "",
  birthDate: "",
  phone: "",
  email: "",
  notes: "",
};

// puste pole jedzie jako null, zeby dalo sie wyczyscic wartosc przy edycji
export function toPatientPayload(values: PatientFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    birthDate: values.birthDate || null,
    phone: values.phone || null,
    email: values.email || null,
    notes: values.notes || null,
  };
}

interface PatientFormProps {
  initial?: PatientFormValues;
  submitLabel: string;
  onSave: (values: PatientFormValues) => Promise<void>;
}

const inputClass = "mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm";

export function PatientForm({ initial, submitLabel, onSave }: PatientFormProps) {
  const [values, setValues] = useState<PatientFormValues>(initial ?? emptyPatientForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set(field: keyof PatientFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSave(values);
    } catch {
      setError("Nie udało się zapisać pacjenta.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-stone-700">
          Imię
          <input
            required
            value={values.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm text-stone-700">
          Nazwisko
          <input
            required
            value={values.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <label className="mt-3 block text-sm text-stone-700">
        Data urodzenia
        <input
          type="date"
          value={values.birthDate}
          onChange={(e) => set("birthDate", e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="mt-3 block text-sm text-stone-700">
        Telefon
        <input
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="mt-3 block text-sm text-stone-700">
        E-mail
        <input
          type="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="mt-3 block text-sm text-stone-700">
        Notatki
        <textarea
          rows={4}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          className={inputClass}
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
