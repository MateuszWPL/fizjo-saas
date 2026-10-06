"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Exercise } from "@/lib/types";

interface PlanRow {
  exerciseId: string;
  name: string;
  sets: string;
  reps: string;
  note: string;
}

const inputClass = "w-full rounded border border-stone-300 px-2 py-1 text-sm";

export default function NewPlanPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [chosenId, setChosenId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        const response = await apiFetch("/exercises");
        if (!response.ok) {
          setError("Nie udało się pobrać listy ćwiczeń.");
          return;
        }
        setExercises((await response.json()) as Exercise[]);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [router]);

  // kazde cwiczenie moze byc w zestawie raz, wiec dodane znikaja z listy wyboru
  const available = (exercises ?? []).filter(
    (exercise) => !rows.some((row) => row.exerciseId === exercise.id),
  );

  function addRow() {
    const exercise = available.find((e) => e.id === chosenId);
    if (!exercise) {
      return;
    }
    setRows((current) => [
      ...current,
      {
        exerciseId: exercise.id,
        name: exercise.name,
        sets: exercise.defaultSets?.toString() ?? "",
        reps: exercise.defaultReps?.toString() ?? "",
        note: "",
      },
    ]);
    setChosenId("");
  }

  function updateRow(exerciseId: string, field: "sets" | "reps" | "note", value: string) {
    setRows((current) =>
      current.map((row) => (row.exerciseId === exerciseId ? { ...row, [field]: value } : row)),
    );
  }

  function removeRow(exerciseId: string) {
    setRows((current) => current.filter((row) => row.exerciseId !== exerciseId));
  }

  async function save() {
    setPending(true);
    setError(null);
    try {
      const response = await apiFetch(`/patients/${id}/plans`, {
        method: "POST",
        body: JSON.stringify({
          note: note || null,
          items: rows.map((row) => ({
            exerciseId: row.exerciseId,
            sets: row.sets ? Number(row.sets) : null,
            reps: row.reps ? Number(row.reps) : null,
            note: row.note || null,
          })),
        }),
      });
      if (!response.ok) {
        setError("Nie udało się zapisać zestawu.");
        setPending(false);
        return;
      }
      const plan = (await response.json()) as { id: string };
      router.push(`/plans/${plan.id}`);
    } catch {
      setError("Brak połączenia z API.");
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link
        href={`/patients/${id}`}
        className="text-sm text-stone-500 underline hover:text-stone-700"
      >
        Wróć do pacjenta
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-stone-800">Nowy zestaw zaleceń</h1>
      {exercises === null ? (
        <p className="mt-4 text-sm text-stone-500">{error ?? "Ładowanie..."}</p>
      ) : exercises.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          Baza ćwiczeń jest pusta.{" "}
          <Link href="/exercises/new" className="underline">
            Dodaj pierwsze ćwiczenie
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="mt-4 flex gap-2">
            <select
              value={chosenId}
              onChange={(e) => setChosenId(e.target.value)}
              className="rounded border border-stone-300 px-2 py-1.5 text-sm"
            >
              <option value="">Wybierz ćwiczenie</option>
              {available.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <button
              onClick={addRow}
              disabled={!chosenId}
              className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-50"
            >
              Dodaj
            </button>
          </div>
          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">Zestaw jest pusty.</p>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2 font-medium">Ćwiczenie</th>
                  <th className="w-20 py-2 font-medium">Serie</th>
                  <th className="w-20 py-2 font-medium">Powt.</th>
                  <th className="py-2 font-medium">Uwagi</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.exerciseId} className="border-b border-stone-100">
                    <td className="py-2 pr-2 text-stone-800">{row.name}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={row.sets}
                        onChange={(e) => updateRow(row.exerciseId, "sets", e.target.value)}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={row.reps}
                        onChange={(e) => updateRow(row.exerciseId, "reps", e.target.value)}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        value={row.note}
                        onChange={(e) => updateRow(row.exerciseId, "note", e.target.value)}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => removeRow(row.exerciseId)}
                        className="text-red-700 underline hover:text-red-800"
                      >
                        Usuń
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <label className="mt-4 block max-w-xl text-sm text-stone-700">
            Uwagi do całego zestawu
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
            />
          </label>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button
            onClick={save}
            disabled={pending || rows.length === 0}
            className="mt-4 rounded bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
          >
            {pending ? "Zapisywanie..." : "Zapisz zestaw"}
          </button>
        </>
      )}
    </main>
  );
}
