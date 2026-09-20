import { Product } from "@/types/product";

const formatBRL = (value: number | null | undefined): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

export const mapProductFromDB = (dbProduct: any): Product & { categorySlug?: string } => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    // Converte o NUMERIC do banco (ex: 129.9) para string monetária brasileira
    price: formatBRL(dbProduct.price),
    // Preço promocional: só presente se is_promo = true e promo_price não for nulo
    promoPrice:
      dbProduct.is_promo && dbProduct.promo_price != null
        ? formatBRL(dbProduct.promo_price)
        : undefined,
    image: dbProduct.image || undefined,
    gallery: dbProduct.gallery || undefined,
    isPromo: dbProduct.is_promo,
    isNew: dbProduct.is_new,
    shortDescription: dbProduct.short_description || "",
    detailedDescription: dbProduct.detailed_description || "",
    specifications: dbProduct.specifications || [],
    observations: dbProduct.observations || "",
    categorySlug: dbProduct.categories?.slug
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
