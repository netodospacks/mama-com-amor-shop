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
  isBestSeller?: boolean; // Selo exclusivo "MAIS PEDIDO" (especialmente na Coleção de Natal)
  displayOrder?: number; // Ordem de exibição na coleção / vitrine
  collection?: string; // Identificador de coleção (ex: 'natal')
  shortDescription: string;
  detailedDescription: string;
  specifications: string[];
  observations: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  // Campos auxiliares opcionais para compatibilidade de testes/carrinho
  numericPrice?: number;
  sortOrder?: number;
  active?: boolean;
};

export type DBProduct = {
  id: string;
  name: string;
  price: number;
  promo_price?: number | null;
  image?: string | null;
  gallery?: string[] | null;
  is_promo?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  is_best_seller?: boolean;
  display_order?: number;
  collection?: string | null;
  short_description?: string | null;
  detailed_description?: string | null;
  specifications?: any;
  observations?: string | null;
  category_id?: string | null;
  active?: boolean;
  sort_order?: number;
  created_at?: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
    active: boolean;
  } | null;
};
