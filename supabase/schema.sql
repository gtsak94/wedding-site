-- Τρέξε το ΟΛΟ αυτό μία φορά στο Supabase → SQL Editor → New query → Run.
-- Είναι idempotent: μπορείς να το ξανατρέξεις χωρίς πρόβλημα.

create extension if not exists "pgcrypto";

create table if not exists guests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  token      text unique not null,
  created_at timestamptz default now()
);

create table if not exists rsvps (
  id          uuid primary key default gen_random_uuid(),
  guest_id    uuid unique references guests(id) on delete cascade,
  attending   boolean not null,
  num_guests  int default 1,
  message     text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists quiz_scores (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  score      int not null,
  total      int not null,
  created_at timestamptz default now()
);

create table if not exists wishes (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  message    text not null,
  created_at timestamptz default now()
);

-- Φωτογραφίες & βίντεο: τα ίδια τα αρχεία ζουν στο Supabase Storage (bucket 'uploads').
-- Εδώ κρατάμε ΜΟΝΟ τα metadata (ποιος ανέβασε, μήνυμα, φάση, διαδρομή αρχείου).
create table if not exists media (
  id          uuid primary key default gen_random_uuid(),
  path        text not null,            -- διαδρομή μέσα στο bucket
  kind        text not null,            -- 'image' | 'video'
  guest_name  text,
  message     text,
  phase       text,                     -- 'before' | 'during' | null
  size_bytes  bigint,
  mime        text,
  created_at  timestamptz default now()
);

-- Το bucket αποθήκευσης. Ιδιωτικό: η πρόσβαση γίνεται με signed URLs από τον server.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- Ασφάλεια: η εφαρμογή μιλάει στη βάση & στο storage ΜΟΝΟ server-side, με το
-- service_role key (που παρακάμπτει το RLS). Μην εκθέσεις ΠΟΤΕ το service_role
-- key σε client κώδικα.
--
-- Τα παρακάτω grants χρειάζονται όταν η ρύθμιση «Automatically expose new tables»
-- είναι απενεργοποιημένη — αλλιώς ο server παίρνει «permission denied».
grant usage on schema public to service_role;
grant all privileges on all tables    in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables    to service_role;
alter default privileges in schema public grant all on sequences to service_role;
