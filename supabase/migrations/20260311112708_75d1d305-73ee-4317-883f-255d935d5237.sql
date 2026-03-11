
-- persons
create table if not exists public.persons (
  id bigint generated always as identity primary key,
  name text not null,
  linked_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- loans
create table if not exists public.loans (
  id uuid default gen_random_uuid() primary key,
  lender_id text not null,
  borrower_id text not null,
  borrower_name text not null,
  lender_name text not null,
  amount numeric not null,
  currency text not null default 'MNT',
  loan_date date not null,
  due_date date not null,
  memo text default '',
  type text not null check (type in ('give', 'take')),
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  approval_token text,
  sender_bank text,
  sender_account text,
  recipient_bank text,
  recipient_account text,
  created_at timestamptz default now()
);

-- repayments
create table if not exists public.repayments (
  id uuid default gen_random_uuid() primary key,
  loan_id uuid not null references public.loans(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'MNT',
  repayment_date date not null,
  memo text default '',
  type text not null check (type in ('pay', 'receive')),
  status text not null default 'approved',
  created_by_user_id text not null,
  person_name text not null,
  created_at timestamptz default now()
);

-- notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  type text not null check (type in ('loan_request', 'repayment_recorded')),
  related_loan_id uuid references public.loans(id) on delete set null,
  related_repayment_id uuid references public.repayments(id) on delete set null,
  read boolean default false,
  message text not null,
  amount numeric not null,
  currency text not null default 'MNT',
  person_name text not null,
  created_at timestamptz default now()
);

-- Development RLS policies (allow all)
create policy "Allow all for development" on public.persons for all using (true) with check (true);
create policy "Allow all for development" on public.loans for all using (true) with check (true);
create policy "Allow all for development" on public.repayments for all using (true) with check (true);
create policy "Allow all for development" on public.notifications for all using (true) with check (true);
