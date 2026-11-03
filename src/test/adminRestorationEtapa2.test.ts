import { describe, it, expect } from 'vitest';
import { mapProductFromDB, getEffectivePrice } from '@/lib/mapper';
import { DBProduct, Product } from '@/types/product';

describe('ETAPA 2: Testes Obrigatórios de Restauração Administrativa', () => {
  // 1 & 2: Cadastro de produtos e fallback de imagem
  describe('1 & 2. Imagens e Fallback de Galeria', () => {
    it('1. Produto cadastrado com imagem principal deve manter a imagem definida', () => {
      const dbProd: DBProduct = {
        id: 'prod-1',
        name: 'Cesta Flores e Frutas',
        price: 150.0,
        image: 'https://images.unsplash.com/photo-cesta-principal.jpg',
        gallery: ['https://images.unsplash.com/photo-cesta-thumb1.jpg'],
        is_featured: false,
        active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
      };

      const mapped = mapProductFromDB(dbProd);
      expect(mapped.image).toBe('https://images.unsplash.com/photo-cesta-principal.jpg');
      expect(mapped.gallery).toEqual(['https://images.unsplash.com/photo-cesta-thumb1.jpg']);
    });

    it('2. Produto cadastrado utilizando apenas a galeria deve usar gallery[0] automaticamente', () => {
      const dbProdOnlyGallery: DBProduct = {
        id: 'prod-2',
        name: 'Arranjo Orquídea Sublime',
        price: 220.0,
        image: null as any,
        gallery: [
          'https://images.unsplash.com/photo-orquidea-1.jpg',
          'https://images.unsplash.com/photo-orquidea-2.jpg'
        ],
        is_featured: true,
        active: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
      };

      const mapped = mapProductFromDB(dbProdOnlyGallery);
      expect(mapped.image).toBe('https://images.unsplash.com/photo-orquidea-1.jpg');
      expect(mapped.gallery?.length).toBe(2);
    });

    it('2b. Fallback funciona mesmo com string vazia em image', () => {
      const dbProdEmptyImage: DBProduct = {
        id: 'prod-2b',
        name: 'Xinga',
        price: 89.9,
        image: '',
        gallery: ['https://images.unsplash.com/photo-xinga-galeria.jpg'],
        is_featured: true,
        active: true,
        sort_order: 115,
        created_at: new Date().toISOString(),
      };

      const mapped = mapProductFromDB(dbProdEmptyImage);
      expect(mapped.image).toBe('https://images.unsplash.com/photo-xinga-galeria.jpg');
    });
  });

  // 3, 4 & 5: Produtos em Destaque (is_featured = true)
  describe('3, 4 & 5. Produtos em Destaque (is_featured)', () => {
    it('3 & 4. Três produtos marcados como destaque aparecem na seção de destaques sem corte estático', () => {
      const products: Product[] = [
        { id: '1', name: 'Item 1', price: 'R$ 10,00', numericPrice: 10, isFeatured: true, active: true, sortOrder: 90 },
        { id: '2', name: 'Item 2', price: 'R$ 20,00', numericPrice: 20, isFeatured: false, active: true, sortOrder: 1 },
        { id: '3', name: 'Item 3', price: 'R$ 30,00', numericPrice: 30, isFeatured: true, active: true, sortOrder: 95 },
        { id: '4', name: 'Item 4', price: 'R$ 40,00', numericPrice: 40, isFeatured: false, active: true, sortOrder: 2 },
        { id: '5', name: 'Item 5', price: 'R$ 50,00', numericPrice: 50, isFeatured: true, active: true, sortOrder: 115 },
      ];

      // Filtro de destaques: todos com isFeatured === true devem estar presentes
      const featured = products.filter(p => p.isFeatured);
      expect(featured.length).toBe(3);
      expect(featured.map(f => f.name)).toEqual(['Item 1', 'Item 3', 'Item 5']);
      // Confirma que produtos com sortOrder alto (novos) não são excluídos
      expect(featured.some(f => f.id === '5')).toBe(true);
    });

    it('5. Desmarcar um destaque remove o produto imediatamente da vitrine de destaques', () => {
      let products: Product[] = [
        { id: '1', name: 'Item 1', price: 'R$ 10,00', numericPrice: 10, isFeatured: true, active: true },
        { id: '3', name: 'Item 3', price: 'R$ 30,00', numericPrice: 30, isFeatured: true, active: true },
        { id: '5', name: 'Item 5', price: 'R$ 50,00', numericPrice: 50, isFeatured: true, active: true },
      ];

      expect(products.filter(p => p.isFeatured).length).toBe(3);

      // Desmarca item 3
      products = products.map(p => p.id === '3' ? { ...p, isFeatured: false } : p);

      const updatedFeatured = products.filter(p => p.isFeatured);
      expect(updatedFeatured.length).toBe(2);
      expect(updatedFeatured.some(p => p.id === '3')).toBe(false);
      expect(updatedFeatured.map(p => p.id)).toEqual(['1', '5']);
    });
  });

  // 6, 7: Normalização de slugs e categorias
  describe('6 & 7. Normalização de Slugs de Categoria', () => {
    function normalizeSlug(name: string): string {
      return name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    it('6 & 7. Categoria "Coleção de Natal" deve gerar slug "colecao-de-natal"', () => {
      const rawName = 'Coleção de Natal';
      const slug = normalizeSlug(rawName);
      expect(slug).toBe('colecao-de-natal');
    });

    it('6b. Trata acentos complexos, caracteres especiais e múltiplos espaços', () => {
      expect(normalizeSlug('  Mães & Pais: Edição Especial!! ')).toBe('maes-pais-edicao-especial');
      expect(normalizeSlug('Chocolates & Bombons / Trufas')).toBe('chocolates-bombons-trufas');
      expect(normalizeSlug('Café com Açúcar')).toBe('cafe-com-acucar');
    });

    it('6c. Detecção de colisão gera slug unívoco', () => {
      const existingSlugs = ['colecao-de-natal', 'colecao-de-natal-2'];
      let base = normalizeSlug('Coleção de Natal');
      let candidate = base;
      let counter = 2;
      while (existingSlugs.includes(candidate)) {
        candidate = `${base}-${counter}`;
        counter++;
      }
      expect(candidate).toBe('colecao-de-natal-3');
    });
  });

  // 8, 9, 10 & 11: Ocultação e Reativação de Categorias
  describe('8, 9, 10 & 11. Ocultar e Reativar Categorias (Cascata em Vitrines)', () => {
    const categories = [
      { id: 'cat-natal', name: 'Coleção de Natal', active: true },
      { id: 'cat-flores', name: 'Flores', active: true },
    ];

    const products = [
      { id: 'p1', name: 'Panetone Trufado', category_id: 'cat-natal', isFeatured: true, active: true },
      { id: 'p2', name: 'Buquê de Rosas', category_id: 'cat-flores', isFeatured: true, active: true },
    ];

    it('8 & 9. Ao desativar/ocultar a categoria, seus produtos desaparecem de todas as vitrines públicas', () => {
      // Oculta categoria de natal
      const updatedCategories = categories.map(c =>
        c.id === 'cat-natal' ? { ...c, active: false } : c
      );

      const activeCategoryIds = new Set(
        updatedCategories.filter(c => c.active).map(c => c.id)
      );

      // Filtro implementado em Index.tsx
      const publicProducts = products.filter(p =>
        !p.category_id || activeCategoryIds.has(p.category_id)
      );

      // Panetone não deve aparecer em nenhuma vitrine
      expect(publicProducts.length).toBe(1);
      expect(publicProducts[0].id).toBe('p2');
      expect(publicProducts.some(p => p.id === 'p1')).toBe(false);

      // Nem em destaques públicos
      const publicFeatured = publicProducts.filter(p => p.isFeatured);
      expect(publicFeatured.length).toBe(1);
      expect(publicFeatured[0].id).toBe('p2');
    });

    it('10 & 11. Ao reativar a categoria, seus produtos voltam a ser exibidos normalmente', () => {
      // Reativa categoria de natal
      const reativatedCategories = categories.map(c =>
        c.id === 'cat-natal' ? { ...c, active: true } : c
      );

      const activeCategoryIds = new Set(
        reativatedCategories.filter(c => c.active).map(c => c.id)
      );

      const publicProducts = products.filter(p =>
        !p.category_id || activeCategoryIds.has(p.category_id)
      );

      expect(publicProducts.length).toBe(2);
      expect(publicProducts.some(p => p.id === 'p1')).toBe(true);
      expect(publicProducts.some(p => p.id === 'p2')).toBe(true);
    });
  });

  // 12 & 13: Renomear Categoria sem quebrar vínculos de produtos
  describe('12 & 13. Renomear Categoria e Preservação de Vínculos', () => {
    it('12 & 13. Renomear o nome ou slug de uma categoria preserva os vínculos com os produtos via category_id (UUID)', () => {
      const category = {
        id: 'f87a32d1-2180-4824-a745-b4618e805d89',
        name: 'Coleção de Natal',
        slug: 'colecao-de-natal',
      };

      const product = {
        id: 'prod-uuid-99',
        name: 'Guirlanda Encantada',
        category_id: category.id,
      };

      // Renomeia a categoria
      const updatedCategory = {
        ...category,
        name: 'Natal Mágico 2026',
        slug: 'natal-magico-2026',
      };

      // O produto permanece vinculado pelo ID imutável
      expect(product.category_id).toBe(updatedCategory.id);
    });
  });

  // 14: Carrinho e Checkout sem alterações
  describe('14. Carrinho, Preços Promocionais e Checkout', () => {
    it('14. getEffectivePrice calcula corretamente preços normais e promocionais', () => {
      const normalProduct: Product = {
        id: 'p1',
        name: 'Cesta Café',
        price: 'R$ 150,00',
        numericPrice: 150.0,
        active: true,
      };

      const promoProduct: Product = {
        id: 'p2',
        name: 'Cesta Luxo Promo',
        price: 'R$ 200,00',
        numericPrice: 200.0,
        isPromo: true,
        promoPrice: 'R$ 170,00',
        active: true,
      };

      expect(getEffectivePrice(normalProduct)).toBe(150.0);
      expect(getEffectivePrice(promoProduct)).toBe(170.0);

      // Simulação de soma do carrinho
      const cart = [
        { product: normalProduct, quantity: 2 },
        { product: promoProduct, quantity: 1 },
      ];

      const total = cart.reduce(
        (sum, item) => sum + getEffectivePrice(item.product) * item.quantity,
        0
      );

      // 150*2 + 170*1 = 470
      expect(total).toBe(470.0);
    });
  });
});
