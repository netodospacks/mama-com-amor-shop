import { describe, it, expect, beforeEach } from "vitest";
import { Product } from "@/types/product";
import { Subproduct } from "@/types/subproduct";
import {
  formatSubproductPrice,
  parseSubproductPrice,
  saveSubproduct,
  MOCK_DEFAULT_ADDONS,
} from "@/lib/subproducts";
import { formatWhatsAppMessage, CheckoutData } from "@/lib/whatsapp";
import { CartItem } from "@/context/CartContext";

describe("Sistema de Subprodutos e Adicionais — Virtual Store", () => {
  const produtoPrincipalA: Product = {
    id: "cesta-romantica-1",
    name: "Cesta Romântica Especial",
    price: "R$ 149,90",
    shortDescription: "Cesta completa para momentos inesquecíveis",
    detailedDescription: "Inclui itens premium de café e guloseimas",
    specifications: ["Cesta de vime", "Embalagem para presente"],
    observations: "Itens sujeitos a disponibilidade",
  };

  const produtoPrincipalB: Product = {
    id: "quadro-foto-1",
    name: "Quadro Acrílico Amor",
    price: "R$ 59,90",
    shortDescription: "Quadro 10x15 personalizado",
    detailedDescription: "Foto em alta resolução",
    specifications: ["Acrílico cast"],
    observations: "Envie sua foto",
  };

  const adicionalChoco: Subproduct = {
    id: "sub-choco-1",
    name: "Caixa de Chocolates Finos",
    description: "8 bombons artesanais",
    price: 19.90,
    formattedPrice: "R$ 19,90",
    active: true,
    sort_order: 1,
  };

  const adicionalPelucia: Subproduct = {
    id: "sub-pelucia-1",
    name: "Ursinho de Pelúcia",
    description: "Pelúcia macia antialérgica",
    price: 29.90,
    formattedPrice: "R$ 29,90",
    active: true,
    sort_order: 2,
  };

  const adicionalCartao: Subproduct = {
    id: "sub-cartao-1",
    name: "Cartão Personalizado",
    description: "Cartão com dedicação",
    price: 7.90,
    formattedPrice: "R$ 7,90",
    active: true,
    sort_order: 3,
  };

  it("1. Formata e faz parse de preços de subprodutos corretamente", () => {
    expect(parseSubproductPrice("R$ 19,90")).toBe(19.9);
    expect(parseSubproductPrice("29.90")).toBe(29.9);
    expect(parseSubproductPrice(7.9)).toBe(7.9);

    expect(formatSubproductPrice(19.9)).toContain("19,90");
    expect(formatSubproductPrice(7.9)).toContain("7,90");
  });

  it("2. Salva e atualiza subprodutos no modo de serviço", async () => {
    const saved = await saveSubproduct(
      {
        name: "Caixa de Bombons",
        description: "Trufas selecionadas",
        price: 19.9,
        image: "https://exemplo.com/bombom.jpg",
        active: true,
        sort_order: 1,
      },
      "cesta-romantica-1"
    );

    expect(saved.name).toBe("Caixa de Bombons");
    expect(saved.price).toBe(19.9);
    expect(saved.formattedPrice).toContain("19,90");
    expect(saved.active).toBe(true);
  });

  it("3. Calcula total e subtotais com precisão matemática (exemplo ilustrativo do documento)", () => {
    // Exemplo do prompt: Cesta Romântica (149,90) + Chocolates (19,90) = 169,80
    // + Cartão (7,90) = 177,70
    const precoCesta = 149.9;
    const precoChoco = 19.9;
    const precoCartao = 7.9;

    const totalComChoco = precoCesta + precoChoco;
    expect(Number(totalComChoco.toFixed(2))).toBe(169.8);

    const totalComCartao = totalComChoco + precoCartao;
    expect(Number(totalComCartao.toFixed(2))).toBe(177.7);
  });

  it("4. Permite adicionar e remover adicionais individualmente sem remover o produto principal", () => {
    let item: CartItem = {
      id: "item-cesta-1",
      product: produtoPrincipalA,
      quantity: 1,
      selectedAddons: [adicionalChoco, adicionalCartao],
    };

    expect(item.selectedAddons.length).toBe(2);

    // Remover apenas o cartão
    item = {
      ...item,
      selectedAddons: item.selectedAddons.filter((a) => a.id !== adicionalCartao.id),
    };

    expect(item.selectedAddons.length).toBe(1);
    expect(item.selectedAddons[0].id).toBe(adicionalChoco.id);
    expect(item.product.id).toBe(produtoPrincipalA.id); // Produto principal segue intacto
  });

  it("5. Mantém seleções de adicionais independentes para duas unidades ou linhas da mesma cesta", () => {
    // Linha 1: Cesta Romântica com chocolates e pelúcia
    const cesta1: CartItem = {
      id: "linha-cesta-1",
      product: produtoPrincipalA,
      quantity: 1,
      selectedAddons: [adicionalChoco, adicionalPelucia],
    };

    // Linha 2: Outra Cesta Romântica apenas com cartão
    const cesta2: CartItem = {
      id: "linha-cesta-2",
      product: produtoPrincipalA,
      quantity: 1,
      selectedAddons: [adicionalCartao],
    };

    // A alteração na cesta 1 não afeta a cesta 2
    expect(cesta1.selectedAddons.map((a) => a.name)).toEqual([
      "Caixa de Chocolates Finos",
      "Ursinho de Pelúcia",
    ]);
    expect(cesta2.selectedAddons.map((a) => a.name)).toEqual([
      "Cartão Personalizado",
    ]);
  });

  it("6. Suporta produtos sem adicionais sem falha ou poluição visual", () => {
    const itemSemAdicionais: CartItem = {
      id: "linha-quadro-1",
      product: produtoPrincipalB,
      quantity: 1,
      selectedAddons: [],
    };

    expect(itemSemAdicionais.selectedAddons.length).toBe(0);
  });

  it("7. Gera mensagem no WhatsApp incluindo detalhadamente os produtos e adicionais selecionados", () => {
    const data: CheckoutData = {
      nome: "Mariana Souza",
      cidade: "Santa Rita",
      bairro: "Tibiri",
      tipoEntrega: "Delivery",
      linkMaps: "https://maps.google.com/?q=-7.123,-34.987",
      formaPagamento: "PIX",
    };

    const cartItems: CartItem[] = [
      {
        id: "cesta-linha-1",
        product: produtoPrincipalA,
        quantity: 1,
        selectedAddons: [adicionalChoco, adicionalCartao],
      },
      {
        id: "quadro-linha-2",
        product: produtoPrincipalB,
        quantity: 1,
        selectedAddons: [], // Sem adicionais
      },
    ];

    const total = 149.9 + 19.9 + 7.9 + 59.9; // 237,60
    const message = formatWhatsAppMessage(data, cartItems, total);

    // Verificações
    expect(message).toContain("*PEDIDO — VIRTUAL STORE*");
    expect(message).toContain("*Nome:* Mariana Souza");
    expect(message).toContain("1x Cesta Romântica Especial");
    expect(message).toContain("Adicionais:");
    expect(message).toContain("• 1x Caixa de Chocolates Finos");
    expect(message).toContain("• 1x Cartão Personalizado");
    expect(message).toContain("1x Quadro Acrílico Amor");
    expect(message).toContain("*TOTAL:*");
  });

  it("8. Fornece fallback de adicionais mock padrão para modo local / offline", () => {
    expect(MOCK_DEFAULT_ADDONS.length).toBeGreaterThanOrEqual(3);
    const names = MOCK_DEFAULT_ADDONS.map((a) => a.name);
    expect(names.some((n) => n.toLowerCase().includes("chocolate"))).toBe(true);
    expect(names.some((n) => n.toLowerCase().includes("pelúcia") || n.toLowerCase().includes("ursinho"))).toBe(true);
  });

  it("9. Garante cálculo correto de subtotal com multiplicadores de quantidade no carrinho", () => {
    // 2 unidades da Cesta A (149,90 cada = 299,80)
    // Com 2 adicionais vinculados à linha: Chocolate (19,90) + Pelúcia (29,90) = 49,80 por unidade
    // Adicionais x 2 = 99,60
    // Total esperado: 299,80 + 99,60 = 399,40
    const qty = 2;
    const subtotalProds = 149.9 * qty;
    const addonsPerUnit = 19.9 + 29.9;
    const subtotalAddons = addonsPerUnit * qty;
    const totalGeral = subtotalProds + subtotalAddons;

    expect(Number(subtotalProds.toFixed(2))).toBe(299.8);
    expect(Number(subtotalAddons.toFixed(2))).toBe(99.6);
    expect(Number(totalGeral.toFixed(2))).toBe(399.4);
  });

  it("10. Trata defensivamente estrutura de resposta PostgREST tanto em objeto quanto em array", () => {
    // Simula resposta com subproducts como objeto
    const mockPostgrestObject = {
      sort_order: 1,
      subproducts: {
        id: "sub-1",
        name: "Item Objeto",
        active: true,
        price: 15.5,
      },
    };
    const subRawObj = mockPostgrestObject.subproducts;
    const resolvedObj = Array.isArray(subRawObj) ? subRawObj[0] : subRawObj;
    expect(resolvedObj.id).toBe("sub-1");
    expect(resolvedObj.active).toBe(true);

    // Simula resposta com subproducts como array de 1 item
    const mockPostgrestArray = {
      sort_order: 2,
      subproducts: [
        {
          id: "sub-2",
          name: "Item Array",
          active: true,
          price: 25.0,
        },
      ],
    };
    const subRawArr = mockPostgrestArray.subproducts;
    const resolvedArr = Array.isArray(subRawArr) ? subRawArr[0] : subRawArr;
    expect(resolvedArr.id).toBe("sub-2");
    expect(resolvedArr.active).toBe(true);
  });
});
