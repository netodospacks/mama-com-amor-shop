import { Product } from "@/types/product";

export const mapProductFromDB = (dbProduct: any): Product & { categorySlug?: string } => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    // Converte o NUMERIC do banco (ex: 129.9) para string monetária brasileira
    price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dbProduct.price),
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
