# Fizjo SaaS

System do dokumentacji medycznej dla gabinetów fizjoterapeutycznych
z interaktywną mapą ciała do oznaczania obszarów bólu. Praca inżynierska.

Monorepo składa się z dwóch aplikacji:

- `apps/web`: frontend w Next.js,
- `apps/api`: backend w Nest.js z Prismą.

Dane, logowanie i pliki trzyma Supabase (PostgreSQL, Auth, Storage).

## Wymagania

- Node.js 22
- pnpm 11
- projekt w Supabase
- konto w Resend (wysyłka zaleceń e-mailem)

## Konfiguracja

### apps/api/.env

```
DATABASE_URL="postgresql://postgres.<projekt>:<haslo>@<host-poolera>:5432/postgres"
APP_DATABASE_URL="postgresql://app_api.<projekt>:<haslo-app_api>@<host-poolera>:5432/postgres"
SUPABASE_URL=https://<projekt>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
RESEND_API_KEY=re_...
```

- `DATABASE_URL` służy do migracji. Łączy się jako właściciel tabel.
- `APP_DATABASE_URL` jest używany przez działające API. Rola `app_api`
  podlega politykom RLS, które oddzielają dane gabinetów.
- Adres poolera (tryb session) jest w panelu Supabase w zakładce Connect.

### apps/web/.env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://<projekt>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

## Pierwsze uruchomienie

1. Instalacja zależności i wygenerowanie klienta Prismy:

   ```
   pnpm install
   pnpm --filter api exec prisma generate
   ```

2. Migracje bazy. Tworzą tabele, rolę `app_api` i polityki RLS:

   ```
   pnpm --filter api exec prisma migrate deploy
   ```

3. Hasło dla roli `app_api`. Ustaw je w edytorze SQL w panelu Supabase
   i wpisz to samo w `APP_DATABASE_URL`:

   ```sql
   ALTER ROLE app_api PASSWORD '<haslo-app_api>';
   ```

4. W Supabase Storage utwórz publiczny bucket `exercises` na obrazki ćwiczeń.

5. W Supabase Auth dodaj użytkownika `demo@fizjo.pl` (z potwierdzonym
   adresem), a potem wgraj dane demonstracyjne: gabinet, profil właściciela
   dla tego konta i dwóch pacjentów.

   ```
   pnpm --filter api exec prisma db execute --file prisma/seed.sql
   ```

## Uruchomienie

W dwóch osobnych terminalach:

```
pnpm dev:api
pnpm dev:web
```

Frontend działa na http://localhost:3000, backend na http://localhost:3001.

## Testy

```
pnpm --filter api test
pnpm --filter api test:e2e
```

Testy jednostkowe sprawdzają reguły biznesowe bez bazy. Test `test:e2e`
łączy się z bazą z `apps/api/.env`, zakłada dwa tymczasowe gabinety,
sprawdza, że RLS nie pozwala im widzieć ani zmieniać nawzajem swoich danych,
i na koniec je usuwa.
