"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";
import { EmptyMessage, ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import type { Exercise } from "@/lib/types";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
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
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title="Ćwiczenia"
        description="Baza ćwiczeń gabinetu, z której układa się zestawy zaleceń dla pacjentów."
        actions={
          <Button asChild>
            <Link href="/exercises/new">
              <Plus />
              Dodaj ćwiczenie
            </Link>
          </Button>
        }
      />
      {error ? (
        <ErrorMessage message={error} />
      ) : exercises === null ? (
        <LoadingRows />
      ) : exercises.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyMessage>Nie ma jeszcze żadnych ćwiczeń.</EmptyMessage>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Link key={exercise.id} href={`/exercises/${exercise.id}/edit`} className="group">
              <Card className="h-full pt-0 transition-shadow group-hover:shadow-md">
                {exercise.imageUrl ? (
                  // obrazki z publicznego bucketa, poza domenami next/image
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={exercise.imageUrl} alt="" className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-muted text-muted-foreground">
                    <Dumbbell className="size-8" />
                  </div>
                )}
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-medium">{exercise.name}</h2>
                    {exercise.defaultSets && exercise.defaultReps && (
                      <Badge variant="secondary">
                        {exercise.defaultSets} x {exercise.defaultReps}
                      </Badge>
                    )}
                  </div>
                  {exercise.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {exercise.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
