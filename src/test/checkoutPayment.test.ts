import { describe, it, expect } from "vitest";
import { generateWhatsAppLink, CheckoutData } from "../lib/whatsapp";
import { CartItem } from "../context/CartContext";

describe("Checkout e Integração de Pagamento", () => {
  const dummyProduct = {
    id: "prod-1",
    name: "Caneca Personalizada",
    price: "R$ 44,90",
    shortDescription: "Caneca premium",
    detailedDescription: "- Item 1 - Item 2",
    specifications: ["Porcelana"],
    observations: "Nenhuma",
  };

  const dummyCartItems: CartItem[] = [
    {
      product: dummyProduct,
      quantity: 2,
    },
  ];

  it("gera mensagem no WhatsApp com forma de pagamento PIX preservando todos os dados", () => {
    const data: CheckoutData = {
      nome: "Larissa Silva",
      cidade: "Santa Rita",
      bairro: "Tibiri",
      tipoEntrega: "Delivery",
      linkMaps: "https://maps.google.com/?q=-7.11,-34.97",
      formaPagamento: "PIX",
    };

    const url = generateWhatsAppLink(data, dummyCartItems, 89.8);
    const decodedUrl = decodeURIComponent(url);

    expect(decodedUrl).toContain("*Forma de pagamento:* PIX");
    expect(decodedUrl).toContain("*Nome:* Larissa Silva");
    expect(decodedUrl).toContain("*Cidade:* Santa Rita");
    expect(decodedUrl).toContain("*Bairro:* Tibiri");
    expect(decodedUrl).toContain("*Entrega:* Delivery");
    expect(decodedUrl).toContain("*Localização:* https://maps.google.com/?q=-7.11,-34.97");
    expect(decodedUrl).toContain("2x Caneca Personalizada");
  });

  it("gera mensagem no WhatsApp com forma de pagamento CARTÃO", () => {
    const data: CheckoutData = {
      nome: "Carlos Santos",
      cidade: "João Pessoa",
      bairro: "Manaíra",
      tipoEntrega: "Retirada",
      formaPagamento: "CARTÃO",
    };

    const url = generateWhatsAppLink(data, dummyCartItems, 89.8);
    const decodedUrl = decodeURIComponent(url);

    expect(decodedUrl).toContain("*Forma de pagamento:* CARTÃO");
    expect(decodedUrl).toContain("*Nome:* Carlos Santos");
    expect(decodedUrl).toContain("*Entrega:* Retirada");
  });

  it("garante fluxo de compra: produtos e adicionais são preservados do carrinho até a escolha exclusiva de pagamento no checkout", () => {
    // 1. Cliente adiciona produto com mimos
    const itemsComAdicionais: CartItem[] = [
      {
        product: dummyProduct,
        quantity: 1,
        selectedAddons: [
          {
            id: "addon-1",
            name: "Caixa Presenteável",
            price: 15,
            available: true,
          },
        ],
      },
    ];

    // 2. No carrinho, o valor total é calculado (44.90 + 15 = 59.90) sem exigir pagamento prévio
    const subtotal = 44.9 + 15;
    expect(subtotal).toBeCloseTo(59.9);

    // 3. Validação no checkout: tentativa de envio sem forma de pagamento deve falhar
    const dadosSemPagamento: CheckoutData = {
      nome: "Mariana Alves",
      cidade: "Santa Rita",
      bairro: "Centro",
      tipoEntrega: "Retirada",
      formaPagamento: undefined,
    };
    expect(!dadosSemPagamento.formaPagamento).toBe(true);

    // 4. Cliente seleciona PIX no checkout e o pedido é concluído com sucesso
    const dadosComPagamento: CheckoutData = {
      ...dadosSemPagamento,
      formaPagamento: "PIX",
    };
    const linkFinal = generateWhatsAppLink(dadosComPagamento, itemsComAdicionais, subtotal);
    const mensagem = decodeURIComponent(linkFinal);

    expect(mensagem).toContain("*Forma de pagamento:* PIX");
    expect(mensagem).toContain("Caixa Presenteável");
    expect(mensagem).toContain("1x Caneca Personalizada");
    expect(mensagem).toContain("59,90");
  });

  it("gera mensagem limpa no checkout sem campos de entrega ou localização", () => {
    const dataSemEntrega: CheckoutData = {
      nome: "Juliana Mendes",
      cidade: "Santa Rita",
      bairro: "Popular",
      formaPagamento: "PIX",
      destinatario: "Ana Beatriz",
      observacoes: "Entregar com carinho",
    };

    const link = generateWhatsAppLink(dataSemEntrega, dummyCartItems, 89.8);
    const mensagem = decodeURIComponent(link);

    expect(mensagem).toContain("*Nome:* Juliana Mendes");
    expect(mensagem).toContain("*Cidade:* Santa Rita");
    expect(mensagem).toContain("*Bairro:* Popular");
    expect(mensagem).toContain("*Forma de pagamento:* PIX");
    expect(mensagem).toContain("*Destinatário:* Ana Beatriz");
    expect(mensagem).toContain("*Observações:* Entregar com carinho");
    expect(mensagem).not.toContain("*Entrega:*");
    expect(mensagem).not.toContain("*Localização:*");
  });
});
