"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Me } from "@/lib/types";

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMe(null);
        return;
      }
      try {
        const response = await apiFetch("/me");
        setMe(response.ok ? ((await response.json()) as Me) : null);
      } catch {
        setMe(null);
      }
    }
    load();
  }, [pathname]);

  async function logout() {
    await supabase.auth.signOut();
    setMe(null);
    router.replace("/login");
  }

  if (pathname === "/login" || !me) {
    return null;
  }

  const links = [
    { href: "/patients", label: "Pacjenci" },
    { href: "/exercises", label: "Ćwiczenia" },
    ...(me.role === "OWNER" ? [{ href: "/admin", label: "Panel gabinetu" }] : []),
  ];

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3 text-sm">
        <Link href="/" className="font-semibold text-stone-800">
          {me.clinic.name}
        </Link>
        <nav className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname.startsWith(link.href)
                  ? "font-medium text-stone-900"
                  : "text-stone-500 hover:text-stone-800"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto text-stone-500">{me.fullName}</span>
        <button onClick={logout} className="text-stone-500 underline hover:text-stone-800">
          Wyloguj
        </button>
      </div>
    </header>
  );
}
