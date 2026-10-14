"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { EmptyMessage, ErrorMessage, LoadingRows } from "@/components/load-state";
import { NativeSelect } from "@/components/native-select";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import type { Exercise } from "@/lib/types";

interface PlanRow {
  exerciseId: string;
  name: string;
  sets: string;
  reps: string;
  note: string;
}

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
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        title="Nowy zestaw zaleceń"
        backHref={`/patients/${id}`}
        backLabel="Karta pacjenta"
      />
      {exercises === null ? (
        error ? <ErrorMessage message={error} /> : <LoadingRows />
      ) : exercises.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyMessage>
              Baza ćwiczeń jest pusta.{" "}
              <Link href="/exercises/new" className="text-primary underline">
                Dodaj pierwsze ćwiczenie
              </Link>
              .
            </EmptyMessage>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Ćwiczenia w zestawie</CardTitle>
              <CardDescription>
                Serie i powtórzenia podpowiadają się z ustawień ćwiczenia, można je zmienić.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <NativeSelect
                  value={chosenId}
                  onChange={(e) => setChosenId(e.target.value)}
                  className="min-w-64"
                >
                  <option value="">Wybierz ćwiczenie</option>
                  {available.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </NativeSelect>
                <Button variant="outline" onClick={addRow} disabled={!chosenId}>
                  <Plus />
                  Dodaj do zestawu
                </Button>
              </div>
              {rows.length === 0 ? (
                <EmptyMessage>Zestaw jest pusty.</EmptyMessage>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ćwiczenie</TableHead>
                      <TableHead className="w-24">Serie</TableHead>
                      <TableHead className="w-24">Powt.</TableHead>
                      <TableHead>Uwagi</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.exerciseId}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            max={99}
                            value={row.sets}
                            onChange={(e) => updateRow(row.exerciseId, "sets", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            max={99}
                            value={row.reps}
                            onChange={(e) => updateRow(row.exerciseId, "reps", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.note}
                            onChange={(e) => updateRow(row.exerciseId, "note", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Usuń z zestawu"
                            onClick={() => removeRow(row.exerciseId)}
                          >
                            <X />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2">
              <Label htmlFor="note">Uwagi do całego zestawu</Label>
              <Textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </CardContent>
          </Card>
          {error && <ErrorMessage message={error} />}
          <Button onClick={save} disabled={pending || rows.length === 0}>
            {pending ? "Zapisywanie..." : "Zapisz zestaw"}
          </Button>
        </>
      )}
    </main>
  );
}
