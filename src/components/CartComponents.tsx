import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { CheckoutStage } from "./CheckoutStage";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { toast } from "sonner";

export function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeItem, 
    updateQuantity, 
    totalPriceFormatted, 
    setIsCheckoutOpen,
    formaPagamento,
    setFormaPagamento 
  } = useCart();
  const [paymentError, setPaymentError] = useState(false);

  const handleCheckout = () => {
    if (!formaPagamento) {
      setPaymentError(true);
      toast.error("Por favor, selecione a forma de pagamento (PIX ou CARTÃO).");
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay Escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />

          {/* Lateral Cart Slide */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[90%] sm:w-[400px] bg-white dark:bg-[#0A0A0A] shadow-2xl z-[100] flex flex-col border-l border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-sm font-medium tracking-widest uppercase flex items-center gap-2">
                <ShoppingBag size={18} />
                Seu Carrinho
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-50" />
                  <p className="text-sm">Seu carrinho está vazio</p>
                </div>
              ) : (
                items.map(item => {
                  const isOnPromo = item.product.isPromo && item.product.promoPrice;
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={item.product.id} 
                      className="flex gap-4 items-center group"
                    >
                      {/* Placeholder image */}
                      <div className="w-16 h-20 sm:w-20 sm:h-24 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden shrink-0 relative shadow-sm">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800" />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-xs sm:text-sm font-medium mb-1 line-clamp-1 dark:text-white">
                          {item.product.name}
                        </h3>
                        <div className="flex flex-col leading-tight mb-3">
                          {isOnPromo ? (
                            <>
                              <span className="text-[10px] text-gray-400 line-through">
                                {item.product.price}
                              </span>
                              <span className="text-[11px] sm:text-xs font-semibold text-neutral-500">
                                {item.product.promoPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-[11px] sm:text-xs font-semibold text-neutral-500">
                              {item.product.price}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-full overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2.5 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(item.product.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0A0A0A] space-y-4">
                {/* Seletor de Forma de Pagamento */}
                <div>
                  <PaymentMethodSelector 
                    value={formaPagamento} 
                    onChange={(method) => {
                      setFormaPagamento(method);
                      setPaymentError(false);
                    }}
                    error={paymentError}
                  />
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
                  <span className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">Total</span>
                  <span className="text-xl font-bold text-black dark:text-white">{totalPriceFormatted}</span>
                </div>
                
                {/* Botão de WhatsApp */}
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:ring-offset-2"
                >
                  <WhatsAppIcon size={19} className="text-white shrink-0" />
                  <span>Finalizar Pedido pelo WhatsApp</span>
                </motion.button>

                {/* Opção de envio rápido direto pelo WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    if (!formaPagamento) {
                      setPaymentError(true);
                      toast.error("Por favor, selecione a forma de pagamento (PIX ou CARTÃO).");
                      return;
                    }
                    let message = "Olá, gostaria de fazer este pedido:\n\n";
                    message += "*PRODUTOS:*\n\n";
                    items.forEach(item => {
                      message += `*${item.product.name}*\n`;
                      message += `Quantidade: ${item.quantity}\n`;
                      message += `Preço: ${item.product.price}\n\n`;
                    });
                    message += `*Total: ${totalPriceFormatted}*\n\n`;
                    message += `*Forma de pagamento:* ${formaPagamento}\n\n`;
                    message += "_Dados de entrega a combinar no WhatsApp._";

                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://wa.me/5583993032780?text=${encodedMessage}`, "_blank");
                  }}
                  className="w-full text-center text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors underline underline-offset-4 pt-1 block"
                >
                  Ou enviar direto no WhatsApp sem preencher endereço
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function FloatingCart() {
  const { totalItems, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen } = useCart();

  return (
    <>
      <CheckoutStage isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 z-[80] bg-black dark:bg-white text-white dark:text-black p-4 rounded-full shadow-2xl flex items-center justify-center border border-white/10"
          >
            <ShoppingBag size={24} strokeWidth={1.5} />
            <motion.div 
              key={totalItems}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md"
            >
              {totalItems}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
