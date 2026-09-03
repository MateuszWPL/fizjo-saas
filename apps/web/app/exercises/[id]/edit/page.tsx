"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExerciseForm,
  toExercisePayload,
  uploadExerciseImage,
  type ExerciseFormValues,
} from "@/components/exercise-form";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Exercise } from "@/lib/types";

export default function EditExercisePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        const response = await apiFetch(`/exercises/${id}`);
        if (!response.ok) {
          setError("Nie znaleziono ćwiczenia.");
          return;
        }
        setExercise((await response.json()) as Exercise);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [id, router]);

  async function save(values: ExerciseFormValues, file: File | null) {
    const response = await apiFetch(`/exercises/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toExercisePayload(values)),
    });
    if (!response.ok) {
      throw new Error("Zapis nie powiódł się");
    }
    if (file) {
      await uploadExerciseImage(id, file);
    }
    router.push("/exercises");
  }

  async function remove() {
    if (!window.confirm("Usunąć ćwiczenie?")) {
      return;
    }
    const response = await apiFetch(`/exercises/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Nie udało się usunąć ćwiczenia.");
      return;
    }
    router.push("/exercises");
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/exercises" className="text-sm text-stone-500 underline hover:text-stone-700">
        Wróć do listy
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">Edycja ćwiczenia</h1>
        {exercise && (
          <button onClick={remove} className="text-sm text-red-700 underline hover:text-red-800">
            Usuń ćwiczenie
          </button>
        )}
      </div>
      <div className="mt-4">
        {exercise === null ? (
          error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : (
            <p className="text-sm text-stone-500">Ładowanie...</p>
          )
        ) : (
          <>
            {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
            {exercise.imageUrl && (
              // obrazki z publicznego bucketa, poza domenami next/image
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={exercise.imageUrl}
                alt={exercise.name}
                className="mb-4 h-40 rounded border border-stone-200 object-cover"
              />
            )}
            <ExerciseForm
              initial={{
                name: exercise.name,
                description: exercise.description ?? "",
                defaultSets: exercise.defaultSets?.toString() ?? "",
                defaultReps: exercise.defaultReps?.toString() ?? "",
              }}
              submitLabel="Zapisz zmiany"
              onSave={save}
            />
          </>
        )}
      </div>
    </main>
  );
}
