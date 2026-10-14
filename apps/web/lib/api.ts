import { supabase } from "./supabase";

const API_URL = "http://localhost:3001";

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  // brak sesji albo wygasly token: jedno miejsce zamiast sprawdzania na kazdej stronie
  if (response.status === 401) {
    window.location.assign("/login");
  }
  return response;
}

// nasze wyjatki w API zwracaja komunikat jako tekst, a ValidationPipe jako
// liste angielskich opisow pol, ktorych nie pokazujemy uzytkownikowi
export async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    return typeof body.message === "string" ? body.message : fallback;
  } catch {
    return fallback;
  }
}
