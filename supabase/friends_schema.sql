-- Supabase SQL para tablas de amistad y solicitudes
-- Asume que existe una tabla `profiles` o `users` proporcionada por Auth con columna `id` (UUID) y `email`/`full_name`
-- Supabase SQL para tablas de amistad y solicitudes
-- Ajustado para proyectos que ya tienen una tabla `users` (con columnas id, email, password, name, role, elo).
-- El error que viste (relation "profiles" does not exist) ocurre porque el SQL original referenciaba `profiles`.
-- Aquí incluimos dos variantes: A) si `users.id` es UUID, y B) si `users.id` es entero (serial/bigint).

-- =====================
-- Variante A: users.id es UUID
-- (ejecuta esta sección si la columna users.id es de tipo UUID)
-- =====================
create table if not exists friend_requests_uuid (
  id uuid default uuid_generate_v4() primary key,
  from_user uuid not null references users(id) on delete cascade,
  to_user uuid not null references users(id) on delete cascade,
  status text not null default 'pending', -- pending | accepted | rejected
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_friend_requests_to_user_uuid on friend_requests_uuid(to_user);
create index if not exists idx_friend_requests_from_user_uuid on friend_requests_uuid(from_user);

create table if not exists friends_uuid (
  id uuid default uuid_generate_v4() primary key,
  user_a uuid not null references users(id) on delete cascade,
  user_b uuid not null references users(id) on delete cascade,
  created_at timestamptz default now(),
  constraint uniq_friend_pair_uuid unique (user_a, user_b)
);

create index if not exists idx_friends_user_a_uuid on friends_uuid(user_a);
create index if not exists idx_friends_user_b_uuid on friends_uuid(user_b);

-- =====================
-- Variante B: users.id es entero (integer / serial / bigint)
-- (ejecuta esta sección si la columna users.id es integer o bigint)
-- =====================
create table if not exists friend_requests_int (
  id bigserial primary key,
  from_user bigint not null references users(id) on delete cascade,
  to_user bigint not null references users(id) on delete cascade,
  status text not null default 'pending', -- pending | accepted | rejected
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_friend_requests_to_user_int on friend_requests_int(to_user);
create index if not exists idx_friend_requests_from_user_int on friend_requests_int(from_user);

create table if not exists friends_int (
  id bigserial primary key,
  user_a bigint not null references users(id) on delete cascade,
  user_b bigint not null references users(id) on delete cascade,
  created_at timestamptz default now(),
  constraint uniq_friend_pair_int unique (user_a, user_b)
);

create index if not exists idx_friends_user_a_int on friends_int(user_a);
create index if not exists idx_friends_user_b_int on friends_int(user_b);

-- =====================
-- Instrucciones:
-- 1) Determina el tipo de `users.id` en tu base de datos. En psql puedes ejecutar:
--      \d users
--    o en Supabase SQL Editor: SELECT pg_typeof(id), id FROM users LIMIT 1;
-- 2) Ejecuta sólo la variante que corresponda (A o B). Si ejecutas ambas, tendrás tablas duplicadas
--    con sufijos _uuid y _int, lo cual puede ser útil para pruebas, pero en producción elige una.
-- 3) Actualiza tu backend para leer/escribir en la tabla que creaste (`friend_requests_uuid`/`friend_requests_int` y `friends_uuid`/`friends_int`).

-- Nota adicional:
-- - Si quieres mantener una sola tabla llamada `friend_requests` y `friends`, reemplaza los nombres con los de la variante elegida.
-- - Asegúrate de que las FK referencian el mismo tipo que `users.id`.
