export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  includes: string[];
  isKit?: boolean;
  isBestSeller?: boolean;
};

export const products: Product[] = [
  {
    id: "quadro-10x15",
    name: "Quadro 10x15",
    price: 29.90,
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=400",
    description: "Um lindo quadro em tamanho 10x15 para eternizar seus momentos. Moldura resistente e impressão de alta qualidade.",
    includes: ["Quadro com moldura", "Impressão fotográfica"],
  },
  {
    id: "quadro-15x20",
    name: "Quadro 15x20",
    price: 32.90,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400",
    description: "Quadro tamanho 15x20 perfeito para decorar qualquer ambiente com suas melhores lembranças.",
    includes: ["Quadro com moldura", "Impressão fotográfica"],
  },
  {
    id: "quadro-15x21",
    name: "Quadro 15x21",
    price: 34.90,
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=400",
    description: "Tamanho 15x21 ideal para presentear. Qualidade premium.",
    includes: ["Quadro com moldura", "Impressão fotográfica"],
  },
  {
    id: "placa-acrilica-15x21",
    name: "Placa Acrílica 15x21",
    price: 34.90,
    image: "https://images.unsplash.com/photo-1544277711-ce40850022d4?auto=format&fit=crop&q=80&w=400",
    description: "Placa de acrílico super moderna com sua foto e uma música especial (estilo Spotify).",
    includes: ["Placa acrílica 15x21", "Base de apoio", "Embalagem para presente"],
  },
  {
    id: "cubo-memorias",
    name: "Cubo Memórias",
    price: 34.90,
    image: "https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?auto=format&fit=crop&q=80&w=400",
    description: "Um cubo giratório com espaço para várias fotos. Muito criativo e fofo!",
    includes: ["Cubo giratório", "6 Fotos impressas aplicadas"],
  },
  {
    id: "xicara-porcelana",
    name: "Xícara em porcelana",
    price: 44.90,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=400",
    description: "Xícara personalizada de porcelana, ideal para aquele café da manhã especial.",
    includes: ["Xícara 325ml", "Caixinha presenteável"],
  },
  {
    id: "agenda-maes-10x15",
    name: "Agenda Dia das Mães 10x15",
    price: 19.90,
    image: "https://images.unsplash.com/photo-1506784926709-22f1ec395907?auto=format&fit=crop&q=80&w=400",
    description: "Agenda linda e delicada para anotar todos os compromissos e lembretes com muito amor.",
    includes: ["Agenda 10x15 capa dura", "Adesivos fofos"],
  }
];

export const kits: Product[] = [
  {
    id: "kit-agenda-quadro-15x20",
    name: "Combo Agenda + Quadro 15x20",
    price: 49.90,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=400",
    description: "O presente perfeito para surpreender! Leve uma agenda linda e um quadro 15x20.",
    includes: ["Agenda Dia das Mães", "Quadro 15x20 com foto"],
    isKit: true,
    isBestSeller: true,
  },
  {
    id: "kit-agenda-cubo",
    name: "Combo Agenda + Cubo",
    price: 49.90,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400",
    description: "Agenda e um Cubo Memórias fofinho para guardar suas fotos favoritas.",
    includes: ["Agenda Dia das Mães", "Cubo Memórias com 6 fotos"],
    isKit: true,
  },
  {
    id: "kit-quadro-15x20-cubo",
    name: "Combo Quadro 15x20 + Cubo",
    price: 44.90,
    image: "https://images.unsplash.com/photo-1544277711-ce40850022d4?auto=format&fit=crop&q=80&w=400",
    description: "Decoração completa: um quadro maravilhoso e um cubo interativo.",
    includes: ["Quadro 15x20", "Cubo Memórias"],
    isKit: true,
  },
  {
    id: "kit-placa-agenda",
    name: "Combo Placa Acrílica + Agenda",
    price: 49.90,
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=400",
    description: "Kit super moderno com a nossa famosa placa musical e uma agenda fofa.",
    includes: ["Placa Acrílica 15x21", "Agenda Dia das Mães"],
    isKit: true,
  },
  {
    id: "kit-placa-cubo",
    name: "Combo Placa Acrílica + Cubo",
    price: 44.90,
    image: "https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?auto=format&fit=crop&q=80&w=400",
    description: "Dois dos nossos melhores produtos em um só pacote para você arrasar no presente.",
    includes: ["Placa Acrílica 15x21", "Cubo Memórias"],
    isKit: true,
  }
];

export const allProducts = [...products, ...kits];
