import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { CheckoutStage } from "./CheckoutStage";

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPriceFormatted, setIsCheckoutOpen } = useCart();

  const handleCheckout = () => {
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
                items.map(item => (
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
                      <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800" />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-xs sm:text-sm font-medium mb-1 line-clamp-1 dark:text-white">
                        {item.product.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-semibold text-neutral-500 mb-3">
                        {item.product.price}
                      </p>

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
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0A0A0A]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs uppercase tracking-widest text-neutral-500">Total</span>
                  <span className="text-lg font-semibold">{totalPriceFormatted}</span>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-xs sm:text-sm font-medium tracking-[0.15em] uppercase shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  Finalizar Pedido
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
