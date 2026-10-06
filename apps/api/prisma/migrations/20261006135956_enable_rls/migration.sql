-- Supabase wystawia tabele ze schematu public przez swoje REST API, a klucz
-- publiczny jest w kodzie frontendu. RLS bez zadnych polityk blokuje ten dostep
-- calkowicie. API Nest laczy sie jako wlasciciel tabel, ktorego RLS nie obejmuje.
ALTER TABLE "clinics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "visits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "body_markers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exercises" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exercise_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exercise_plan_items" ENABLE ROW LEVEL SECURITY;

-- tabeli historii migracji nie ma w pustej bazie pomocniczej, ktorej Prisma
-- uzywa do sprawdzania migracji, stad warunek
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
