import { Product } from "@/types/product";

const formatPriceValue = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return 'R$ 0,00';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('R$')) return trimmed;
    const cleaned = trimmed.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsed);
    }
    return trimmed;
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const mapProductFromDB = (dbProduct: any): Product & { categorySlug?: string } => {
  let specs: string[] = [];
  if (Array.isArray(dbProduct.specifications)) {
    specs = dbProduct.specifications;
  } else if (typeof dbProduct.specifications === 'string') {
    try {
      const parsed = JSON.parse(dbProduct.specifications);
      if (Array.isArray(parsed)) specs = parsed;
      else specs = dbProduct.specifications.split('\n').map((s: string) => s.trim()).filter(Boolean);
    } catch {
      specs = dbProduct.specifications.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  let gallery: string[] | undefined = undefined;
  if (Array.isArray(dbProduct.gallery)) {
    gallery = dbProduct.gallery;
  } else if (typeof dbProduct.gallery === 'string' && dbProduct.gallery.trim()) {
    try {
      const parsed = JSON.parse(dbProduct.gallery);
      if (Array.isArray(parsed)) gallery = parsed;
      else gallery = [dbProduct.gallery];
    } catch {
      gallery = [dbProduct.gallery];
    }
  }

  return {
    id: String(dbProduct.id),
    name: dbProduct.name || '',
    price: formatPriceValue(dbProduct.price),
    promoPrice:
      dbProduct.is_promo && dbProduct.promo_price != null
        ? formatPriceValue(dbProduct.promo_price)
        : undefined,
    image: dbProduct.image || undefined,
    gallery,
    isPromo: Boolean(dbProduct.is_promo),
    isNew: Boolean(dbProduct.is_new),
    isFeatured: Boolean(dbProduct.is_featured),
    shortDescription: dbProduct.short_description || '',
    detailedDescription: dbProduct.detailed_description || '',
    specifications: specs,
    observations: dbProduct.observations || '',
    categoryId: dbProduct.category_id ? String(dbProduct.category_id) : (dbProduct.categories?.id ? String(dbProduct.categories.id) : undefined),
    categoryName: dbProduct.categories?.name || undefined,
    categorySlug: dbProduct.categories?.slug || ''
  };
};

/**
 * Retorna o preço efetivo do produto como número.
 * Se o produto está em promoção e tem preço promocional, usa promoPrice.
 * Caso contrário, usa price.
 */
export function getEffectivePrice(product: Product): number {
  const parseStr = (s: string | undefined): number => {
    if (!s) return 0;
    const cleaned = s.replace(/R\$\s?/gi, '').replace(/\./g, '').replace(',', '.').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  if (product.isPromo && product.promoPrice) {
    return parseStr(product.promoPrice);
  }
  return parseStr(product.price);
}
