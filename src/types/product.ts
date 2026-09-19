export type Product = {
  id: string;
  name: string;
  price: string;
  image?: string;
  gallery?: string[];
  isPromo?: boolean;
  isNew?: boolean;
  shortDescription: string;
  detailedDescription: string;
  specifications: string[];
  observations: string;
};
