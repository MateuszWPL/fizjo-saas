"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExerciseForm,
  toExercisePayload,
  uploadExerciseImage,
  type ExerciseFormValues,
} from "@/components/exercise-form";
import { apiFetch } from "@/lib/api";

export default function NewExercisePage() {
  const router = useRouter();

  async function save(values: ExerciseFormValues, file: File | null) {
    const response = await apiFetch("/exercises", {
      method: "POST",
      body: JSON.stringify(toExercisePayload(values)),
    });
    if (!response.ok) {
      throw new Error("Zapis nie powiódł się");
    }
    const exercise = (await response.json()) as { id: string };
    if (file) {
      await uploadExerciseImage(exercise.id, file);
    }
    router.push("/exercises");
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/exercises" className="text-sm text-stone-500 underline hover:text-stone-700">
        Wróć do listy
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-stone-800">Nowe ćwiczenie</h1>
      <div className="mt-4">
        <ExerciseForm submitLabel="Dodaj ćwiczenie" onSave={save} />
      </div>
    </main>
  );
}
