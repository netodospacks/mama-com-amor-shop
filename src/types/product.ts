export type Product = {
  id: string;
  name: string;
  price: string;
  promoPrice?: string; // Preço promocional formatado (ex: "R$ 39,90"). Presente apenas quando is_promo = true.
  image?: string;
  gallery?: string[];
  isPromo?: boolean;
  isNew?: boolean;
  shortDescription: string;
  detailedDescription: string;
  specifications: string[];
  observations: string;
};
