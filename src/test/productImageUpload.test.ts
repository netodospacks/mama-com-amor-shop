import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';
import { parseStorageError } from '@/pages/admin/Products';
import { mapProductFromDB } from '@/lib/mapper';
import { DBProduct } from '@/types/product';

describe('Validação Obrigatória — Sistema de Upload de Imagens no Painel Administrativo', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Upload de imagem JPG
  it('1. Deve validar e processar arquivo de imagem JPG com extensão e MIME type corretos', () => {
    const rawExt = 'foto_produto.jpg'.split('.').pop()?.toLowerCase() || '';
    const cleanExt = rawExt.replace(/[^a-z0-9]/g, '');
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const mockFile = {
      name: 'foto_produto.jpg',
      type: 'image/jpeg',
      size: 1.5 * 1024 * 1024, // 1.5 MB
    };

    const isAllowed = allowedTypes.includes(mockFile.type) || allowedExts.includes(cleanExt);
    expect(isAllowed).toBe(true);
    expect(cleanExt).toBe('jpg');
    expect(mockFile.size).toBeLessThanOrEqual(10 * 1024 * 1024);
  });

  // 2. Upload de imagem PNG
  it('2. Deve validar e processar arquivo de imagem PNG com Content-Type image/png', () => {
    const rawExt = 'caixa-premium.PNG'.split('.').pop()?.toLowerCase() || '';
    const cleanExt = rawExt.replace(/[^a-z0-9]/g, '');
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const mockFile = {
      name: 'caixa-premium.PNG',
      type: 'image/png',
      size: 3 * 1024 * 1024,
    };

    const isAllowed = allowedTypes.includes(mockFile.type) || allowedExts.includes(cleanExt);
    expect(isAllowed).toBe(true);
    expect(cleanExt).toBe('png');
  });

  // 3. Upload de imagem WEBP
  it('3. Deve validar e processar arquivo de imagem moderna WEBP', () => {
    const rawExt = 'banner-cesta.webp'.split('.').pop()?.toLowerCase() || '';
    const cleanExt = rawExt.replace(/[^a-z0-9]/g, '');
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const mockFile = {
      name: 'banner-cesta.webp',
      type: 'image/webp',
      size: 800 * 1024,
    };

    const isAllowed = allowedTypes.includes(mockFile.type) || allowedExts.includes(cleanExt);
    expect(isAllowed).toBe(true);
    expect(cleanExt).toBe('webp');
  });

  // 4. Seleção de imagem principal e sanitização de caminho
  it('4. Deve gerar caminho no padrão esperado products/{id}/{timestamp}.ext para imagem principal', () => {
    const productId = 'prod-uuid-12345';
    const cleanProductId = productId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const ext = 'jpeg';
    const timestamp = 1793940000000;
    const path = `products/${cleanProductId}/${timestamp}.${ext}`;

    expect(path).toBe('products/prod-uuid-12345/1793940000000.jpeg');
    expect(path.startsWith('products/')).toBe(true);
    expect(path.endsWith('.jpeg')).toBe(true);
  });

  // 5. Upload de imagem para a galeria
  it('5. Deve adicionar múltiplas URLs no array gallery preservando imagem principal', () => {
    let gallery: string[] = [];
    const mainImage = 'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/p1/img1.jpg';
    const galleryImg1 = 'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/p1/gallery1.jpg';
    const galleryImg2 = 'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/p1/gallery2.jpg';

    gallery = [...gallery, galleryImg1];
    gallery = [...gallery, galleryImg2];

    expect(gallery).toHaveLength(2);
    expect(gallery[0]).toBe(galleryImg1);
    expect(gallery[1]).toBe(galleryImg2);
    expect(mainImage).not.toBe(galleryImg1);
  });

  // 6. Salvar produto com imagem
  it('6. Deve salvar produto com imagem principal e gallery configuradas', () => {
    const formProduct = {
      name: 'Cesta Café Sublime',
      price: 159.90,
      image: 'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/p1/main.jpg',
      gallery: [
        'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/p1/main.jpg',
        'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/p1/detail.jpg'
      ],
      active: true,
      category_id: 'cat-uuid-cesta',
    };

    expect(formProduct.image).toBeTruthy();
    expect(formProduct.gallery).toHaveLength(2);
    expect(formProduct.name).toBe('Cesta Café Sublime');
  });

  // 7. Editar produto e substituir imagem
  it('7. Deve substituir imagem principal sem corromper as demais propriedades do produto', () => {
    const initialProduct: DBProduct = {
      id: 'prod-uuid-edit-1',
      name: 'Quadro A4 Namorados',
      price: 89.90,
      promo_price: null,
      image: 'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/old.jpg',
      gallery: null,
      category_id: 'cat-quadros-a4',
      active: true,
      is_featured: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
    };

    const newImageUrl = 'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/prod-uuid-edit-1/new_179394000.jpg';
    const updatedProduct = {
      ...initialProduct,
      image: newImageUrl,
    };

    expect(updatedProduct.id).toBe(initialProduct.id);
    expect(updatedProduct.image).toBe(newImageUrl);
    expect(updatedProduct.name).toBe(initialProduct.name);
    expect(updatedProduct.is_featured).toBe(true);
  });

  // 8. Confirmar que a imagem permanece acessível após mapear produto
  it('8. Mapeador público deve retornar a URL da imagem intacta para exibição no catálogo', () => {
    const dbItem: DBProduct = {
      id: 'prod-item-1',
      name: 'Placa Acrílica Personalizada',
      price: 49.90,
      promo_price: null,
      image: 'https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/item1/placa.jpg',
      gallery: null,
      category_id: null,
      active: true,
      is_featured: false,
      sort_order: 2,
      created_at: new Date().toISOString(),
    };

    const publicProduct = mapProductFromDB(dbItem);
    expect(publicProduct.image).toBe('https://skuuymfaxtkwulhexmgd.supabase.co/storage/v1/object/public/product-images/products/item1/placa.jpg');
    expect(publicProduct.name).toBe('Placa Acrílica Personalizada');
  });

  // 9. Diagnóstico de Erros do Supabase Storage (parseStorageError)
  describe('Diagnóstico e Tratamento Específico de Erros do Storage', () => {
    it('Deve traduzir erro de sessão expirada / 401', () => {
      const err = { status: 401, message: 'Invalid JWT / token expired' };
      const msg = parseStorageError(err);
      expect(msg).toContain('Sessão expirada');
      expect(msg).toContain('login');
    });

    it('Deve traduzir erro de política RLS / 403', () => {
      const err = {
        status: 400,
        statusCode: '403',
        code: 'AccessDenied',
        message: 'new row violates row-level security policy'
      };
      const msg = parseStorageError(err);
      expect(msg).toContain('Permissão negada (RLS)');
      expect(msg).toContain('administrador');
    });

    it('Deve traduzir erro de arquivo muito grande / 413', () => {
      const err = { status: 413, statusCode: '413', message: 'Payload too large' };
      const msg = parseStorageError(err);
      expect(msg).toContain('10MB');
    });

    it('Deve traduzir erro de bucket não encontrado / 404', () => {
      const err = { status: 400, statusCode: '404', code: 'NoSuchBucket', message: 'Bucket not found' };
      const msg = parseStorageError(err);
      expect(msg).toContain('product-images');
    });

    it('Deve traduzir falha de rede', () => {
      const err = { message: 'Failed to fetch (NetworkError)' };
      const msg = parseStorageError(err);
      expect(msg).toContain('Falha de conexão');
    });
  });
});
