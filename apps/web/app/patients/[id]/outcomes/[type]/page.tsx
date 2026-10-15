"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorMessage } from "@/components/load-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch, errorMessage } from "@/lib/api";
import { formatScore, interpretScore, previewScore, questionnaires } from "@/lib/outcomes";
import type { OutcomeType } from "@/lib/types";

export default function NewOutcomePage() {
  const router = useRouter();
  const { id, type: typeParam } = useParams<{ id: string; type: string }>();
  const upper = typeParam.toUpperCase();
  const type: OutcomeType | null = upper === "ODI" || upper === "NDI" ? upper : null;
  // null oznacza pytanie bez odpowiedzi
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!type) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <PageHeader
          title="Kwestionariusz"
          backHref={`/patients/${id}`}
          backLabel="Karta pacjenta"
        />
        <ErrorMessage message="Nieznany kwestionariusz." />
      </main>
    );
  }

  const questionnaire = questionnaires[type];
  const answered = answers.filter((answer) => answer !== null).length;
  const complete = answers.every((answer) => answer !== null);
  const score = complete ? previewScore(type, answers as number[]) : null;

  function choose(question: number, value: number) {
    setAnswers((current) => current.map((answer, i) => (i === question ? value : answer)));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!complete) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await apiFetch(`/patients/${id}/outcomes`, {
        method: "POST",
        body: JSON.stringify({ type, answers }),
      });
      if (!response.ok) {
        setError(await errorMessage(response, "Nie udało się zapisać pomiaru."));
        setPending(false);
        return;
      }
      router.push(`/patients/${id}`);
    } catch {
      setError("Brak połączenia z API.");
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title={`${questionnaire.name}: ${questionnaire.fullName}`}
        backHref={`/patients/${id}`}
        backLabel="Karta pacjenta"
        description={`Kwestionariusz niepełnosprawności, ${questionnaire.region}. Zaznacz z pacjentem jedną odpowiedź w każdym punkcie.`}
      />
      <form onSubmit={save} className="max-w-3xl space-y-4">
        {questionnaire.questions.map((question, index) => (
          <Card key={question.title}>
            <CardHeader>
              <CardTitle>
                {index + 1}. {question.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <fieldset className="space-y-1">
                <legend className="sr-only">{question.title}</legend>
                {question.options.map((option, value) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      required
                      checked={answers[index] === value}
                      onChange={() => choose(index, value)}
                      className="mt-0.5 accent-primary"
                    />
                    <span className="flex-1">{option}</span>
                    <span className="text-muted-foreground tabular-nums">{value}</span>
                  </label>
                ))}
              </fieldset>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle>
              {score === null
                ? `Odpowiedzi: ${answered} z 10`
                : `Wynik: ${formatScore(type, score)}, ${interpretScore(type, score)}`}
            </CardTitle>
            <CardDescription>
              Opisy odpowiedzi są uproszczone na potrzeby prototypu. W praktyce klinicznej używa się
              zwalidowanej polskiej wersji kwestionariusza. Zapisanego pomiaru nie można zmienić.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <ErrorMessage message={error} />}
            <Button type="submit" disabled={!complete || pending}>
              {pending ? "Zapisywanie..." : "Zapisz pomiar"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </main>
  );
}
