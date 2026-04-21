import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";
import hero from "@/assets/hero-product.jpg";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  badge?: string;
};

export const heroProduct: Product = {
  id: "hero",
  name: "Kit Essência Mãe — Edição Limitada",
  price: 189.9,
  image: hero,
  category: "Kits presente",
  description: "Perfume floral exclusivo + caixa premium com fita dourada.",
  badge: "Mais pedido",
};

export const products: Product[] = [
  {
    id: "1",
    name: "Buquê Rosas Encanto",
    price: 79.9,
    image: p1,
    category: "Presentes",
    description: "Buquê delicado de rosas naturais.",
  },
  {
    id: "2",
    name: "Caixa Presente Dourada",
    price: 129.9,
    image: p2,
    category: "Kits presente",
    description: "Embalagem premium com fita dourada.",
    badge: "Promoção",
  },
  {
    id: "3",
    name: "Creme Hidratante Premium",
    price: 89.9,
    image: p3,
    category: "Cuidados",
    description: "Hidratação intensa com toque dourado.",
  },
  {
    id: "4",
    name: "Coleção Batons Rosé",
    price: 149.9,
    image: p4,
    category: "Maquiagem",
    description: "Set com 5 cores exclusivas.",
  },
  {
    id: "5",
    name: "Sabonete Artesanal Floral",
    price: 39.9,
    image: p5,
    category: "Cuidados",
    description: "Aroma suave com pétalas de rosa.",
  },
  {
    id: "6",
    name: "Sérum Facial Iluminador",
    price: 159.9,
    image: p6,
    category: "Perfumes",
    description: "Brilho natural e renovador.",
    badge: "Novo",
  },
];
