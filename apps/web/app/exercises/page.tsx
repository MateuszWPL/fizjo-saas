"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { EmptyMessage, ErrorMessage, LoadingRows } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { Exercise } from "@/lib/types";

export default function ExercisesPage() {
  const router = useRouter();
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
      <Card>
        <CardContent>
          {error ? (
            <ErrorMessage message={error} />
          ) : exercises === null ? (
            <LoadingRows />
          ) : exercises.length === 0 ? (
            <EmptyMessage>Nie ma jeszcze żadnych ćwiczeń.</EmptyMessage>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ćwiczenie</TableHead>
                  <TableHead className="w-32 text-right">Serie x powt.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercises.map((exercise) => (
                  <TableRow
                    key={exercise.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/exercises/${exercise.id}/edit`)}
                  >
                    <TableCell className="whitespace-normal">
                      <div className="flex items-start gap-3">
                        {exercise.imageUrl && (
                          // obrazki z publicznego bucketa, poza domenami next/image
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={exercise.imageUrl}
                            alt=""
                            loading="lazy"
                            className="size-12 shrink-0 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <Link
                            href={`/exercises/${exercise.id}/edit`}
                            className="font-medium hover:underline"
                          >
                            {exercise.name}
                          </Link>
                          {exercise.description && (
                            <p className="line-clamp-2 max-w-prose text-muted-foreground">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-top tabular-nums">
                      {exercise.defaultSets && exercise.defaultReps
                        ? `${exercise.defaultSets} x ${exercise.defaultReps}`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
