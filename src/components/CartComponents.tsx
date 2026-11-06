import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { CheckoutStage } from "./CheckoutStage";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { CartAddonsSection } from "./CartAddonsSection";
import { formatSubproductPrice } from "@/lib/subproducts";

export function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeItem, 
    updateQuantity, 
    removeAddon,
    totalPriceFormatted, 
    subtotalProductsFormatted,
    subtotalAddonsFormatted,
    subtotalAddons,
    setIsCheckoutOpen,
  } = useCart();
  const navigate = useNavigate();

  // Fechar carrinho com tecla Escape
  useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsCartOpen(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay Escuro com Z-Index Alto */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] cursor-pointer"
          />

          {/* Lateral Cart Slide */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[90%] sm:w-[440px] bg-white dark:bg-[#0A0A0A] shadow-2xl z-[1000] flex flex-col border-l border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-sm font-medium tracking-widest uppercase flex items-center gap-2">
                <ShoppingBag size={18} />
                Seu Carrinho
              </h2>
              <button 
                type="button"
                aria-label="Fechar carrinho"
                onClick={handleClose}
                className="p-2.5 -mr-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center min-w-[40px] min-h-[40px] touch-manipulation z-20"
              >
                <X size={20} className="pointer-events-none" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 py-12">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-50" />
                  <p className="text-sm">Seu carrinho está vazio</p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-4 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    Continuar comprando
                  </button>
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
                      key={item.id || item.product.id} 
                      className="flex flex-col bg-neutral-50/70 dark:bg-neutral-900/50 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800"
                    >
                      {/* Linha do Produto Principal */}
                      <div className="flex gap-3.5 items-center">
                        <div className="w-16 h-20 sm:w-18 sm:h-22 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden shrink-0 relative shadow-sm">
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
                          <div className="flex flex-col leading-tight mb-2">
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
                            <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-full overflow-hidden bg-white dark:bg-neutral-800">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2.5 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2.5 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                              title="Remover produto do carrinho"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Chips de Adicionais Selecionados */}
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-1.5">
                            Mimos adicionados:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.selectedAddons.map((addon) => (
                              <span
                                key={addon.id}
                                className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40 px-2 py-0.5 rounded-lg text-[10px] font-medium"
                              >
                                <span>{addon.name}</span>
                                <span className="text-[9px] font-bold opacity-80">
                                  (+{formatSubproductPrice(addon.price)})
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeAddon(item.id, addon.id);
                                  }}
                                  className="text-rose-400 hover:text-red-600 transition-colors p-0.5 rounded-full"
                                  title="Remover este adicional"
                                >
                                  <X size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Seção 'Que tal adicionar mais um mimo?' */}
                      <CartAddonsSection item={item} />
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0A0A0A] space-y-4">
                {/* Discriminação de Subtotais se houver adicionais */}
                {subtotalAddons > 0 && (
                  <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex justify-between">
                      <span>Produtos</span>
                      <span>{subtotalProductsFormatted}</span>
                    </div>
                    <div className="flex justify-between text-store-pink dark:text-rose-400">
                      <span>Mimos e adicionais</span>
                      <span>+{subtotalAddonsFormatted}</span>
                    </div>
                  </div>
                )}

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
                  <span>Finalizar no WhatsApp</span>
                </motion.button>
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
