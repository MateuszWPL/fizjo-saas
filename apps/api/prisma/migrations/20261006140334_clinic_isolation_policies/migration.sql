-- Rola, jako ktora API laczy sie z baza. Nie jest wlascicielem tabel, wiec
-- obejmuja ja polityki RLS. Haslo ustawiamy recznie poza repozytorium.
-- Role sa wspolne dla calego serwera, a Prisma sprawdza migracje na osobnej
-- bazie pomocniczej, stad warunek przy tworzeniu.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_api') THEN
    CREATE ROLE app_api LOGIN NOBYPASSRLS;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO app_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_api;

-- API ustawia app.user_id na poczatku kazdej transakcji, patrz PrismaService.forUser
CREATE FUNCTION current_app_user_id() RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT nullif(current_setting('app.user_id', true), '')::uuid
$$;

-- SECURITY DEFINER, bo funkcja musi przeczytac profiles z pominieciem RLS,
-- inaczej polityka na profiles wywolywalaby sama siebie
CREATE FUNCTION current_clinic_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT clinic_id FROM profiles WHERE id = current_app_user_id() AND active
$$;

REVOKE ALL ON FUNCTION current_app_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION current_clinic_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION current_app_user_id() TO app_api;
GRANT EXECUTE ON FUNCTION current_clinic_id() TO app_api;

CREATE POLICY clinic_isolation ON clinics FOR ALL TO app_api
  USING (id = current_clinic_id())
  WITH CHECK (id = current_clinic_id());

-- wlasny profil jest widoczny zawsze, zeby /me moglo zglosic dezaktywacje
CREATE POLICY clinic_isolation ON profiles FOR ALL TO app_api
  USING (id = current_app_user_id() OR clinic_id = current_clinic_id())
  WITH CHECK (clinic_id = current_clinic_id());

CREATE POLICY clinic_isolation ON patients FOR ALL TO app_api
  USING (clinic_id = current_clinic_id())
  WITH CHECK (clinic_id = current_clinic_id());

CREATE POLICY clinic_isolation ON exercises FOR ALL TO app_api
  USING (clinic_id = current_clinic_id())
  WITH CHECK (clinic_id = current_clinic_id());

-- tabele bez clinic_id odwoluja sie do rodzica, ktory sam jest juz
-- przefiltrowany przez swoja polityke
CREATE POLICY clinic_isolation ON visits FOR ALL TO app_api
  USING (patient_id IN (SELECT id FROM patients))
  WITH CHECK (patient_id IN (SELECT id FROM patients));

CREATE POLICY clinic_isolation ON body_markers FOR ALL TO app_api
  USING (visit_id IN (SELECT id FROM visits))
  WITH CHECK (visit_id IN (SELECT id FROM visits));

CREATE POLICY clinic_isolation ON exercise_plans FOR ALL TO app_api
  USING (patient_id IN (SELECT id FROM patients))
  WITH CHECK (patient_id IN (SELECT id FROM patients));

CREATE POLICY clinic_isolation ON exercise_plan_items FOR ALL TO app_api
  USING (plan_id IN (SELECT id FROM exercise_plans))
  WITH CHECK (
    plan_id IN (SELECT id FROM exercise_plans)
    AND exercise_id IN (SELECT id FROM exercises)
  );
