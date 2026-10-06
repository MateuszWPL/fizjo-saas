"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Therapist } from "@/lib/types";

interface Stats {
  patients: number;
  visitsThisMonth: number;
}

const inputClass = "mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [therapists, setTherapists] = useState<Therapist[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loadTherapists = useCallback(async () => {
    const response = await apiFetch("/admin/therapists");
    if (!response.ok) {
      setError("Nie udało się pobrać listy terapeutów.");
      return;
    }
    setTherapists((await response.json()) as Therapist[]);
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        const response = await apiFetch("/admin/stats");
        if (response.status === 403) {
          setError("Panel jest dostępny tylko dla właściciela gabinetu.");
          return;
        }
        if (!response.ok) {
          setError("Nie udało się pobrać statystyk.");
          return;
        }
        setStats((await response.json()) as Stats);
        await loadTherapists();
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [router, loadTherapists]);

  async function toggleActive(therapist: Therapist) {
    const action = therapist.active ? "Dezaktywować" : "Przywrócić";
    if (!window.confirm(`${action} konto ${therapist.fullName}?`)) {
      return;
    }
    setError(null);
    const response = await apiFetch(`/admin/therapists/${therapist.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !therapist.active }),
    });
    if (!response.ok) {
      setError("Nie udało się zmienić statusu konta.");
      return;
    }
    await loadTherapists();
  }

  async function createTherapist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    try {
      const response = await apiFetch("/admin/therapists", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (response.status === 409) {
        setFormError("Konto z tym adresem e-mail już istnieje.");
      } else if (response.status === 400) {
        setFormError("Sprawdź dane: poprawny e-mail i hasło co najmniej 8 znaków.");
      } else if (!response.ok) {
        setFormError("Nie udało się założyć konta.");
      } else {
        setForm({ fullName: "", email: "", password: "" });
        await loadTherapists();
      }
    } catch {
      setFormError("Brak połączenia z API.");
    }
    setPending(false);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/" className="text-sm text-stone-500 underline hover:text-stone-700">
        Wróć do strony głównej
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-stone-800">Panel gabinetu</h1>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {!error && stats === null && <p className="mt-4 text-sm text-stone-500">Ładowanie...</p>}
      {stats && (
        <dl className="mt-4 flex gap-10 text-sm">
          <div>
            <dt className="text-stone-500">Aktywni pacjenci</dt>
            <dd className="text-2xl font-semibold text-stone-800">{stats.patients}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Wizyty w tym miesiącu</dt>
            <dd className="text-2xl font-semibold text-stone-800">{stats.visitsThisMonth}</dd>
          </div>
        </dl>
      )}
      {therapists && (
        <>
          <h2 className="mt-8 font-medium text-stone-800">Konta terapeutów</h2>
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2 font-medium">Imię i nazwisko</th>
                <th className="py-2 font-medium">E-mail</th>
                <th className="py-2 font-medium">Rola</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {therapists.map((therapist) => (
                <tr key={therapist.id} className="border-b border-stone-100">
                  <td className="py-2 text-stone-800">{therapist.fullName}</td>
                  <td className="py-2 text-stone-700">{therapist.email ?? "-"}</td>
                  <td className="py-2 text-stone-700">
                    {therapist.role === "OWNER" ? "właściciel" : "terapeuta"}
                  </td>
                  <td className="py-2 text-stone-700">
                    {therapist.active ? "aktywne" : "dezaktywowane"}
                  </td>
                  <td className="py-2 text-right">
                    {therapist.role === "THERAPIST" && (
                      <button
                        onClick={() => toggleActive(therapist)}
                        className={
                          therapist.active
                            ? "text-red-700 underline hover:text-red-800"
                            : "text-stone-800 underline hover:text-stone-600"
                        }
                      >
                        {therapist.active ? "Dezaktywuj" : "Przywróć"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="mt-8 font-medium text-stone-800">Nowe konto terapeuty</h2>
          <p className="mt-1 text-sm text-stone-500">
            Przekaż terapeucie e-mail i hasło startowe, zaloguje się nimi od razu.
          </p>
          <form onSubmit={createTherapist} className="mt-3 max-w-md">
            <label className="block text-sm text-stone-700">
              Imię i nazwisko
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="mt-3 block text-sm text-stone-700">
              E-mail
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="mt-3 block text-sm text-stone-700">
              Hasło startowe (min. 8 znaków)
              <input
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                className={inputClass}
              />
            </label>
            {formError && <p className="mt-3 text-sm text-red-700">{formError}</p>}
            <button
              type="submit"
              disabled={pending}
              className="mt-4 rounded bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
            >
              {pending ? "Zakładanie..." : "Załóż konto"}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
