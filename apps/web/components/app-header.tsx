"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Building2, Dumbbell, LayoutDashboard, LogOut, Users } from "lucide-react";
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
    <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-4" />
          </span>
          {me.clinic.name}
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Button key={href} variant={active ? "secondary" : "ghost"} size="sm" asChild>
                <Link href={href}>
                  <Icon />
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{me.fullName}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut />
            Wyloguj
          </Button>
        </div>
      </div>
    </header>
  );
}
