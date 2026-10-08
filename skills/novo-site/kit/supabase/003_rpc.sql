-- VillaOS kit — 003: escrita atômica em settings e rate limit. Idempotente.
-- Execução só por service_role (as permissões são fechadas no 004).

create or replace function public.update_settings_section(p_section text, p_value jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_data jsonb;
begin
  if p_section is null or length(btrim(p_section)) = 0 or length(p_section) > 64 then
    raise exception 'p_section inválido' using errcode = '22023';
  end if;
  if p_value is null then
    raise exception 'p_value não pode ser NULL' using errcode = '22023';
  end if;

  insert into public.settings (id, data, updated_at)
  values (1, jsonb_build_object(p_section, p_value), now())
  on conflict (id) do update
    set data = jsonb_set(coalesce(public.settings.data, '{}'::jsonb), array[p_section], p_value, true),
        updated_at = now()
  returning data into v_data;

  return v_data;
end;
$$;

create table if not exists public.rate_limits (
  key text primary key,
  count int not null,
  reset_at timestamptz not null
);
alter table public.rate_limits enable row level security;  -- sem policies: só service_role

create or replace function public.hit_rate_limit(p_key text, p_limit int, p_window_ms int)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := now();
  v_janela interval := make_interval(secs => (p_window_ms / 1000.0)::double precision);
  r public.rate_limits;
begin
  if random() < 0.01 then
    delete from public.rate_limits where reset_at < now() - interval '1 day';
  end if;

  insert into public.rate_limits as t (key, count, reset_at)
  values (p_key, 1, v_now + v_janela)
  on conflict (key) do update
    set count    = case when t.reset_at <= v_now then 1 else t.count + 1 end,
        reset_at = case when t.reset_at <= v_now then v_now + v_janela else t.reset_at end
  returning * into r;

  if r.count > p_limit then
    return jsonb_build_object(
      'ok', false,
      'retry_after_ms', greatest(0, (extract(epoch from (r.reset_at - v_now)) * 1000)::bigint)
    );
  end if;
  return jsonb_build_object('ok', true, 'retry_after_ms', 0);
end;
$$;
