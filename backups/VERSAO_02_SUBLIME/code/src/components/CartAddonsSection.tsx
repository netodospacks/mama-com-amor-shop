import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Subproduct } from "@/types/subproduct";
import { CartItem, useCart } from "@/context/CartContext";
import { fetchSubproductsForProduct, formatSubproductPrice } from "@/lib/subproducts";
import { Sparkles, Plus, Check, Loader2, Gift } from "lucide-react";

interface CartAddonsSectionProps {
  item: CartItem;
}

export function CartAddonsSection({ item }: CartAddonsSectionProps) {
  const { toggleAddon } = useCart();
  const [addons, setAddons] = useState<Subproduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadAddons = async () => {
      try {
        setLoading(true);
        const data = await fetchSubproductsForProduct(item.product.id);
        if (isMounted) {
          setAddons(data);
        }
      } catch (err) {
        console.warn("Erro ao carregar adicionais para o produto:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAddons();
    return () => {
      isMounted = false;
    };
  }, [item.product.id]);

  if (loading) {
    return (
      <div className="py-2 flex items-center justify-center text-xs text-neutral-400 gap-1.5">
        <Loader2 size={12} className="animate-spin text-store-pink" />
        <span>Buscando mimos e adicionais...</span>
      </div>
    );
  }

  // Se não houver adicionais para este produto, não renderiza nada
  if (!addons || addons.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800">
      {/* Header com chamada carinhosa e editorial */}
      <div className="mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
          <Gift size={14} className="text-store-pink" />
          <span>Que tal adicionar mais um mimo?</span>
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
          Surpreenda ainda mais quem você ama!
        </p>
      </div>

      {/* Carrossel / Lista Horizontal de Adicionais */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
        {addons.map((addon) => {
          const isSelected = item.selectedAddons.some((a) => a.id === addon.id);

          return (
            <motion.div
              key={addon.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleAddon(item.id, addon)}
              className={`snap-start shrink-0 w-[140px] sm:w-[150px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-rose-50/80 dark:bg-rose-950/20 border-store-pink dark:border-store-pink shadow-sm"
                  : "bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              {/* Imagem do adicional com badge de selecionado */}
              <div className="relative w-full h-20 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-2">
                {addon.image ? (
                  <img
                    src={addon.image}
                    alt={addon.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Sparkles size={18} />
                  </div>
                )}

                {/* Badge visual de status selecionado */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-1 right-1 bg-store-pink text-white w-5 h-5 rounded-full flex items-center justify-center shadow"
                    >
                      <Check size={12} strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Informações */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-tight">
                    {addon.name}
                  </h4>
                  {addon.description && (
                    <p className="text-[9px] text-neutral-400 dark:text-neutral-500 line-clamp-1 mt-0.5">
                      {addon.description}
                    </p>
                  )}
                </div>

                <div className="mt-2 pt-1 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-store-pink dark:text-rose-400">
                    + {formatSubproductPrice(addon.price)}
                  </span>

                  <button
                    type="button"
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors flex items-center gap-0.5 ${
                      isSelected
                        ? "bg-store-pink text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={10} strokeWidth={2.5} />
                        <span>Adicionado</span>
                      </>
                    ) : (
                      <>
                        <Plus size={10} />
                        <span>Adicionar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
