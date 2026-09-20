import { CartItem } from "@/context/CartContext";
import { getEffectivePrice } from "@/lib/mapper";

export interface CheckoutData {
  nome: string;
  cidade: string;
  bairro: string;
  tipoEntrega: string;
  linkMaps?: string;
}

export function generateWhatsAppLink(
  data: CheckoutData,
  cartItems: CartItem[],
  total: number,
  phoneNumber: string = "5511999999999" // TODO: Update with real number
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
  
  message += `\n*Itens do pedido:*\n`;
  cartItems.forEach((item) => {
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
