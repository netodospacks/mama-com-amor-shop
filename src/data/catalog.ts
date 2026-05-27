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

const defaultDescription = {
  shortDescription: "Uma peça elegante e minimalista, ideal para transformar o ambiente.",
  detailedDescription: "Desenvolvido com materiais de alta qualidade e um design premium, este produto oferece o equilíbrio perfeito entre sofisticação e durabilidade. Cada detalhe foi pensado para os clientes mais exigentes, trazendo um toque de exclusividade e modernidade para o seu espaço.",
  specifications: [
    "Acabamento premium em alta resolução",
    "Material resistente e duradouro",
    "Design moderno e minimalista",
    "Fácil instalação"
  ],
  observations: "As imagens são meramente ilustrativas. O produto pode sofrer leves alterações de cor devido à calibração do seu monitor ou tela do celular."
};

const generateProducts = (count: number, prefix: string, prefixName: string, isPromo = false): Product[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${i + 1}`,
    name: `${prefixName} ${i + 1}`,
    price: `R$ 99,90`,
    isPromo,
    ...defaultDescription
  }));
};

export const CATEGORIES = {
  DIA_DOS_NAMORADOS: [
    { 
      id: "dn-album", 
      name: "Álbum Memória com 27 fotos Alto Colante", 
      price: "R$ 59,90", 
      image: "/namorados/foto1_album_memoria_com27fotos_alto_Colante_valor59,90.jpeg", 
      isNew: true,
      gallery: [
        "/namorados/foto1_album_memoria_com27fotos_alto_Colante_valor59,90.jpeg",
        "/namorados/foto2_album_memoria_com27fotos_alto_Colante_valor59,90.jpeg.jpeg",
        "/namorados/foto3_album_memoria_com27fotos_alto_Colante_valor59,90.jpeg.jpeg",
        "/namorados/foto4_album_memoria_com27fotos_alto_Colante_valor59,90.jpeg.jpeg",
        "/namorados/foto5_album_memoria_com27fotos_alto_Colante_valor59,90.jpeg.jpeg",
        "/namorados/foto6_album_memoria_com27fotos_alto_Colante_valor59,90.jpeg.jpeg"
      ],
      ...defaultDescription 
    },
    { id: "dn-1", name: "KIT 01", price: "R$ 149,90", image: "/namorados/kit_01_valor149,90.jpeg", isNew: true, ...defaultDescription },
    { 
      id: "dn-2", 
      name: "KIT 02", 
      price: "R$ 64,90", 
      image: "/namorados/kit 02_valor64,90.jpeg", 
      isNew: true,
      gallery: [
        "/namorados/kit 02_valor64,90.jpeg",
        "/namorados/segunda_foto_kit 02_valor64,90 .jpeg"
      ],
      ...defaultDescription 
    },
    { id: "dn-3", name: "KIT 03", price: "R$ 64,90", image: "/namorados/kit 03_valor64,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-5", name: "KIT 05", price: "R$ 139,90", image: "/namorados/kit05_valor139,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-6", name: "KIT 06", price: "R$ 119,90", image: "/namorados/kit06_valor119,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-7", name: "KIT 07", price: "R$ 49,90", image: "/namorados/kit07_valor49,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-8", name: "KIT 08", price: "R$ 49,90", image: "/namorados/kit08_valor49,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-9", name: "KIT 09", price: "R$ 129,90", image: "/namorados/kit09_valor129,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-10", name: "KIT 10", price: "R$ 89,90", image: "/namorados/kit10_valor89,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-11", name: "KIT 11", price: "R$ 49,90", image: "/namorados/kit11_valor49,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-12", name: "KIT 12", price: "R$ 89,90", image: "/namorados/kit12_valor89,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-13", name: "KIT 13", price: "R$ 109,90", image: "/namorados/kit13_valor109,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-14", name: "KIT 14", price: "R$ 134,90", image: "/namorados/kit14_valor134,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-15", name: "KIT 15", price: "R$ 39,90", image: "/namorados/kit15_39,90.jpeg", isNew: true, ...defaultDescription },
    { id: "dn-16", name: "KIT 16", price: "R$ 79,90", image: "/namorados/kit16_valor79,90.jpeg", isNew: true, ...defaultDescription }
  ],
  PRODUTOS: [
    { id: "prod-1", name: "Caixa MDF 10x10 Vazia", price: "R$ 15,90", image: "/produtos/Caixamdf_10x10_vazia_valor15,90.jpeg", ...defaultDescription },
    { id: "prod-2", name: "Caderninho Folha Preta + 10 Polaroids", price: "R$ 29,90", image: "/produtos/caderninho_folhapreta_mais10polaroids_valor29,90.jpeg", ...defaultDescription },
    { id: "prod-3", name: "Caderninho Memórias + 10 Polaroids", price: "R$ 29,90", image: "/produtos/caderninho_memorias_mais_10polaroids_valor29,90.jpeg", ...defaultDescription },
    { id: "prod-4", name: "Caixa 20x20 Vazia", price: "R$ 29,90", image: "/produtos/caixa20x20_vazia_valor29,90.jpeg", ...defaultDescription },
    { id: "prod-5", name: "Caixa 20x20 Preta", price: "R$ 34,90", image: "/produtos/caixa20x20preta_valor34,90.jpeg", ...defaultDescription },
    { id: "prod-6", name: "Caixa Box Vazia", price: "R$ 12,90", image: "/produtos/caixa_box_vazia_valor12,90.jpeg", ...defaultDescription },
    { id: "prod-7", name: "Chaveiro Acrílico Personalizado", price: "R$ 9,90", image: "/produtos/chaveiro_Acrilico_personalizado_valor9,90.jpeg", ...defaultDescription },
    { id: "prod-8", name: "Cubo Memórias", price: "R$ 34,90", image: "/produtos/cubo_memorias_valor34,90.jpeg", ...defaultDescription },
    { id: "prod-9", name: "Mini Garrafinha", price: "R$ 9,90", image: "/produtos/mini_garrafinha_valor9,90.jpeg", ...defaultDescription },
    { id: "prod-10", name: "Polaroid", price: "R$ 1,90", image: "/produtos/polaroid_valor1,90.jpeg", ...defaultDescription },
    { id: "prod-11", name: "Xícara Acrílica Personalizada", price: "R$ 44,90", image: "/produtos/xicaraacrilica_personalizada_valor44,90.jpeg", ...defaultDescription }
  ],
  QUADROS_A4: [
    { id: "qa4-1", name: "QUADRO 01", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.47.jpeg", ...defaultDescription },
    { id: "qa4-2", name: "QUADRO 02", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.48.jpeg", ...defaultDescription },
    { id: "qa4-3", name: "QUADRO 03", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.48 (1).jpeg", ...defaultDescription },
    { id: "qa4-4", name: "QUADRO 04", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.48 (2).jpeg", ...defaultDescription },
    { id: "qa4-5", name: "QUADRO 05", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.49.jpeg", ...defaultDescription },
    { id: "qa4-6", name: "QUADRO 06", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.49 (1).jpeg", ...defaultDescription },
    { id: "qa4-7", name: "QUADRO 07", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.49 (2).jpeg", ...defaultDescription },
    { id: "qa4-8", name: "QUADRO 08", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.49 (3).jpeg", ...defaultDescription },
    { id: "qa4-9", name: "QUADRO 09", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.50.jpeg", ...defaultDescription },
    { id: "qa4-10", name: "QUADRO 10", price: "R$ 49,90", image: "/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.50 (1).jpeg", ...defaultDescription }
  ],
  QUADROS_10x15: [
    { id: "q1015-1", name: "QUADRO 1", price: "R$ 29,90", image: "/QUADROS10X15/WhatsApp Image 2026-05-27 at 02.42.54.jpeg", ...defaultDescription },
    { id: "q1015-2", name: "QUADRO 2", price: "R$ 29,90", image: "/QUADROS10X15/WhatsApp Image 2026-05-27 at 02.42.54 (1).jpeg", ...defaultDescription },
    { id: "q1015-3", name: "QUADRO 3", price: "R$ 29,90", image: "/QUADROS10X15/WhatsApp Image 2026-05-27 at 02.42.54 (2).jpeg", ...defaultDescription },
    { id: "q1015-4", name: "QUADRO 4", price: "R$ 29,90", image: "/QUADROS10X15/WhatsApp Image 2026-05-27 at 02.42.54 (3).jpeg", ...defaultDescription },
    { id: "q1015-5", name: "QUADRO 5", price: "R$ 29,90", image: "/QUADROS10X15/WhatsApp Image 2026-05-27 at 02.42.55.jpeg", ...defaultDescription }
  ],
  QUADROS_PLACAS: [
    { id: "qp-1", name: "PLACA 1", price: "R$ 34,90", image: "/placas/WhatsApp Image 2026-05-27 at 02.58.23.jpeg", ...defaultDescription },
    { id: "qp-2", name: "PLACA 2", price: "R$ 34,90", image: "/placas/WhatsApp Image 2026-05-27 at 02.58.24.jpeg", ...defaultDescription },
    { id: "qp-3", name: "PLACA 3", price: "R$ 34,90", image: "/placas/WhatsApp Image 2026-05-27 at 02.58.24(1).jpeg", ...defaultDescription }
  ],
  KITS: [
    { id: "kit-1", name: "Kit Retrato", price: "R$ 69,90", image: "/produtos_kits/kit_Retrato_valor69,90.jpeg", ...defaultDescription },
    { id: "kit-2", name: "Kit Amor", price: "R$ 119,90", image: "/produtos_kits/kit_amor_valor119,90.jpeg", ...defaultDescription },
    { id: "kit-3", name: "Kit Céu Estrelado", price: "R$ 89,90", image: "/produtos_kits/kit_ceu_estrelado_valor89,90.jpeg", ...defaultDescription },
    { id: "kit-4", name: "Kit Lembranças", price: "R$ 119,90", image: "/produtos_kits/kit_lembranças_valor119,90.jpeg", ...defaultDescription },
    { id: "kit-5", name: "Kit Kat", price: "R$ 99,90", image: "/produtos_kits/kit Kat_valor99,90.jpeg", ...defaultDescription },
    { id: "kit-6", name: "Kit Coração", price: "R$ 119,90", image: "/produtos_kits/kit_coraçao_valor119,90.jpeg", ...defaultDescription },
    { id: "kit-7", name: "Kit Doces Caixa Preta", price: "R$ 79,90", image: "/produtos_kits/kit_doces_caixapreta_valor79,90.jpeg", ...defaultDescription },
    { id: "kit-8", name: "Kit Te Amo", price: "R$ 104,90", image: "/produtos_kits/kitteamo_valor104,90.jpeg", ...defaultDescription }
  ],
  COMBOS: [
    { id: "combo-1", name: "Agenda + 10 Polaroids + Caixa Buquê", price: "R$ 99,90", image: "/produtos_combos/agenda10polaroids_mais_caixa_buquer_valor99,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-2", name: "Agenda + 10 Polaroids + Caixinha Box", price: "R$ 39,90", image: "/produtos_combos/agenda_mais10polaroids_mais_caixinhabox_valor39,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-3", name: "Caixa Amor + Quadro 10x15", price: "R$ 159,90", image: "/produtos_combos/caixa_amor_mais_quadro10x15_valor159,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-4", name: "Caixa Buquê + Caixa Eternizando", price: "R$ 144,90", image: "/produtos_combos/caixa_buquer_mais_caixa_eternizando_valor144,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-5", name: "Caixa Buquê + Caixa Você", price: "R$ 154,90", image: "/produtos_combos/caixa_buquer_mais_caixa_voce_valor154,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-6", name: "Caixa Celebre + Placa", price: "R$ 139,90", image: "/produtos_combos/caixa_celebre_mais_placa_valor139,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-7", name: "Combo VS", price: "R$ 29,90", image: "/produtos_combos/comboVS_valor29,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-8", name: "Cubo Acrílico + Caixa Eternizando", price: "R$ 139,90", image: "/produtos_combos/cubo_acrilico_mais_caixa_eternizando_valor139,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-9", name: "Cubo + Caixa Memórias", price: "R$ 104,90", image: "/produtos_combos/cubo_mais_caixamemorias_104,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-10", name: "Placa + Caixa Buquê", price: "R$ 89,90", image: "/produtos_combos/placa_caixa_buque_valor89,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-11", name: "Placa + Caixa Buquê (2)", price: "R$ 89,90", image: "/produtos_combos/placa_mais_caixa_buque_valor89,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-12", name: "Placa + Caixa Doce", price: "R$ 79,90", image: "/produtos_combos/placa_mais_caixa_doce_valor79,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-13", name: "Quadro 10x15 + Caixa Buquê", price: "R$ 89,90", image: "/produtos_combos/quadro10x15_mais_caixa_buquer_valor89,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-14", name: "Quadro A4 + Caixa Buquê", price: "R$ 109,90", image: "/produtos_combos/quadro_a4_mais_caixa_buque_valor109,90.jpeg", isPromo: true, ...defaultDescription },
    { id: "combo-15", name: "Quadro 10x15 + Caixa Doce", price: "R$ 79,90", image: "/produtos_combos/quandro10x15_mais_caixadoce_valor79,90.jpeg", isPromo: true, ...defaultDescription }
  ],
};

export const getAllProducts = (): Product[] => {
  return Object.values(CATEGORIES).flat();
};

export const getProductById = (id: string): Product | undefined => {
  return getAllProducts().find(p => p.id === id);
};
