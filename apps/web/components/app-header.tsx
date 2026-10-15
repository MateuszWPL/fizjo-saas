"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Dumbbell, LayoutDashboard, LogOut, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
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
      if (!data.session || pathname === "/login") {
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
    { href: "/", label: "Pulpit", icon: LayoutDashboard },
    { href: "/patients", label: "Pacjenci", icon: Users },
    { href: "/exercises", label: "Ćwiczenia", icon: Dumbbell },
    ...(me.role === "OWNER" ? [{ href: "/admin", label: "Gabinet", icon: Building2 }] : []),
  ];

  return (
    <header className="sticky top-0 z-10 border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
          <Logo className="h-7 w-auto shrink-0" />
          <span className="truncate">{me.clinic.name}</span>
        </Link>
        {/* na telefonie menu schodzi do drugiego wiersza i przewija sie w poziomie */}
        <nav className="order-last -mx-1 flex w-full items-center gap-1 overflow-x-auto md:order-none md:mx-0 md:w-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Button key={href} variant={active ? "secondary" : "ghost"} size="sm" asChild>
                <Link href={href} aria-current={active ? "page" : undefined}>
                  <Icon />
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground lg:inline">{me.fullName}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut />
            Wyloguj
          </Button>
        </div>
      </div>
    </header>
  );
}
