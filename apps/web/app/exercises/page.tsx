"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Exercise } from "@/lib/types";

export default function ExercisesPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">Ćwiczenia</h1>
        <Link
          href="/exercises/new"
          className="rounded bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Dodaj ćwiczenie
        </Link>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : exercises === null ? (
        <p className="mt-4 text-sm text-stone-500">Ładowanie...</p>
      ) : exercises.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">Nie ma jeszcze żadnych ćwiczeń.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="py-2 font-medium">Ćwiczenie</th>
              <th className="py-2 font-medium">Serie x powtórzenia</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => (
              <tr key={exercise.id} className="border-b border-stone-100">
                <td className="py-2">
                  <span className="flex items-center gap-3">
                    {exercise.imageUrl ? (
                      // obrazki z publicznego bucketa, poza domenami next/image
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={exercise.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <span className="h-10 w-10 rounded bg-stone-100" />
                    )}
                    <Link
                      href={`/exercises/${exercise.id}/edit`}
                      className="text-stone-800 underline hover:text-stone-600"
                    >
                      {exercise.name}
                    </Link>
                  </span>
                </td>
                <td className="py-2 text-stone-700">
                  {exercise.defaultSets && exercise.defaultReps
                    ? `${exercise.defaultSets} x ${exercise.defaultReps}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
