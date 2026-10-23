-- ==============================================================================
-- MIGRAÇÃO REVISADA: SISTEMA DE SUBPRODUTOS E ADICIONAIS — VIRTUAL STORE
-- Arquivo: supabase/migrations/20261023_subproducts_addons.sql
-- 
-- Auditoria & Especificações:
-- 1. Modelo puramente associativo (N:N) via product_subproducts, sem redundância
--    de product_id na tabela subproducts.
-- 2. Preserva integralmente o bucket 'product-images' e suas configurações atuais.
-- 3. Clientes públicos só visualizam subprodutos ativos e vinculados a produtos ativos.
-- 4. Somente administradores autenticados (profiles.role = 'admin') podem gerenciar.
-- 5. Políticas de Storage estritamente limitadas ao prefixo 'subproducts/', protegendo
--    todas as imagens existentes do catálogo.
-- 6. Totalmente idempotente e seguro para re-execuções.
-- ==============================================================================

-- 1. TABELA DE SUBPRODUTOS (CATÁLOGO DE ADICIONAIS)
create table if not exists public.subproducts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null default 0.00,
  image text,
  active boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. TABELA ASSOCIATIVA (VÍNCULO N:N ENTRE PRODUTOS E SUBPRODUTOS)
create table if not exists public.product_subproducts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  subproduct_id uuid not null references public.subproducts(id) on delete cascade,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  unique(product_id, subproduct_id)
);

-- 3. ÍNDICES DE PERFORMANCE
create index if not exists idx_subproducts_active on public.subproducts(active);
create index if not exists idx_subproducts_sort_order on public.subproducts(sort_order);
create index if not exists idx_product_subproducts_prod on public.product_subproducts(product_id);
create index if not exists idx_product_subproducts_sub on public.product_subproducts(subproduct_id);
create index if not exists idx_product_subproducts_sort on public.product_subproducts(sort_order);

-- 4. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
alter table public.subproducts enable row level security;
alter table public.product_subproducts enable row level security;

-- 5. POLÍTICAS DE SEGURANÇA PARA SUBPRODUCTS
-- Leitura pública: clientes só veem subprodutos ativos E que estejam vinculados a um produto ativo
-- Administradores autenticados podem ver todos (inclusive inativos ou ainda sem vínculo)
drop policy if exists "Allow public read active subproducts" on public.subproducts;
create policy "Allow public read active subproducts" on public.subproducts
  for select
  using (
    (
      active = true 
      and exists (
        select 1 from public.product_subproducts ps
        join public.products p on p.id = ps.product_id
        where ps.subproduct_id = public.subproducts.id
          and p.active = true
      )
    )
    or (
      auth.role() = 'authenticated' and 
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    )
  );

-- Escrita de subprodutos: estritamente restrita a administradores autenticados
drop policy if exists "Admins can insert subproducts" on public.subproducts;
create policy "Admins can insert subproducts" on public.subproducts
  for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can update subproducts" on public.subproducts;
create policy "Admins can update subproducts" on public.subproducts
  for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can delete subproducts" on public.subproducts;
create policy "Admins can delete subproducts" on public.subproducts
  for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. POLÍTICAS DE SEGURANÇA PARA PRODUCT_SUBPRODUCTS (VÍNCULOS)
-- Leitura pública: clientes só veem vínculos onde tanto o produto quanto o subproduto estão ativos
-- Administradores podem consultar todos os vínculos
drop policy if exists "Allow public read active product_subproducts" on public.product_subproducts;
create policy "Allow public read active product_subproducts" on public.product_subproducts
  for select
  using (
    (
      exists (
        select 1 from public.subproducts s
        where s.id = public.product_subproducts.subproduct_id
          and s.active = true
      )
      and exists (
        select 1 from public.products p
        where p.id = public.product_subproducts.product_id
          and p.active = true
      )
    )
    or (
      auth.role() = 'authenticated' and 
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    )
  );

-- Gestão de vínculos: apenas administradores autenticados
drop policy if exists "Admins can insert product_subproducts" on public.product_subproducts;
create policy "Admins can insert product_subproducts" on public.product_subproducts
  for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can update product_subproducts" on public.product_subproducts;
create policy "Admins can update product_subproducts" on public.product_subproducts
  for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can delete product_subproducts" on public.product_subproducts;
create policy "Admins can delete product_subproducts" on public.product_subproducts
  for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 7. TRIGGER PARA ATUALIZAR O CAMPO updated_at AUTOMATICAMENTE
create or replace function public.handle_subproducts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_subproducts_updated_at on public.subproducts;
create trigger trigger_subproducts_updated_at
  before update on public.subproducts
  for each row
  execute function public.handle_subproducts_updated_at();

-- 8. POLÍTICAS DE STORAGE ESPECÍFICAS PARA SUBPRODUTOS
-- Preserva a configuração existente do bucket 'product-images' sem alterá-lo.
-- Aplica regras de acesso restritas estritamente à pasta 'subproducts/'.

-- Visualização pública de imagens na pasta 'subproducts/'
drop policy if exists "Allow public read subproducts images" on storage.objects;
create policy "Allow public read subproducts images" on storage.objects
  for select
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'subproducts'
  );

-- Upload de imagens de subprodutos: apenas administradores
drop policy if exists "Admins can upload subproducts images" on storage.objects;
create policy "Admins can upload subproducts images" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'subproducts'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Substituição/Atualização de imagens de subprodutos: apenas administradores
drop policy if exists "Admins can update subproducts images" on storage.objects;
create policy "Admins can update subproducts images" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'subproducts'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'subproducts'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Exclusão de imagens de subprodutos: apenas administradores
drop policy if exists "Admins can delete subproducts images" on storage.objects;
create policy "Admins can delete subproducts images" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'subproducts'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
