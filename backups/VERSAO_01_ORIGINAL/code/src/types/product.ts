export type Product = {
  id: string;
  name: string;
  price: string;
  promoPrice?: string; // Preço promocional formatado (ex: "R$ 39,90"). Presente apenas quando is_promo = true.
  image?: string;
  gallery?: string[];
  isPromo?: boolean;
  isNew?: boolean;
  isFeatured?: boolean; // Produto em destaque na página inicial
  shortDescription: string;
  detailedDescription: string;
  specifications: string[];
  observations: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
};
