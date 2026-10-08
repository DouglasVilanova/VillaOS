-- VillaOS kit — 004: hardening. Idempotente; rodar de novo a cada migration nova.

-- 1. RLS ligado em toda tabela do schema public.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- 2. Funções do schema public: ninguém executa além do service_role.
--    (Funções têm EXECUTE para PUBLIC por padrão; a anon key é pública.)
--    Ignora procedures e funções de extensões.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as assinatura
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (select 1 from pg_depend d
                      where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.assinatura);
    execute format('grant execute on function %s to service_role', f.assinatura);
  end loop;
end $$;
-- Funções futuras: o EXECUTE de PUBLIC é default global (a forma "in schema" não o remove).
alter default privileges revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;

-- 3. Storage: remover qualquer policy de escrita no bucket site-images
--    (o service_role ignora RLS e continua subindo arquivos).
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and cmd <> 'SELECT'
      and (coalesce(qual, '') || coalesce(with_check, '')) like '%site-images%'
  loop
    execute format('drop policy %I on storage.objects', pol.policyname);
  end loop;
end $$;

-- 4. Bucket sem SVG.
update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','image/gif']
where id = 'site-images';
