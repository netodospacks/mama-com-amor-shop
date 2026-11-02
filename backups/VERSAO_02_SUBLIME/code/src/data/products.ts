export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  isBestSeller?: boolean;
}

export const products: Product[] = [
  {
    id: "caixa-cafe",
    name: "Caixa Café da Mamãe",
    price: 129.90,
    image: "/produtos/caixa-cafe-mamae.jpeg",
    description: "🎁 Um presente completo para emocionar\n\nEssa caixa acompanha:\n📓 1 agenda personalizada\n🖼️ 1 quadro 15x20\n☕ 1 xícara em porcelana\n🍪 Biscoitinhos Balduco\n☕ Café 3 Corações Cappuccino\n\n💖 Perfeito para criar um momento especial e inesquecível\n\n💖 Feito com carinho especialmente para você",
    isBestSeller: true,
  },
  {
    id: "agenda-maes",
    name: "Agenda Dia das Mães",
    price: 19.90,
    image: "/produtos/agenda-maes.jpeg",
    description: "💝 Um presente simples, mas cheio de significado\n\nAgenda com 50 folhas\nCapa personalizada com foto, nome ou mensagem\n\n✨ Personalize a capa do jeitinho que você quiser e torne esse presente único\n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "caixa-envelope",
    name: "Caixa Envelope + Doces",
    price: 39.90,
    image: "/produtos/caixa-envelope.jpeg",
    description: "💝 Um mimo doce e cheio de carinho\n\nCaixa estilo envelope personalizada\nAcompanha doces selecionados\n\n✨ Ideal para surpreender de forma simples e especial\n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "caixa-feliz-maes",
    name: "Caixa Feliz Dia das Mães",
    price: 39.90,
    image: "/produtos/caixa-feliz-maes.jpeg",
    description: "💖 Um presente delicado e encantador\n\nEssa caixa acompanha:\nCaixa transparente elegante\n☕ 1 xícara em porcelana\n🍯 1 pão de mel\n📸 2 fotos estilo polaroid + saquinho de pano\n🌸 1 flor decorativa\n\n✨ Perfeito para emocionar com um gesto simples e cheio de amor\n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "caixinha-eu-te-amo",
    name: "Caixinha Eu Te Amo",
    price: 39.90,
    image: "/produtos/caixinha-eu-te-amo.jpeg",
    description: "💖 Um presente pequeno, mas cheio de significado\n\nEssa caixinha acompanha:\n📓 1 agenda personalizada\n🍫 1 KitKat personalizado\n📦 1 caixinha em MDF\n🍬 1 Ouro Branco\n\n✨ Ideal para surpreender alguém especial com carinho\n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "coracao-bombons",
    name: "Coração de Bombons",
    price: 49.90,
    image: "/produtos/coracao-bombons.jpeg",
    description: "🎁 Um presente doce e apaixonante\n\nCaixa em formato de coração\n🍬 10 chocolates Ouro Branco\n\n💖 Perfeito para surpreender de forma simples e marcante\n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "placa-acrilica-melhor-mae",
    name: "Placa Acrílica Melhor Mãe",
    price: 34.90,
    image: "/produtos/placa-acrilica-melhor-mae.jpeg",
    description: "Uma placa acrílica maravilhosa para homenagear a melhor mãe do mundo. \n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "placa-acrilica-mae-te-amo",
    name: "Placa Acrílica Mãe Eu Te Amo",
    price: 34.90,
    image: "/produtos/placa-acrilica-mae-eu-te-amo.jpeg",
    description: "Placa de acrílico super moderna com lindas fotos. \n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "placa-acrilica-spotify",
    name: "Placa Acrílica Spotify",
    price: 34.90,
    image: "/produtos/placa-acrilica-spotify.jpeg",
    description: "Placa interativa estilo Spotify com a música preferida dela. \n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "placa-acrilica-vida",
    name: "Placa Acrílica Vida",
    price: 34.90,
    image: "/produtos/placa-acrilica-vida.jpeg",
    description: "Design único com fotos para celebrar a vida. \n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "placa-acrilica-mural",
    name: "Placa Acrílica Mural",
    price: 34.90,
    image: "/produtos/placa-acrilica-mural.jpeg",
    description: "Mural fotográfico em acrílico, um presente sofisticado. \n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "placa-acrilica-quatro-fotos",
    name: "Placa Acrílica 4 Fotos",
    price: 34.90,
    image: "/produtos/placa-acrilica-quatro-fotos.jpeg",
    description: "Placa em acrílico com montagem de 4 fotos especiais. \n\n💖 Feito com carinho especialmente para você",
  },
  {
    id: "cubo-memorias",
    name: "Cubo Memórias",
    price: 34.90,
    image: "/produtos/cubo-memorias.jpeg",
    description: "Um cubo interativo repleto de fotos e muito amor. \n\n💖 Feito com carinho especialmente para você",
  }
];

export const kits: Product[] = [];

export const allProducts = [...products, ...kits];
