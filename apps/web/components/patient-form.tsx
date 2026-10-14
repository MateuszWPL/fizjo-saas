"use client";

import { useState } from "react";
import { ErrorMessage } from "@/components/load-state";
import { NativeSelect } from "@/components/native-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { decodePesel } from "@/lib/pesel";
import type { Patient, Sex } from "@/lib/types";

export interface PatientFormValues {
  firstName: string;
  lastName: string;
  pesel: string;
  birthDate: string;
  sex: Sex | "";
  address: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyValues: PatientFormValues = {
  firstName: "",
  lastName: "",
  pesel: "",
  birthDate: "",
  sex: "",
  address: "",
  phone: "",
  email: "",
  notes: "",
};

export function patientToFormValues(patient: Patient): PatientFormValues {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    pesel: patient.pesel ?? "",
    birthDate: patient.birthDate ? patient.birthDate.slice(0, 10) : "",
    sex: patient.sex ?? "",
    address: patient.address ?? "",
    phone: patient.phone ?? "",
    email: patient.email ?? "",
    notes: patient.notes ?? "",
  };
}

// puste pole jedzie jako null, zeby dalo sie wyczyscic wartosc przy edycji
export function toPatientPayload(values: PatientFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    pesel: values.pesel || null,
    birthDate: values.birthDate || null,
    sex: values.sex || null,
    address: values.address || null,
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

export function PatientForm({ initial, submitLabel, onSave }: PatientFormProps) {
  const [values, setValues] = useState<PatientFormValues>(initial ?? emptyValues);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set(field: keyof PatientFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function setPesel(pesel: string) {
    const decoded = decodePesel(pesel);
    setValues((current) => ({
      ...current,
      pesel,
      birthDate: decoded ? decoded.birthDate : current.birthDate,
      sex: decoded ? decoded.sex : current.sex,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSave(values);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nie udało się zapisać pacjenta.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dane osobowe</CardTitle>
          <CardDescription>
            Po wpisaniu numeru PESEL data urodzenia i płeć uzupełnią się same.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Imię</Label>
            <Input
              id="firstName"
              required
              value={values.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nazwisko</Label>
            <Input
              id="lastName"
              required
              value={values.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pesel">PESEL</Label>
            <Input
              id="pesel"
              inputMode="numeric"
              maxLength={11}
              value={values.pesel}
              onChange={(e) => setPesel(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Data urodzenia</Label>
            <Input
              id="birthDate"
              type="date"
              value={values.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">Płeć</Label>
            <NativeSelect
              id="sex"
              value={values.sex}
              onChange={(e) => set("sex", e.target.value)}
              className="w-full"
            >
              <option value="">Nie podano</option>
              <option value="FEMALE">Kobieta</option>
              <option value="MALE">Mężczyzna</option>
            </NativeSelect>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              rows={3}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
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
