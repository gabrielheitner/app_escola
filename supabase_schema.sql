-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. SCHOOLS Table
create table schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROFILES Table (Extends auth.users)
create type user_role as enum ('admin', 'school');

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role user_role default 'school',
  school_id uuid references schools(id) on delete set null, -- Null for Admins, required for Schools
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PAYMENTS Table
create table payments (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id) on delete cascade not null,
  asaas_payment_id text unique not null,
  customer_name text not null,
  customer_last_digits text, -- Tracking last 4 digits of phone or ID for verification
  value numeric(10, 2) not null,
  status text not null, -- 'PENDING', 'RECEIVED', 'OVERDUE'
  due_date date not null,
  payment_date timestamp with time zone,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table schools enable row level security;
alter table profiles enable row level security;
alter table payments enable row level security;

-- POLICIES

-- Helper function to get current user role
create or replace function public.get_my_role()
returns user_role as $$
begin
  return (select role from public.profiles where id = auth.uid());
end;
$$ language plpgsql security definer;

-- Helper function to get current user school_id
create or replace function public.get_my_school_id()
returns uuid as $$
begin
  return (select school_id from public.profiles where id = auth.uid());
end;
$$ language plpgsql security definer;

-- SCHOOLS Policies
create policy "Admins can do everything on schools"
  on schools for all
  using (public.get_my_role() = 'admin');

create policy "Schools can view their own data"
  on schools for select
  using (id = public.get_my_school_id());

-- PROFILES Policies
create policy "Admins can view all profiles"
  on profiles for select
  using (public.get_my_role() = 'admin');

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- PAYMENTS Policies
create policy "Admins can view all payments"
  on payments for select
  using (public.get_my_role() = 'admin');

create policy "Schools can view their own payments"
  on payments for select
  using (school_id = public.get_my_school_id());

-- Triggers to auto-create profile on signup (Optional, but useful)
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, school_id)
  values (new.id, new.email, 'school', null); -- Default to school, admin must assign school manually
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
