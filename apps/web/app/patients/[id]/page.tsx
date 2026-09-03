"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Patient, Visit } from "@/lib/types";

export default function PatientPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [visitsError, setVisitsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        const response = await apiFetch(`/patients/${id}`);
        if (!response.ok) {
          setError("Nie znaleziono pacjenta.");
          return;
        }
        setPatient((await response.json()) as Patient);
        const visitsResponse = await apiFetch(`/patients/${id}/visits`);
        if (!visitsResponse.ok) {
          setVisitsError("Nie udało się pobrać listy wizyt.");
          return;
        }
        setVisits((await visitsResponse.json()) as Visit[]);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id, router]);

  async function archive() {
    if (!window.confirm("Zarchiwizować pacjenta? Zniknie z listy, ale dane zostaną.")) {
      return;
    }
    const response = await apiFetch(`/patients/${id}/archive`, { method: "POST" });
    if (!response.ok) {
      setError("Nie udało się zarchiwizować pacjenta.");
      return;
    }
    router.push("/patients");
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-red-700">{error}</p>
        <Link href="/patients" className="mt-2 inline-block text-sm text-stone-500 underline">
          Wróć do listy
        </Link>
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-stone-500">Ładowanie...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/patients" className="text-sm text-stone-500 underline hover:text-stone-700">
        Wróć do listy
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">
          {patient.lastName} {patient.firstName}
        </h1>
        <div className="flex gap-3 text-sm">
          <Link
            href={`/patients/${patient.id}/edit`}
            className="text-stone-800 underline hover:text-stone-600"
          >
            Edytuj
          </Link>
          <button onClick={archive} className="text-red-700 underline hover:text-red-800">
            Archiwizuj
          </button>
        </div>
      </div>
      {patient.archivedAt && (
        <p className="mt-2 text-sm text-amber-700">Pacjent zarchiwizowany.</p>
      )}
      <dl className="mt-4 max-w-md space-y-2 text-sm">
        <div className="flex justify-between border-b border-stone-100 py-1">
          <dt className="text-stone-500">Data urodzenia</dt>
          <dd className="text-stone-800">
            {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("pl-PL") : "-"}
          </dd>
        </div>
        <div className="flex justify-between border-b border-stone-100 py-1">
          <dt className="text-stone-500">Telefon</dt>
          <dd className="text-stone-800">{patient.phone ?? "-"}</dd>
        </div>
        <div className="flex justify-between border-b border-stone-100 py-1">
          <dt className="text-stone-500">E-mail</dt>
          <dd className="text-stone-800">{patient.email ?? "-"}</dd>
        </div>
      </dl>
      {patient.notes && (
        <div className="mt-4 max-w-md">
          <h2 className="text-sm font-medium text-stone-500">Notatki</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-stone-800">{patient.notes}</p>
        </div>
      )}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-stone-800">Wizyty</h2>
          <Link
            href={`/patients/${patient.id}/visits/new`}
            className="rounded bg-stone-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-700"
          >
            Dodaj wizytę
          </Link>
        </div>
        {visitsError ? (
          <p className="mt-2 text-sm text-red-700">{visitsError}</p>
        ) : visits === null ? (
          <p className="mt-2 text-sm text-stone-500">Ładowanie...</p>
        ) : visits.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Nie ma jeszcze żadnych wizyt.</p>
        ) : (
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2 font-medium">Data</th>
                <th className="py-2 font-medium">Terapeuta</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-b border-stone-100">
                  <td className="py-2">
                    <Link
                      href={`/visits/${visit.id}`}
                      className="text-stone-800 underline hover:text-stone-600"
                    >
                      {new Date(visit.visitDate).toLocaleDateString("pl-PL")}
                    </Link>
                  </td>
                  <td className="py-2 text-stone-700">{visit.therapist.fullName}</td>
                  <td className="py-2 text-stone-700">
                    {visit.closedAt ? "Zamknięta" : "Otwarta"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
