import { CartItem } from "@/context/CartContext";

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
  cartItems.forEach((item) => {
    message += `- ${item.quantity}x ${item.product.name} (${formatPrice(item.product.price)})\n`;
  });

  message += `\n*Total:* R$ ${total.toFixed(2).replace(".", ",")}\n`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
