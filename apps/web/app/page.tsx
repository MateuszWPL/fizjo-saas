"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";

interface Me {
  fullName: string;
  role: "OWNER" | "THERAPIST";
  clinic: { name: string };
}

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const response = await apiFetch("/me");
        if (!response.ok) {
          setError("Nie udało się pobrać profilu terapeuty.");
          return;
        }
        setMe((await response.json()) as Me);
      } catch {
        setError("Brak połączenia z API.");
      }
    }
    load();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-red-700">{error}</p>
        <button onClick={logout} className="mt-2 text-sm text-stone-500 underline">
          Wyloguj
        </button>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-stone-500">Ładowanie...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">{me.clinic.name}</h1>
        <button onClick={logout} className="text-sm text-stone-500 underline hover:text-stone-700">
          Wyloguj
        </button>
      </div>
      <p className="mt-1 text-sm text-stone-600">
        Zalogowano jako {me.fullName} ({me.role === "OWNER" ? "właściciel" : "terapeuta"}).
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        <li>
          <Link href="/patients" className="text-stone-800 underline hover:text-stone-600">
            Pacjenci
          </Link>
        </li>
        <li>
          <Link href="/exercises" className="text-stone-800 underline hover:text-stone-600">
            Ćwiczenia
          </Link>
        </li>
        <li>
          <Link href="/body-map" className="text-stone-800 underline hover:text-stone-600">
            Mapa ciała
          </Link>
        </li>
      </ul>
    </main>
  );
}
