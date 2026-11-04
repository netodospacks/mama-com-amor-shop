-- ==============================================================================
-- MIGRAÇÃO: CAMPOS DE DESTAQUE DINÂMICO PARA COLEÇÃO DE NATAL — VIRTUAL STORE
-- Arquivo: supabase/migrations/20261104_christmas_bestseller.sql
--
-- 1. is_best_seller: BOOLEAN, default false (marca o produto como "MAIS PEDIDO")
-- 2. display_order: INTEGER, default 1 (controla a ordem de exibição)
-- 3. collection: TEXT, default null (identifica coleções especiais como 'natal')
-- ==============================================================================

-- 1. Adicionar colunas caso ainda não existam
alter table if exists public.products
  add column if not exists is_best_seller boolean not null default false,
  add column if not exists display_order integer not null default 1,
  add column if not exists collection text default null;

-- 2. Índices de performance para consultas públicas de coleções e ordenação
create index if not exists idx_products_collection on public.products(collection);
create index if not exists idx_products_is_best_seller on public.products(is_best_seller);
create index if not exists idx_products_display_order on public.products(display_order);

-- 3. Comentários para documentação do schema
comment on column public.products.is_best_seller is 'Indica se o produto recebe o selo exclusivo MAIS PEDIDO na Coleção de Natal';
comment on column public.products.display_order is 'Ordem numérica de exibição dentro da coleção ou vitrine';
comment on column public.products.collection is 'Identificador opcional de coleção (ex: natal)';
