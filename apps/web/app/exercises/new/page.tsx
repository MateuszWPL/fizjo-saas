"use client";

import { useRouter } from "next/navigation";
import {
  ExerciseForm,
  toExercisePayload,
  uploadExerciseImage,
  type ExerciseFormValues,
} from "@/components/exercise-form";
import { PageHeader } from "@/components/page-header";
import { apiFetch, errorMessage } from "@/lib/api";

export default function NewExercisePage() {
  const router = useRouter();

  async function save(values: ExerciseFormValues, file: File | null) {
    const response = await apiFetch("/exercises", {
      method: "POST",
      body: JSON.stringify(toExercisePayload(values)),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Nie udało się zapisać ćwiczenia."));
    }
    const exercise = (await response.json()) as { id: string };
    if (file) {
      await uploadExerciseImage(exercise.id, file);
    }
    router.push("/exercises");
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader title="Nowe ćwiczenie" backHref="/exercises" backLabel="Ćwiczenia" />
      <ExerciseForm submitLabel="Dodaj ćwiczenie" onSave={save} />
    </main>
  );
}
