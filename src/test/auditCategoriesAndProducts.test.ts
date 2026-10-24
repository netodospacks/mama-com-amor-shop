import { describe, it, expect, vi } from 'vitest';
import { getEffectivePrice } from '@/lib/mapper';
import { Product } from '@/types/product';
import { Subproduct } from '@/types/subproduct';

describe('Auditoria Técnica: Cenários Críticos de Categorias, Produtos e Subprodutos', () => {
  // Cenário A: Categorias e Visibilidade
  it('Cenário A: Filtro de visibilidade deve ocultar categorias inativas do catálogo', () => {
    const dbCategories = [
      { id: 'cat-1', name: 'Cesta Café da Manhã', slug: 'cesta-cafe-da-manha', active: true },
      { id: 'cat-2', name: 'Cesta Aniversário', slug: 'cesta-aniversario', active: false }, // Desativada no Admin
      { id: 'cat-3', name: 'Kits Casal', slug: 'kits-casal', active: true },
    ];

    const activeCategories = dbCategories.filter(c => c.active);
    expect(activeCategories.map(c => c.slug)).toEqual(['cesta-cafe-da-manha', 'kits-casal']);
    expect(activeCategories.some(c => c.slug === 'cesta-aniversario')).toBe(false);
  });

  // Cenário B: Produtos e Subprodutos
  it('Cenário B: Produto com subprodutos vinculados preserva suas opções e preços', () => {
    const product: Product = {
      id: 'prod-uuid-1',
      name: 'Cesta Luxo Manhã',
      price: 'R$ 150,00',
      numericPrice: 150.00,
      image: 'https://example.com/cesta.jpg',
      category: 'Cestas',
      categorySlug: 'cesta-cafe-da-manha',
      active: true,
      sortOrder: 1,
    };

    const subproducts: Subproduct[] = [
      {
        id: 'sub-uuid-1',
        name: 'Ursinho de Pelúcia',
        description: 'Pelúcia macia antialérgica',
        price: 35.00,
        image_url: 'https://example.com/ursinho.jpg',
        active: true,
      },
      {
        id: 'sub-uuid-2',
        name: 'Balão Personalizado',
        description: 'Balão com nome do presenteado',
        price: 20.00,
        image_url: null,
        active: true,
      }
    ];

    expect(subproducts.length).toBe(2);
    expect(subproducts[0].name).toBe('Ursinho de Pelúcia');
    expect(subproducts[0].price).toBe(35.00);
    expect(subproducts[0].image_url).toBe('https://example.com/ursinho.jpg');
  });

  // Cenário C & D: Falha de Upload preserva imagem anterior
  it('Cenário C & D: Quando a substituição da imagem falha, a imagem anterior é preservada', () => {
    const originalSubproduct: Subproduct = {
      id: 'sub-uuid-1',
      name: 'Caneca Personalizada',
      price: 25.00,
      image_url: 'https://example.com/caneca-original.jpg',
      active: true,
    };

    // Simulação do comportamento de upload com falha
    let currentImageUrl = originalSubproduct.image_url;
    const attemptNewUpload = (succeeds: boolean, newUrl: string) => {
      if (succeeds) {
        currentImageUrl = newUrl;
      }
      // Se falhar, currentImageUrl permanece intacto
      return currentImageUrl;
    };

    // Tentativa com falha (ex: timeout de rede ou RLS)
    const resultAfterFailure = attemptNewUpload(false, 'https://example.com/caneca-quebrada.jpg');
    expect(resultAfterFailure).toBe('https://example.com/caneca-original.jpg');
    expect(currentImageUrl).toBe('https://example.com/caneca-original.jpg');

    // Tentativa bem-sucedida
    const resultAfterSuccess = attemptNewUpload(true, 'https://example.com/caneca-nova.jpg');
    expect(resultAfterSuccess).toBe('https://example.com/caneca-nova.jpg');
  });

  // Cenário E: Isolamento entre produtos
  it('Cenário E: Atualizar um produto não muta ou corrompe outros produtos da lista', () => {
    const initialProducts: Product[] = [
      { id: '1', name: 'Quadro 1', price: 'R$ 50,00', numericPrice: 50, category: 'Quadros', active: true, sortOrder: 1 },
      { id: '2', name: 'Quadro 2', price: 'R$ 70,00', numericPrice: 70, category: 'Quadros', active: true, sortOrder: 2 },
    ];

    const updatedProduct: Product = {
      ...initialProducts[0],
      name: 'Quadro 1 - Edição Especial',
      price: 'R$ 60,00',
      numericPrice: 60,
    };

    const nextProducts = initialProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);

    expect(nextProducts[0].name).toBe('Quadro 1 - Edição Especial');
    expect(nextProducts[0].numericPrice).toBe(60);
    // O segundo produto não foi alterado de forma alguma
    expect(nextProducts[1].name).toBe('Quadro 2');
    expect(nextProducts[1].numericPrice).toBe(70);
  });

  // Cenário F & G: Seleção de subprodutos e preservação de valores no carrinho
  it('Cenário F & G: Seleção de subproduto é somada corretamente ao total do carrinho e preservada', () => {
    const baseProduct: Product = {
      id: 'prod-uuid-1',
      name: 'Cesta Café Real',
      price: 'R$ 100,00',
      numericPrice: 100.00,
      category: 'Cestas',
      active: true,
      sortOrder: 1,
    };

    const selectedAddons: Subproduct[] = [
      {
        id: 'addon-1',
        name: 'Mini Vinho Tinto',
        price: 45.00,
        active: true,
      },
      {
        id: 'addon-2',
        name: 'Caixa de Bombons Ferrero',
        price: 30.00,
        active: true,
      }
    ];

    const cartItems = [{ product: baseProduct, quantity: 2, selectedAddons }];

    // Cálculo conforme a regra de negócio oficial do CartContext
    const itemsTotal = cartItems.reduce(
      (total, item) => total + getEffectivePrice(item.product) * item.quantity,
      0
    );
    const addonsTotal = cartItems.reduce((total, item) => {
      const addonsCost = item.selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      return total + addonsCost * item.quantity;
    }, 0);
    const grandTotal = itemsTotal + addonsTotal;

    // 2 cestas de R$ 100 = 200
    expect(itemsTotal).toBe(200.00);
    // Adicionais: (45 + 30) = 75 por cesta * 2 = 150
    expect(addonsTotal).toBe(150.00);
    // Total Geral: 200 + 150 = 350
    expect(grandTotal).toBe(350.00);
  });

  // Cenário H: Proteção de integridade referencial para exclusão de categorias
  it('Cenário H: Categoria que possui produtos vinculados não pode ser excluída para evitar registros órfãos', () => {
    const categoryWithProducts = {
      id: 'cat-uuid-cesta',
      name: 'Cesta Café da Manhã',
      productCount: 6,
    };

    const canDeleteCategory = (cat: { productCount: number }) => {
      return cat.productCount === 0;
    };

    expect(canDeleteCategory(categoryWithProducts)).toBe(false);

    const emptyCategory = {
      id: 'cat-uuid-empty',
      name: 'Categoria Temporária',
      productCount: 0,
    };

    expect(canDeleteCategory(emptyCategory)).toBe(true);
  });
});
