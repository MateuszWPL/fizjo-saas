"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Nieprawidłowy e-mail lub hasło.");
      setPending(false);
      return;
    }
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50">
      <form
        onSubmit={handleSubmit}
        className="w-80 rounded border border-stone-200 bg-white p-6"
      >
        <h1 className="text-lg font-semibold text-stone-800">Fizjo</h1>
        <p className="mt-1 text-sm text-stone-600">Zaloguj się do gabinetu.</p>
        <label className="mt-4 block text-sm text-stone-700">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="mt-3 block text-sm text-stone-700">
          Hasło
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded bg-stone-800 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
        >
          {pending ? "Logowanie..." : "Zaloguj"}
        </button>
      </form>
    </main>
  );
}
