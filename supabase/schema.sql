create table public.music_libraries (
 user_id uuid primary key references auth.users(id) on delete cascade,
 likes jsonb not null default '[]'::jsonb check(jsonb_typeof(likes)='array' and jsonb_array_length(likes)<=10000),
 playlists jsonb not null default '[]'::jsonb check(jsonb_typeof(playlists)='array' and jsonb_array_length(playlists)<=1000),
 revision bigint not null default 0,
 updated_at timestamptz not null default now()
);
alter table public.music_libraries enable row level security;
revoke all on public.music_libraries from anon;
grant select,insert,update on public.music_libraries to authenticated;
create policy own_library_select on public.music_libraries for select to authenticated using ((select auth.uid())=user_id);
create policy own_library_insert on public.music_libraries for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_library_update on public.music_libraries for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create function public.save_music_library(expected_revision bigint, new_likes jsonb, new_playlists jsonb)
returns setof public.music_libraries language plpgsql security invoker set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.music_libraries(user_id) values(auth.uid()) on conflict(user_id) do nothing;
 return query update public.music_libraries set likes=new_likes,playlists=new_playlists,revision=revision+1,updated_at=now()
 where user_id=auth.uid() and revision=expected_revision returning *;
 if not found then raise exception 'Library changed on another device. Reload before saving.'; end if;
end;
$$;
revoke execute on function public.save_music_library(bigint,jsonb,jsonb) from public,anon;
grant execute on function public.save_music_library(bigint,jsonb,jsonb) to authenticated;
