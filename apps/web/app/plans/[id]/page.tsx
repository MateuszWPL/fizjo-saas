"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { ExercisePlan } from "@/lib/types";

export default function PlanPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<ExercisePlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
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
  }, [id, router]);

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

  async function remove() {
    if (!plan || !window.confirm("Usunąć zestaw zaleceń?")) {
      return;
    }
    const response = await apiFetch(`/plans/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Nie udało się usunąć zestawu.");
      return;
    }
    router.push(`/patients/${plan.patient.id}`);
  }

  if (!plan) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        {error ? (
          <>
            <p className="text-sm text-red-700">{error}</p>
            <Link href="/patients" className="mt-2 inline-block text-sm text-stone-500 underline">
              Wróć do pacjentów
            </Link>
          </>
        ) : (
          <p className="text-sm text-stone-500">Ładowanie...</p>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link
        href={`/patients/${plan.patient.id}`}
        className="text-sm text-stone-500 underline hover:text-stone-700"
      >
        Wróć do pacjenta
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">
          Zestaw zaleceń z {new Date(plan.createdAt).toLocaleDateString("pl-PL")}
        </h1>
        <div className="flex gap-3 text-sm">
          <button onClick={downloadPdf} className="text-stone-800 underline hover:text-stone-600">
            Pobierz PDF
          </button>
          <button onClick={remove} className="text-red-700 underline hover:text-red-800">
            Usuń zestaw
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-stone-600">
        {plan.patient.lastName} {plan.patient.firstName}, wydał {plan.therapist.fullName}
      </p>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-stone-500">
            <th className="w-8 py-2 font-medium">Lp.</th>
            <th className="py-2 font-medium">Ćwiczenie</th>
            <th className="py-2 font-medium">Serie x powt.</th>
            <th className="py-2 font-medium">Uwagi</th>
          </tr>
        </thead>
        <tbody>
          {plan.items.map((item, index) => (
            <tr key={item.id} className="border-b border-stone-100 align-top">
              <td className="py-2 text-stone-500">{index + 1}.</td>
              <td className="py-2">
                <p className="text-stone-800">{item.exercise.name}</p>
                {item.exercise.description && (
                  <p className="mt-0.5 whitespace-pre-wrap text-stone-500">
                    {item.exercise.description}
                  </p>
                )}
              </td>
              <td className="py-2 text-stone-700">
                {item.sets || item.reps ? `${item.sets ?? "-"} x ${item.reps ?? "-"}` : "-"}
              </td>
              <td className="py-2 text-stone-700">{item.note ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {plan.note && (
        <div className="mt-4 max-w-xl">
          <h2 className="text-sm font-medium text-stone-500">Uwagi do zestawu</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-stone-800">{plan.note}</p>
        </div>
      )}
    </main>
  );
}
