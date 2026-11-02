import { CartItem } from "@/context/CartContext";
import { getEffectivePrice } from "@/lib/mapper";
import { formatSubproductPrice } from "./subproducts";

export interface CheckoutData {
  nome: string;
  cidade: string;
  bairro: string;
  tipoEntrega: string;
  linkMaps?: string;
  formaPagamento?: string;
}

export function formatWhatsAppMessage(
  data: CheckoutData,
  cartItems: CartItem[],
  total: number
): string {
  const formatBRL = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  let message = `*PEDIDO — VIRTUAL STORE* 🛍️\n\n`;
  message += `*Nome:* ${data.nome}\n`;
  message += `*Cidade:* ${data.cidade}\n`;
  message += `*Bairro:* ${data.bairro}\n`;
  message += `*Entrega:* ${data.tipoEntrega}\n`;
  
  if (data.linkMaps && data.tipoEntrega === "Delivery") {
    message += `*Localização:* ${data.linkMaps}\n`;
  }
  
  if (data.formaPagamento) {
    message += `*Forma de pagamento:* ${data.formaPagamento}\n`;
  }
  
  message += `\n*ITENS DO PEDIDO:*\n\n`;
  cartItems.forEach((item) => {
    const effectivePrice = getEffectivePrice(item.product);
    const isOnPromo = item.product.isPromo && item.product.promoPrice;
    const priceStr = isOnPromo
      ? `${formatBRL(effectivePrice)} (promoção, antes: ${item.product.price})`
      : formatBRL(effectivePrice);

    message += `- ${item.quantity}x ${item.product.name} — ${priceStr}\n`;

    if (item.selectedAddons && item.selectedAddons.length > 0) {
      message += `  Adicionais:\n`;
      item.selectedAddons.forEach((addon) => {
        message += `  • 1x ${addon.name} — ${formatSubproductPrice(addon.price)}\n`;
      });
    }
    message += `\n`;
  });

  message += `*Subtotal dos produtos:* ${formatBRL(total)}\n`;
  message += `*Entrega:* ${data.tipoEntrega === "Retirada" ? "Retirada no local" : "Taxa a combinar"}\n`;
  message += `*TOTAL:* ${formatBRL(total)}\n`;

  return message;
}

export function generateWhatsAppLink(
  data: CheckoutData,
  cartItems: CartItem[],
  total: number,
  phoneNumber: string = "5583993032780" // WhatsApp oficial Virtual Store
) {
  const message = formatWhatsAppMessage(data, cartItems, total);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
