"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Patient } from "@/lib/types";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const response = await apiFetch(`/patients${query}`);
        if (!response.ok) {
          setError("Nie udało się pobrać listy pacjentów.");
          return;
        }
        setError(null);
        setPatients((await response.json()) as Patient[]);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [search, router]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">Pacjenci</h1>
        <Link
          href="/patients/new"
          className="rounded bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Dodaj pacjenta
        </Link>
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Szukaj po imieniu lub nazwisku"
        className="mt-4 w-full max-w-sm rounded border border-stone-300 px-2 py-1.5 text-sm"
      />
      {error ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : patients === null ? (
        <p className="mt-4 text-sm text-stone-500">Ładowanie...</p>
      ) : patients.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          {search ? "Brak wyników dla tego wyszukiwania." : "Nie ma jeszcze żadnych pacjentów."}
        </p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="py-2 font-medium">Nazwisko i imię</th>
              <th className="py-2 font-medium">Data urodzenia</th>
              <th className="py-2 font-medium">Telefon</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b border-stone-100">
                <td className="py-2">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-stone-800 underline hover:text-stone-600"
                  >
                    {patient.lastName} {patient.firstName}
                  </Link>
                </td>
                <td className="py-2 text-stone-700">
                  {patient.birthDate
                    ? new Date(patient.birthDate).toLocaleDateString("pl-PL")
                    : "-"}
                </td>
                <td className="py-2 text-stone-700">{patient.phone ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
