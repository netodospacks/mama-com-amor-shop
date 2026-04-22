import { CartItem } from "@/context/CartContext";

interface CheckoutData {
  nome: string;
  endereco: string;
  cidade: string;
  pagamento: string;
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
  message += `*Endereço:* ${data.endereco}\n`;
  message += `*Cidade:* ${data.cidade}\n`;
  if (data.linkMaps) {
    message += `*Localização:* ${data.linkMaps}\n`;
  }
  message += `\n*Pagamento:* ${data.pagamento}\n`;
  message += `*Entrega:* ${data.tipoEntrega}\n\n`;

  message += `*Itens do pedido:*\n`;
  cartItems.forEach((item) => {
    message += `- ${item.quantity}x ${item.product.name} (R$ ${item.product.price.toFixed(2).replace('.', ',')})\n`;
  });

  message += `\n*Total:* R$ ${total.toFixed(2).replace('.', ',')}\n`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
