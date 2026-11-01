create type public.app_role as enum ('admin','reception','triage','doctor','pharmacy','optical','diagnostics','surgery','cashier','inventory');

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.branches to authenticated;
grant all on public.branches to service_role;
alter table public.branches enable row level security;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  branch_id uuid references public.branches(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create table public.hospital_settings (
  id int primary key default 1 check (id = 1),
  name_fa text not null default 'شفاخانه تخصصی چشم الشفاء',
  name_en text not null default 'Al-Shifa Eye Hospital',
  address text default 'هرات، افغانستان',
  phone text,
  email text,
  logo_url text,
  default_currency text not null default 'AFN',
  usd_rate numeric(12,4) not null default 70,
  updated_at timestamptz not null default now()
);
grant select, update on public.hospital_settings to authenticated;
grant all on public.hospital_settings to service_role;
alter table public.hospital_settings enable row level security;
insert into public.hospital_settings (id) values (1);
insert into public.branches (name, address) values ('شعبه مرکزی هرات', 'هرات، افغانستان');

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "staff read branches" on public.branches for select to authenticated using (true);
create policy "admin manage branches" on public.branches for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "staff read profiles" on public.profiles for select to authenticated using (true);
create policy "self update profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin update profiles" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "read own or admin roles" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create policy "staff read settings" on public.hospital_settings for select to authenticated using (true);
create policy "admin update settings" on public.hospital_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();