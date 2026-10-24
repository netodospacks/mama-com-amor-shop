import { supabase, isSupabaseConfigured } from './supabase';
import { Subproduct, SubproductInput } from '@/types/subproduct';

export const formatSubproductPrice = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return 'R$ 0,00';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/R\$\s?/gi, '').replace(/\./g, '').replace(',', '.').trim());
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

export const parseSubproductPrice = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const str = value.toString().replace(/R\$\s?/gi, '').trim();
  if (str.includes(',')) {
    // Formato brasileiro: 1.234,56 ou 19,90
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  // Formato com ponto decimal: 29.90
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

// Fallback mock subproducts para modo local ou offline
export const MOCK_DEFAULT_ADDONS: Subproduct[] = [
  {
    id: 'addon-choco-1',
    name: 'Caixa de Chocolates Finos',
    description: 'Seleção especial com bombons trufados artesanais.',
    price: 19.90,
    formattedPrice: 'R$ 19,90',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&auto=format&fit=crop&q=80',
    active: true,
    sort_order: 1,
  },
  {
    id: 'addon-pelucia-1',
    name: 'Ursinho de Pelúcia Fofo',
    description: 'Pelúcia macia antialérgica com laço delicado.',
    price: 29.90,
    formattedPrice: 'R$ 29,90',
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=400&auto=format&fit=crop&q=80',
    active: true,
    sort_order: 2,
  },
  {
    id: 'addon-card-1',
    name: 'Cartão Dedicatória Personalizado',
    description: 'Cartão especial impresso com a sua mensagem afetiva.',
    price: 7.90,
    formattedPrice: 'R$ 7,90',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80',
    active: true,
    sort_order: 3,
  },
  {
    id: 'addon-flores-1',
    name: 'Mini Buquê de Flores Naturais',
    description: 'Flores frescas harmonizadas para surpreender.',
    price: 34.90,
    formattedPrice: 'R$ 34,90',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&auto=format&fit=crop&q=80',
    active: true,
    sort_order: 4,
  },
  {
    id: 'addon-caneca-1',
    name: 'Caneca Especial com Frase',
    description: 'Caneca de cerâmica premium para eternizar momentos.',
    price: 24.90,
    formattedPrice: 'R$ 24,90',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    active: true,
    sort_order: 5,
  },
];

/**
 * Busca todos os adicionais ativos vinculados a um produto principal via tabela associativa.
 */
export async function fetchSubproductsForProduct(productId: string): Promise<Subproduct[]> {
  if (!productId) return [];

  if (!isSupabaseConfigured) {
    return MOCK_DEFAULT_ADDONS;
  }

  try {
    const { data: linkedData, error: linkErr } = await supabase
      .from('product_subproducts')
      .select('sort_order, subproducts(*)')
      .eq('product_id', productId);

    if (!linkErr && linkedData && linkedData.length > 0) {
      const result: Subproduct[] = [];
      for (const item of linkedData) {
        const subRaw = (item as any).subproducts;
        const sub = Array.isArray(subRaw) ? subRaw[0] : subRaw;
        if (sub && sub.active) {
          result.push({
            id: sub.id,
            productId,
            name: sub.name,
            description: sub.description,
            price: Number(sub.price) || 0,
            formattedPrice: formatSubproductPrice(sub.price),
            image: sub.image,
            active: Boolean(sub.active),
            sort_order: item.sort_order ?? sub.sort_order ?? 1,
            created_at: sub.created_at,
            updated_at: sub.updated_at,
          });
        }
      }
      return result.sort((a, b) => a.sort_order - b.sort_order);
    }

    return [];
  } catch (err) {
    console.warn(`Erro ao buscar adicionais para produto ${productId}:`, err);
    return MOCK_DEFAULT_ADDONS;
  }
}

/**
 * Busca todos os adicionais cadastrados no sistema (para uso no painel admin).
 */
export async function fetchAllSubproductsAdmin(): Promise<Subproduct[]> {
  if (!isSupabaseConfigured) {
    return MOCK_DEFAULT_ADDONS;
  }

  try {
    const { data, error } = await supabase
      .from('subproducts')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Erro ao buscar todos subprodutos:', error.message);
      return MOCK_DEFAULT_ADDONS;
    }

    return (data || []).map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      description: sub.description,
      price: Number(sub.price) || 0,
      formattedPrice: formatSubproductPrice(sub.price),
      image: sub.image,
      active: Boolean(sub.active),
      sort_order: sub.sort_order ?? 1,
      created_at: sub.created_at,
      updated_at: sub.updated_at,
    }));
  } catch (err) {
    console.error('Falha fetchAllSubproductsAdmin:', err);
    return MOCK_DEFAULT_ADDONS;
  }
}

/**
 * Busca adicionais vinculados a um produto específico no Admin (incluindo inativos).
 */
export async function fetchSubproductsForProductAdmin(productId: string): Promise<Subproduct[]> {
  if (!productId || !isSupabaseConfigured) {
    return MOCK_DEFAULT_ADDONS;
  }

  try {
    const { data: linkData, error: linkErr } = await supabase
      .from('product_subproducts')
      .select('sort_order, subproducts(*)')
      .eq('product_id', productId);

    const items: Subproduct[] = [];

    if (!linkErr && linkData) {
      for (const item of linkData) {
        const subRaw = (item as any).subproducts;
        const sub = Array.isArray(subRaw) ? subRaw[0] : subRaw;
        if (sub) {
          items.push({
            id: sub.id,
            productId,
            name: sub.name,
            description: sub.description,
            price: Number(sub.price) || 0,
            formattedPrice: formatSubproductPrice(sub.price),
            image: sub.image,
            active: Boolean(sub.active),
            sort_order: item.sort_order ?? sub.sort_order ?? 1,
            created_at: sub.created_at,
            updated_at: sub.updated_at,
          });
        }
      }
    }

    return items.sort((a, b) => a.sort_order - b.sort_order);
  } catch (err) {
    console.error('Erro fetchSubproductsForProductAdmin:', err);
    return [];
  }
}

/**
 * Cria ou atualiza um subproduto e vincula ao produto principal através de product_subproducts.
 */
export async function saveSubproduct(
  input: SubproductInput,
  targetProductId?: string
): Promise<Subproduct> {
  const payload = {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    price: parseSubproductPrice(input.price),
    image: input.image || null,
    active: input.active !== undefined ? input.active : true,
    sort_order: input.sort_order || 1,
  };

  if (!isSupabaseConfigured) {
    // Modo local / mock
    const created: Subproduct = {
      id: input.id || `local-addon-${Date.now()}`,
      productId: targetProductId || null,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      formattedPrice: formatSubproductPrice(payload.price),
      image: payload.image,
      active: payload.active,
      sort_order: payload.sort_order,
    };
    return created;
  }

  let savedId = input.id;

  if (input.id) {
    // Atualizar existente
    const { error } = await supabase
      .from('subproducts')
      .update(payload)
      .eq('id', input.id);

    if (error) throw error;
  } else {
    // Criar novo registro em subproducts
    const { data, error } = await supabase
      .from('subproducts')
      .insert([payload])
      .select('id')
      .single();

    if (error) throw error;
    savedId = data.id;
  }

  // Se houver produto principal alvo válido, cria o vínculo associativo na tabela product_subproducts
  if (targetProductId && savedId) {
    const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isValidUUID(targetProductId) && isValidUUID(savedId)) {
      await linkSubproductToProduct(targetProductId, savedId, payload.sort_order);
    }
  }

  return {
    id: savedId!,
    productId: targetProductId || null,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    formattedPrice: formatSubproductPrice(payload.price),
    image: payload.image,
    active: payload.active,
    sort_order: payload.sort_order,
  };
}

/**
 * Vincula um subproduto existente a um produto na tabela associativa.
 */
export async function linkSubproductToProduct(
  productId: string,
  subproductId: string,
  sortOrder: number = 1
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isValidUUID(productId) || !isValidUUID(subproductId)) {
    console.warn('[linkSubproductToProduct] IDs inválidos (não são UUIDs):', { productId, subproductId });
    return;
  }

  const { error } = await supabase
    .from('product_subproducts')
    .upsert(
      {
        product_id: productId,
        subproduct_id: subproductId,
        sort_order: sortOrder,
      },
      { onConflict: 'product_id,subproduct_id' }
    );

  if (error) {
    console.warn('Erro ao vincular subproduto:', error.message);
  }
}

/**
 * Desvincula um subproduto de um produto (remove apenas a associação em product_subproducts).
 */
export async function unlinkSubproductFromProduct(
  productId: string,
  subproductId: string
): Promise<void> {
  if (!isSupabaseConfigured) return;

  await supabase
    .from('product_subproducts')
    .delete()
    .eq('product_id', productId)
    .eq('subproduct_id', subproductId);
}

/**
 * Exclui permanentemente um subproduto (o banco exclui os vínculos automaticamente via CASCADE).
 */
export async function deleteSubproduct(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  // Busca dados para limpar imagem no storage se necessário
  const { data: sub } = await supabase
    .from('subproducts')
    .select('image')
    .eq('id', id)
    .single();

  if (sub?.image) {
    try {
      const marker = '/object/public/product-images/';
      const idx = sub.image.indexOf(marker);
      if (idx !== -1) {
        const filePath = sub.image.slice(idx + marker.length);
        // Só remove se for um arquivo dentro do escopo de subproducts
        if (filePath.startsWith('subproducts/')) {
          await supabase.storage.from('product-images').remove([filePath]);
        }
      }
    } catch (e) {
      console.warn('Falha ao remover imagem do storage:', e);
    }
  }

  // Remove o registro do subproduto (as chaves em product_subproducts são cascateadas automaticamente)
  const { error } = await supabase
    .from('subproducts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Altera status ativo/inativo de um subproduto.
 */
export async function toggleSubproductStatus(id: string, active: boolean): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('subproducts')
    .update({ active })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Retorna contagem de adicionais por produto para exibir badges no admin.
 */
export async function fetchAddonCountsByProduct(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured) return {};

  const counts: Record<string, number> = {};

  try {
    const { data: links } = await supabase
      .from('product_subproducts')
      .select('product_id');

    if (links) {
      for (const row of links) {
        counts[row.product_id] = (counts[row.product_id] || 0) + 1;
      }
    }
  } catch (err) {
    console.warn('Erro ao buscar contagens de adicionais:', err);
  }

  return counts;
}
