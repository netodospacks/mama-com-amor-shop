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
});
