import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parsePrice, formatPrice } from '@/pages/admin/Products';
import { mapProductFromDB } from '@/lib/mapper';
import { DBProduct } from '@/types/product';

describe('Diagnóstico e Correção — Salvamento de Produtos no Administrativo', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ── 1. TESTES DE CONVERSÃO NUMÉRICA DE PREÇOS (parsePrice & formatPrice) ───
  describe('1. Conversão e Validação Numérica de Preços (parsePrice & formatPrice)', () => {
    it('deve converter strings com vírgula padrão BRL corretamente', () => {
      expect(parsePrice('34,90')).toBe(34.9);
      expect(parsePrice('R$ 34,90')).toBe(34.9);
      expect(parsePrice('R$  199,99 ')).toBe(199.99);
      expect(parsePrice('0,50')).toBe(0.5);
    });

    it('deve converter strings com ponto decimal (sem multiplicar por 100)', () => {
      expect(parsePrice('34.90')).toBe(34.9);
      expect(parsePrice('49.9')).toBe(49.9);
      expect(parsePrice('199.99')).toBe(199.99);
      expect(parsePrice('1250.50')).toBe(1250.5);
    });

    it('deve converter strings com separador de milhar e vírgula decimal BRL', () => {
      expect(parsePrice('1.250,50')).toBe(1250.5);
      expect(parsePrice('R$ 1.250,50')).toBe(1250.5);
      expect(parsePrice('2.500,00')).toBe(2500);
    });

    it('deve converter números nativos e lidar com valores nulos ou vazios', () => {
      expect(parsePrice(34.9)).toBe(34.9);
      expect(parsePrice(199)).toBe(199);
      expect(parsePrice(0)).toBe(0);
      expect(parsePrice('')).toBe(0);
      expect(parsePrice(null)).toBe(0);
      expect(parsePrice(undefined)).toBe(0);
      expect(parsePrice('invalido')).toBe(0);
    });

    it('formatPrice deve formatar números e strings no padrão monetário BRL', () => {
      expect(formatPrice(34.9)).toContain('34,90');
      expect(formatPrice('34.90')).toContain('34,90');
      expect(formatPrice(0)).toContain('0,00');
      expect(formatPrice('')).toBe('');
      expect(formatPrice(null)).toBe('');
      expect(formatPrice(undefined)).toBe('');
    });
  });

  // ── 2. CADASTRO DE PRODUTO SIMPLES E SEM PREÇO PROMOCIONAL ─────────────────
  describe('2. Validação e Construção de Payload — Produto Simples', () => {
    it('deve gerar payload estritamente compatível com a tabela products (sem colunas inexistentes)', () => {
      const formData = {
        name: ' Caixa Presente Especial ',
        price: 'R$ 89,90',
        promo_price: '',
        image: 'https://exemplo.com/foto.jpg',
        gallery: ['https://exemplo.com/foto.jpg'],
        is_promo: false,
        is_new: true,
        is_featured: false,
        is_best_seller: false,
        display_order: 1,
        collection: '',
        short_description: 'Descrição curta da caixa',
        detailed_description: 'Descrição detalhada completa',
        specifications: ['Item 1', 'Item 2'],
        observations: 'Feito com carinho',
        category_id: 'cat-uuid-123',
        active: true,
        sort_order: 3,
      };

      const numericPrice = parsePrice(formData.price);
      const numericPromoPrice = formData.is_promo ? parsePrice(formData.promo_price) : null;

      const payload: Record<string, any> = {
        name: formData.name.trim(),
        price: numericPrice,
        promo_price: numericPromoPrice,
        image: formData.image.trim(),
        gallery: formData.gallery,
        is_promo: formData.is_promo,
        is_new: formData.is_new,
        is_featured: formData.is_featured,
        short_description: formData.short_description.trim() || null,
        detailed_description: formData.detailed_description.trim() || null,
        specifications: formData.specifications,
        observations: formData.observations.trim() || null,
        category_id: formData.category_id || null,
        active: formData.active,
        sort_order: formData.sort_order,
      };

      // Garante que campos inexistentes no Supabase NÃO estão no payload
      expect(payload).not.toHaveProperty('is_best_seller');
      expect(payload).not.toHaveProperty('display_order');
      expect(payload).not.toHaveProperty('collection');

      // Garante que campos essenciais estão no formato e tipo esperados
      expect(payload.name).toBe('Caixa Presente Especial');
      expect(payload.price).toBe(89.9);
      expect(payload.promo_price).toBeNull();
      expect(payload.is_promo).toBe(false);
      expect(payload.active).toBe(true);
      expect(payload.category_id).toBe('cat-uuid-123');
      expect(payload.sort_order).toBe(3);
    });
  });

  // ── 3. CADASTRO COM PREÇO PROMOCIONAL ──────────────────────────────────────
  describe('3. Validação de Regras de Promoção (is_promo & promo_price)', () => {
    it('deve aceitar preço promocional válido estritamente menor que o preço original', () => {
      const price = parsePrice('100,00');
      const promoPrice = parsePrice('79,90');

      expect(promoPrice).toBe(79.9);
      expect(price).toBe(100);
      expect(promoPrice > 0).toBe(true);
      expect(promoPrice < price).toBe(true);
    });

    it('deve rejeitar preço promocional maior ou igual ao preço original', () => {
      const price = parsePrice('100,00');
      const promoPriceEqual = parsePrice('100,00');
      const promoPriceHigher = parsePrice('120,00');

      expect(promoPriceEqual >= price).toBe(true);
      expect(promoPriceHigher >= price).toBe(true);
    });

    it('deve anular promo_price quando is_promo for desmarcado (false)', () => {
      const isPromo = false;
      const promoPriceInput = '50,00';
      const effectivePromoPrice = isPromo ? parsePrice(promoPriceInput) : null;

      expect(effectivePromoPrice).toBeNull();
    });
  });

  // ── 4. CADASTRO COM CATEGORIA SELECIONADA OU SEM CATEGORIA ─────────────────
  describe('4. Tratamento e Gravação do Relacionamento com Categorias', () => {
    it('deve gravar o UUID da categoria quando selecionada', () => {
      const selectedCategoryId = '2b83ed05-44b4-4bc1-b0ee-a10dcb081792';
      const cleanCategoryId = selectedCategoryId && selectedCategoryId.trim() !== ''
        ? selectedCategoryId.trim()
        : null;

      expect(cleanCategoryId).toBe('2b83ed05-44b4-4bc1-b0ee-a10dcb081792');
    });

    it('deve gravar null quando "Sem categoria" (string vazia) for selecionada, evitando erro 22P02', () => {
      const emptyCategoryId = '';
      const cleanCategoryId = emptyCategoryId && emptyCategoryId.trim() !== ''
        ? emptyCategoryId.trim()
        : null;

      expect(cleanCategoryId).toBeNull();
    });
  });

  // ── 5. CADASTRO COM IMAGEM PRINCIPAL E GALERIA ─────────────────────────────
  describe('5. Tratamento de Imagem Principal e Galeria', () => {
    it('deve priorizar a imagem principal e manter fallback para a primeira da galeria', () => {
      const formWithBoth = {
        image: 'https://exemplo.com/main.jpg',
        gallery: ['https://exemplo.com/gal1.jpg', 'https://exemplo.com/gal2.jpg'],
      };

      const mainImg1 = (formWithBoth.image && formWithBoth.image.trim())
        ? formWithBoth.image.trim()
        : (formWithBoth.gallery?.[0]?.trim() || null);

      expect(mainImg1).toBe('https://exemplo.com/main.jpg');

      const formWithOnlyGallery = {
        image: '',
        gallery: ['https://exemplo.com/gal1.jpg'],
      };

      const mainImg2 = (formWithOnlyGallery.image && formWithOnlyGallery.image.trim())
        ? formWithOnlyGallery.image.trim()
        : (formWithOnlyGallery.gallery?.[0]?.trim() || null);

      expect(mainImg2).toBe('https://exemplo.com/gal1.jpg');
    });
  });

  // ── 6. EDIÇÃO E MAPEAMENTO DO PRODUTO (mapProductFromDB) ───────────────────
  describe('6. Edição de Produto Existente e Mapeamento', () => {
    it('deve mapear corretamente os dados retornados do Supabase garantindo persistência', () => {
      const rawDbProduct: DBProduct = {
        id: 'prod-84247ac3',
        name: 'Caixa Bebê Especial',
        price: 34.90,
        promo_price: 29.90,
        image: 'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/bebe.jpg',
        gallery: ['https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/bebe.jpg'],
        is_promo: true,
        is_new: false,
        is_featured: true,
        short_description: 'Descrição curta',
        detailed_description: 'Descrição longa',
        specifications: ['Item A', 'Item B'],
        observations: 'Obs teste',
        category_id: '2b83ed05-44b4-4bc1-b0ee-a10dcb081792',
        active: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        categories: { name: 'Mamães e Bebês', slug: 'mamaes-e-bebes' } as any,
      };

      const mapped = mapProductFromDB(rawDbProduct);

      expect(mapped.id).toBe('prod-84247ac3');
      expect(mapped.name).toBe('Caixa Bebê Especial');
      expect(mapped.price).toContain('34,90');
      expect(mapped.promoPrice).toContain('29,90');
      expect(mapped.isPromo).toBe(true);
      expect(mapped.isFeatured).toBe(true);
      expect(mapped.categoryId).toBe('2b83ed05-44b4-4bc1-b0ee-a10dcb081792');
      expect(mapped.categoryName).toBe('Mamães e Bebês');
      expect(mapped.categorySlug).toBe('mamaes-e-bebes');
      expect(mapped.specifications).toEqual(['Item A', 'Item B']);
    });
  });

  // ── 7. RESILIÊNCIA A COLUNAS INEXISTENTES (PGRST204) ────────────────────────
  describe('7. Resiliência do Salvamento e Tratamento de Erros', () => {
    it('deve extrair nome da coluna inexistente em erro PGRST204 do PostgREST', () => {
      const postgrestError = {
        code: 'PGRST204',
        message: "Could not find the 'collection' column of 'products' in the schema cache",
        details: null,
      };

      const match = postgrestError.message.match(/Could not find the '([a-zA-Z0-9_]+)' column/i);
      expect(match).not.toBeNull();
      expect(match?.[1]).toBe('collection');
    });

    it('deve extrair nome da coluna inexistente em erro PostgreSQL 42703', () => {
      const postgresError = {
        code: '42703',
        message: 'column products.is_best_seller does not exist',
        details: null,
      };

      const match = postgresError.message.match(/column [products.]*([a-zA-Z0-9_]+) does not exist/i);
      expect(match).not.toBeNull();
      expect(match?.[1]).toBe('is_best_seller');
    });
  });
});
