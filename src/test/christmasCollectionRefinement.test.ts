import { describe, it, expect } from 'vitest';
import { Product } from '@/types/product';
import { mapProductFromDB } from '@/lib/mapper';

describe('REFINAMENTO PREMIUM — COLEÇÃO DE NATAL', () => {
  it('1. mapProductFromDB mapeia corretamente is_best_seller, display_order e collection', () => {
    const dbItem = {
      id: 'uuid-natal-1',
      name: 'Cesta Café Amanhecer',
      price: 290.0,
      is_best_seller: true,
      display_order: 1,
      collection: 'natal',
      image: '/natal/cesta_amanhecer.jpg',
      short_description: 'Descrição de teste',
      active: true
    };

    const mapped = mapProductFromDB(dbItem);
    expect(mapped.id).toBe('uuid-natal-1');
    expect(mapped.name).toBe('Cesta Café Amanhecer');
    expect(mapped.isBestSeller).toBe(true);
    expect(mapped.displayOrder).toBe(1);
    expect(mapped.collection).toBe('natal');
    expect(mapped.price.replace(/\s/g, ' ')).toBe('R$ 290,00');
  });

  it('2. Ordenação da Coleção de Natal prioriza produto com MAIS PEDIDO ativado', () => {
    const products: Product[] = [
      {
        id: '2',
        name: 'Mini Café Pinus',
        price: 'R$ 190,00',
        shortDescription: '',
        detailedDescription: '',
        specifications: [],
        observations: '',
        isBestSeller: false,
        displayOrder: 1,
        collection: 'natal'
      },
      {
        id: '1',
        name: 'Cesta Café Amanhecer',
        price: 'R$ 290,00',
        shortDescription: '',
        detailedDescription: '',
        specifications: [],
        observations: '',
        isBestSeller: true,
        displayOrder: 10, // displayOrder maior, mas tem MAIS PEDIDO
        collection: 'natal'
      },
      {
        id: '3',
        name: 'Cesta Café Amor em Detalhe',
        price: 'R$ 235,00',
        shortDescription: '',
        detailedDescription: '',
        specifications: [],
        observations: '',
        isBestSeller: false,
        displayOrder: 2,
        collection: 'natal'
      }
    ];

    const sorted = [...products].sort((a, b) => {
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      const orderA = a.displayOrder ?? a.sortOrder ?? 999;
      const orderB = b.displayOrder ?? b.sortOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });

    // 1. Produto com MAIS PEDIDO aparece primeiro
    expect(sorted[0].id).toBe('1');
    expect(sorted[0].name).toBe('Cesta Café Amanhecer');
    expect(sorted[0].isBestSeller).toBe(true);

    // 2. Demais produtos respeitam displayOrder
    expect(sorted[1].id).toBe('2');
    expect(sorted[2].id).toBe('3');
  });

  it('3. Somente o produto marcado recebe o selo MAIS PEDIDO', () => {
    const products: Product[] = [
      {
        id: '1',
        name: 'Cesta Café Amanhecer',
        price: 'R$ 290,00',
        shortDescription: '',
        detailedDescription: '',
        specifications: [],
        observations: '',
        isBestSeller: true,
        collection: 'natal'
      },
      {
        id: '2',
        name: 'Mini Café Pinus',
        price: 'R$ 190,00',
        shortDescription: '',
        detailedDescription: '',
        specifications: [],
        observations: '',
        isBestSeller: false,
        collection: 'natal'
      }
    ];

    const bestSellers = products.filter(p => p.isBestSeller);
    expect(bestSellers.length).toBe(1);
    expect(bestSellers[0].name).toBe('Cesta Café Amanhecer');
  });

  it('4. Ao alternar MAIS PEDIDO para outro produto, o selo e a prioridade mudam dinamicamente', () => {
    let products: Product[] = [
      {
        id: '1',
        name: 'Cesta Café Amanhecer',
        price: 'R$ 290,00',
        shortDescription: '',
        detailedDescription: '',
        specifications: [],
        observations: '',
        isBestSeller: true,
        displayOrder: 1,
        collection: 'natal'
      },
      {
        id: '2',
        name: 'Mini Café Pinus',
        price: 'R$ 190,00',
        shortDescription: '',
        detailedDescription: '',
        specifications: [],
        observations: '',
        isBestSeller: false,
        displayOrder: 2,
        collection: 'natal'
      }
    ];

    // Simula admin ativando MAIS PEDIDO no Mini Café Pinus e desativando na Cesta Café Amanhecer
    products = products.map(p => {
      if (p.id === '2') return { ...p, isBestSeller: true };
      if (p.id === '1') return { ...p, isBestSeller: false };
      return p;
    });

    const sorted = [...products].sort((a, b) => {
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      const orderA = a.displayOrder ?? a.sortOrder ?? 999;
      const orderB = b.displayOrder ?? b.sortOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });

    expect(sorted[0].id).toBe('2');
    expect(sorted[0].name).toBe('Mini Café Pinus');
    expect(sorted[0].isBestSeller).toBe(true);
    expect(sorted[1].id).toBe('1');
    expect(sorted[1].isBestSeller).toBe(false);
  });
});
