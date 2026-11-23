-- 핏센스 Supabase 표 설계 (Supabase 대시보드 → SQL Editor → New query → 붙여넣고 Run)
-- 원칙: 다른 사람도 봐야 하는 것(공개 폴더·후기·댓글)과 내 개인 정보(체형·옷장)는 DB에 두고,
--       접근 규칙(RLS)으로 "누가 읽고 쓸 수 있는지"를 서버가 지켜요. 찜·최근 본은 DB가 아니라 LocalStorage(ID)예요.

-- 1) 회원 프로필 (로그인은 Supabase Auth가 맡아요. 비밀번호는 이 표에 없어요)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text not null default '핏센스 유저' check (char_length(nickname) between 1 and 20),
  gender      text,
  height_cm   numeric check (height_cm between 100 and 230),
  weight_kg   numeric check (weight_kg between 25 and 200),
  bio         text check (char_length(bio) <= 120),
  show_body   boolean not null default true,      -- 끄면 다른 사람에게 키·몸무게가 안 보여요
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "내 프로필만 읽기" on public.profiles for select using (auth.uid() = id);
create policy "내 프로필만 쓰기" on public.profiles for insert with check (auth.uid() = id);
create policy "내 프로필만 수정" on public.profiles for update using (auth.uid() = id);
create policy "내 프로필만 삭제" on public.profiles for delete using (auth.uid() = id);

-- 다른 사람에게는 닉네임과 (공개를 켠 경우의) 키·몸무게만 보여주는 공개용 뷰
create or replace view public.public_profiles as
  select id, nickname,
         case when show_body then height_cm end as height_cm,
         case when show_body then weight_kg end as weight_kg
  from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- 가입하면 프로필 한 줄을 자동으로 만들어요
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(left(new.raw_user_meta_data->>'nickname', 20), '핏센스 유저'));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- 2) 폴더 (공개 여부 한 칸으로 "나만 보기 / 모두에게 공개"를 정해요. 복사본은 만들지 않아요)
create table if not exists public.folders (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  description text check (char_length(description) <= 120),
  color       text,
  mood        text,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.folders enable row level security;
create policy "공개이거나 내 폴더 읽기" on public.folders for select using (is_public or owner_id = auth.uid());
create policy "내 폴더 만들기"       on public.folders for insert with check (owner_id = auth.uid());
create policy "내 폴더만 수정"       on public.folders for update using (owner_id = auth.uid());
create policy "내 폴더만 삭제"       on public.folders for delete using (owner_id = auth.uid());

create table if not exists public.folder_items (
  id         uuid primary key default gen_random_uuid(),
  folder_id  uuid not null references public.folders(id) on delete cascade,
  product_id text not null,                         -- data/products.json 의 상품 ID
  size       text,
  memo       text check (char_length(memo) <= 100),
  position   int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.folder_items enable row level security;
create policy "볼 수 있는 폴더의 옷 읽기" on public.folder_items for select
  using (exists (select 1 from public.folders f where f.id = folder_id and (f.is_public or f.owner_id = auth.uid())));
create policy "내 폴더에만 담기" on public.folder_items for insert
  with check (exists (select 1 from public.folders f where f.id = folder_id and f.owner_id = auth.uid()));
create policy "내 폴더 옷만 수정" on public.folder_items for update
  using (exists (select 1 from public.folders f where f.id = folder_id and f.owner_id = auth.uid()));
create policy "내 폴더 옷만 삭제" on public.folder_items for delete
  using (exists (select 1 from public.folders f where f.id = folder_id and f.owner_id = auth.uid()));

-- 3) 폴더 댓글
create table if not exists public.folder_comments (
  id         uuid primary key default gen_random_uuid(),
  folder_id  uuid not null references public.folders(id) on delete cascade,
  author_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 200),
  created_at timestamptz not null default now()
);
alter table public.folder_comments enable row level security;
create policy "볼 수 있는 폴더의 댓글 읽기" on public.folder_comments for select
  using (exists (select 1 from public.folders f where f.id = folder_id and (f.is_public or f.owner_id = auth.uid())));
create policy "로그인하면 댓글 쓰기" on public.folder_comments for insert
  with check (author_id = auth.uid() and exists (select 1 from public.folders f where f.id = folder_id and (f.is_public or f.owner_id = auth.uid())));
create policy "내 댓글만 삭제" on public.folder_comments for delete using (author_id = auth.uid());

-- 4) 내 옷장 (is_public = true 이면 후기로 모두에게 보여요)
create table if not exists public.closet_items (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_id  text,                                  -- 등록된 상품이면 상품 ID
  brand       text,
  name        text,
  category    text,
  color       text,
  size        text not null,
  overall     text check (overall in ('작음','정핏','여유')),
  parts       jsonb not null default '{}'::jsonb,    -- 부위별 착용감
  memo        text check (char_length(memo) <= 300),
  is_public   boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.closet_items enable row level security;
create policy "공개 후기이거나 내 옷 읽기" on public.closet_items for select using (is_public or owner_id = auth.uid());
create policy "내 옷 추가"   on public.closet_items for insert with check (owner_id = auth.uid());
create policy "내 옷만 수정" on public.closet_items for update using (owner_id = auth.uid());
create policy "내 옷만 삭제" on public.closet_items for delete using (owner_id = auth.uid());

-- 5) 후기 답글 (기본 후기 JSON과 내 옷장 후기 모두에 달 수 있게 review_ref 는 문자열 ID)
create table if not exists public.review_replies (
  id         uuid primary key default gen_random_uuid(),
  review_ref text not null,
  parent_id  uuid references public.review_replies(id) on delete cascade,
  author_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);
alter table public.review_replies enable row level security;
create policy "답글은 누구나 읽기" on public.review_replies for select using (true);
create policy "로그인하면 답글 쓰기" on public.review_replies for insert with check (author_id = auth.uid());
create policy "내 답글만 삭제" on public.review_replies for delete using (author_id = auth.uid());

-- 6) 알림 (받는 사람 본인만 읽고 지울 수 있어요)
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in ('like','reply','inquiry','wish')),
  text       text not null,
  ref        text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "내 알림만 읽기" on public.notifications for select using (user_id = auth.uid());
create policy "내 알림만 수정" on public.notifications for update using (user_id = auth.uid());
create policy "내 알림만 삭제" on public.notifications for delete using (user_id = auth.uid());
-- (알림 만들기는 서버 함수/트리거로 하고, 브라우저에서 직접 넣지 못하게 insert 정책은 만들지 않아요)
