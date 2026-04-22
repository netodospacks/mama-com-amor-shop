import { CartItem } from "@/context/CartContext";

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
    message += `- ${item.quantity}x ${item.product.name} (R$ ${item.product.price.toFixed(2).replace('.', ',')})\n`;
  });

  message += `\n*Total:* R$ ${total.toFixed(2).replace('.', ',')}\n`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
