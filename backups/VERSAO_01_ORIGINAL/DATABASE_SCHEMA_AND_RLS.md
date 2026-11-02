# REGISTRO DE ARQUITETURA, SCHEMA E SEGURANÇA DO SUPABASE
**Projeto:** Visual Story (Catálogo VS)
**Versão:** VISUAL STORY — VERSÃO ORIGINAL — BACKUP 01
**Data de Registro:** 01/11/2026

---

## 1. Conexão e Credenciais
- **Provedor:** Supabase Cloud
- **Instância:** `skuuymfaxtkwulhexmgd.supabase.co`
- **Variáveis de Ambiente:**
  - `VITE_SUPABASE_URL`: URL da instância Supabase
  - `VITE_SUPABASE_ANON_KEY`: Chave pública anônima para queries no cliente
  - Preservadas estritamente em `.env.local` (nunca expostas ou comitadas).

---

## 2. Tabelas e Estruturas Registradas

### 2.1. `public.categories` (13 registros preservados)
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `name` (TEXT, NOT NULL)
- `slug` (TEXT, NOT NULL, UNIQUE)
- `description` (TEXT, Nullable)
- `layout_type` (TEXT, default 'grid' / 'carousel')
- `sort_order` (INTEGER, NOT NULL, default 1)
- `active` (BOOLEAN, NOT NULL, default TRUE)
- `created_at` (TIMESTAMPTZ, default `now()`)
- `updated_at` (TIMESTAMPTZ, default `now()`)

### 2.2. `public.products` (114 registros preservados)
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `category_id` (UUID, Foreign Key -> `categories.id`)
- `name` (TEXT, NOT NULL)
- `description` (TEXT, Nullable)
- `price` (NUMERIC(10,2), NOT NULL)
- `promo_price` (NUMERIC(10,2), Nullable)
- `image` (TEXT, URL no Supabase Storage)
- `image_url` (TEXT, Nullable)
- `gallery` (TEXT[] / JSONB, lista de URLs)
- `is_promo` (BOOLEAN, default FALSE)
- `is_new` (BOOLEAN, default FALSE)
- `is_featured` (BOOLEAN, default FALSE)
- `short_description` (TEXT)
- `detailed_description` (TEXT)
- `specifications` (TEXT[] / JSONB)
- `observations` (TEXT)
- `sort_order` (INTEGER, default 1)
- `active` (BOOLEAN, default TRUE)
- `created_at` (TIMESTAMPTZ, default `now()`)
- `updated_at` (TIMESTAMPTZ, default `now()`)

### 2.3. `public.subproducts` (0 registros no momento do backup)
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL)
- `description` (TEXT, Nullable)
- `price` (NUMERIC(10,2), NOT NULL default 0.00)
- `image` (TEXT, Nullable)
- `active` (BOOLEAN, NOT NULL default TRUE)
- `sort_order` (INTEGER, default 1)
- `created_at` (TIMESTAMPTZ, default `now()`)
- `updated_at` (TIMESTAMPTZ, default `now()`)

### 2.4. `public.product_subproducts` (0 registros no momento do backup)
- `id` (UUID, Primary Key)
- `product_id` (UUID, FK -> `products.id` on delete cascade)
- `subproduct_id` (UUID, FK -> `subproducts.id` on delete cascade)
- `sort_order` (INTEGER, default 1)
- `created_at` (TIMESTAMPTZ, default `now()`)
- Restrição UNIQUE: `(product_id, subproduct_id)`

### 2.5. `public.profiles`
- `id` (UUID, Primary Key, references `auth.users(id)`)
- `role` (TEXT, ex: 'admin')

---

## 3. Políticas de Segurança (Row Level Security - RLS)
- **categories & products**:
  - Leitura pública permitida para itens ativos (`active = true`).
  - Escrita (INSERT, UPDATE, DELETE) restrita a usuários autenticados com perfil administrador (`profiles.role = 'admin'`).
- **subproducts & product_subproducts**:
  - Leitura pública restrita a subprodutos ativos associados a produtos ativos.
  - Escrita restrita a administradores autenticados.

---

## 4. Supabase Storage
- **Bucket Principal:** `product-images` (acesso público para leitura dos assets do catálogo).
- **Subpastas:**
  - Imagens de produtos: raiz do bucket com timestamp (ex: `1789832567789_caixa2bebe.jpeg`).
  - Subprodutos: prefixo `subproducts/`.

---

## 5. Diretrizes de Preservação e Restauração
1. Nenhuma migration DROP ou TRUNCATE poderá ser aplicada.
2. Qualquer restauração de dados deve priorizar UPDATE / UPSERT sem remover novos registros cadastrados pelo cliente.
3. Os backups em JSON estão salvos em: `backups/VERSAO_01_ORIGINAL/database/`.
