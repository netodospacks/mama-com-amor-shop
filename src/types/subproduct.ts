export interface Subproduct {
  id: string;
  productId?: string | null;
  name: string;
  description?: string | null;
  price: number;
  formattedPrice?: string;
  image?: string | null;
  active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export type SubproductInput = Omit<Subproduct, 'id' | 'created_at' | 'updated_at' | 'formattedPrice'> & {
  id?: string;
};
