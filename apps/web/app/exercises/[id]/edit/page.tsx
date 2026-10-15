"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import {
  ExerciseForm,
  toExercisePayload,
  uploadExerciseImage,
  type ExerciseFormValues,
} from "@/components/exercise-form";
import { ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { apiFetch, errorMessage } from "@/lib/api";
import type { Exercise } from "@/lib/types";

export default function EditExercisePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
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
  }, [id]);

  async function save(values: ExerciseFormValues, file: File | null) {
    const response = await apiFetch(`/exercises/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toExercisePayload(values)),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Nie udało się zapisać zmian."));
    }
    if (file) {
      await uploadExerciseImage(id, file);
    }
    router.push("/exercises");
  }

  async function remove() {
    try {
      const response = await apiFetch(`/exercises/${id}`, { method: "DELETE" });
      if (response.status === 409) {
        setError("Tego ćwiczenia nie można usunąć, bo jest w wydanych zestawach zaleceń.");
        return;
      }
      if (!response.ok) {
        setError("Nie udało się usunąć ćwiczenia.");
        return;
      }
      router.push("/exercises");
    } catch {
      setError("Brak połączenia z API.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title="Edycja ćwiczenia"
        backHref="/exercises"
        backLabel="Ćwiczenia"
        actions={
          exercise && (
            <ConfirmButton
              label={
                <>
                  <Trash2 />
                  Usuń
                </>
              }
              title="Usunąć ćwiczenie?"
              description="Ćwiczenie zniknie z bazy gabinetu. Nie da się usunąć ćwiczenia, które jest w wydanym zestawie zaleceń."
              confirmLabel="Usuń"
              variant="destructive"
              onConfirm={remove}
            />
          )
        }
      />
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      {exercise === null ? (
        !error && <LoadingRows rows={5} />
      ) : (
        <div className="space-y-4">
          {exercise.imageUrl && (
            // obrazki z publicznego bucketa, poza domenami next/image
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="h-48 rounded-lg border object-cover"
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
        </div>
      )}
    </main>
  );
}
