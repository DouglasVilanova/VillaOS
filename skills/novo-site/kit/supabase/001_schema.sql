-- VillaOS kit — 001: conteúdo do site e storage de imagens. Idempotente.
-- Escrita só pelo servidor (service_role). Nenhuma policy de escrita para anon/authenticated.

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

alter table public.settings enable row level security;
drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select using (true);

-- Bucket público de imagens (sem SVG: pode carregar script).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 10485760,
        array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Sem policy de SELECT em storage.objects: bucket público serve as URLs /object/public/
-- sem ela, e uma policy de leitura deixaria anon listar todos os arquivos.
drop policy if exists "public read site-images" on storage.objects;
