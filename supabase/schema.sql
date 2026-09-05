-- Schéma Supabase pour Mon Espace Prof
create extension if not exists pgcrypto;

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nom text not null,
  niveau text not null,
  created_at timestamptz default now()
);

create table if not exists public.eleves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  classe_id uuid not null references public.classes(id) on delete cascade,
  nom text not null,
  prenom text not null,
  observations text,
  created_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  eleve_id uuid not null references public.eleves(id) on delete cascade,
  libelle text not null,
  valeur numeric(5,2) not null,
  sur numeric(5,2) not null default 20,
  coefficient numeric(5,2) not null default 1,
  created_at timestamptz default now()
);

create table if not exists public.devoirs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  classe_id uuid not null references public.classes(id) on delete cascade,
  titre text not null,
  date date,
  statut text not null default 'À faire',
  contenu text,
  created_at timestamptz default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titre text not null,
  categorie text,
  niveau text,
  storage_path text,
  created_at timestamptz default now()
);

alter table public.classes enable row level security;
alter table public.eleves enable row level security;
alter table public.notes enable row level security;
alter table public.devoirs enable row level security;
alter table public.documents enable row level security;

create policy "own classes" on public.classes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own eleves" on public.eleves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notes" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own devoirs" on public.devoirs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own documents" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
