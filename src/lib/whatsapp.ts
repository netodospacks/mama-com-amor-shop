import { CartItem } from "@/context/CartContext";
import { getEffectivePrice } from "@/lib/mapper";

export interface CheckoutData {
  nome: string;
  cidade: string;
  bairro: string;
  tipoEntrega: string;
  linkMaps?: string;
  formaPagamento?: string;
}

function formatPrice(price: string | number): string {
  if (typeof price === "number") {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  }
  if (typeof price === "string") {
    return price.trim().startsWith("R$") ? price.trim() : `R$ ${price.trim()}`;
  }
  return String(price);
}

export function generateWhatsAppLink(
  data: CheckoutData,
  cartItems: CartItem[],
  total: number,
  phoneNumber: string = "5583993032780" // WhatsApp oficial Virtual Store
) {
  const formatBRL = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  let message = `Pedido Virtual Store 🛍️\n\n`;
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
  
  message += `\n*Itens do pedido:*\n`;
  cartItems.forEach(item => {
    const effectivePrice = getEffectivePrice(item.product);
    const isOnPromo = item.product.isPromo && item.product.promoPrice;
    const priceStr = isOnPromo
      ? `${formatBRL(effectivePrice)} (em promoção, antes: ${item.product.price})`
      : formatBRL(effectivePrice);
    message += `- ${item.quantity}x ${item.product.name} (${priceStr})\n`;
  });

  message += `\n*Total:* ${formatBRL(total)}\n`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
