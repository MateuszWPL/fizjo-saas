-- przykladowy gabinet do developmentu, stale uuid zeby seed byl powtarzalny
insert into clinics (id, name)
values ('11111111-1111-1111-1111-111111111111', 'Gabinet Demo')
on conflict (id) do nothing;

-- profil dla konta demo@fizjo.pl zalozonego recznie w Supabase Auth
insert into profiles (id, clinic_id, full_name, role)
select id, '11111111-1111-1111-1111-111111111111', 'Terapeuta Demo', 'OWNER'
from auth.users
where email = 'demo@fizjo.pl'
on conflict (id) do nothing;

insert into patients (id, clinic_id, first_name, last_name, birth_date, phone, updated_at)
values
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Jan', 'Kowalski', '1985-03-12', '600100200', now()),
  ('21111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Anna', 'Nowak', '1992-11-04', '600300400', now())
on conflict (id) do nothing;
