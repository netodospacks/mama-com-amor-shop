import { CartItem } from "@/context/CartContext";
import { getEffectivePrice } from "@/lib/mapper";
import { formatSubproductPrice } from "./subproducts";

export interface CheckoutData {
  nome: string;
  cidade?: string;
  bairro?: string;
  tipoEntrega?: string;
  linkMaps?: string;
  destinatario?: string;
  observacoes?: string;
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
  if (data.cidade) {
    message += `*Cidade:* ${data.cidade}\n`;
  }
  if (data.bairro) {
    message += `*Bairro:* ${data.bairro}\n`;
  }
  if (data.tipoEntrega) {
    message += `*Entrega:* ${data.tipoEntrega}\n`;
  }
  if (data.linkMaps) {
    message += `*Localização:* ${data.linkMaps}\n`;
  }
  if (data.destinatario) {
    message += `*Destinatário:* ${data.destinatario}\n`;
  }
  if (data.observacoes) {
    message += `*Observações:* ${data.observacoes}\n`;
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
