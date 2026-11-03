import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, MessageCircle, Gift, Check, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { FormattedDescription } from "@/components/FormattedDescription";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Product as ProductType } from "@/types/product";
import { Subproduct } from "@/types/subproduct";
import { mapProductFromDB, getEffectivePrice } from "@/lib/mapper";
import { fetchSubproductsForProduct, formatSubproductPrice } from "@/lib/subproducts";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/data/catalog";
import { toast } from "sonner";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, isCartOpen, setIsCartOpen, setIsCheckoutOpen } = useCart();

  const [addons, setAddons] = useState<Subproduct[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Subproduct[]>([]);
  const [loadingAddons, setLoadingAddons] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase
            .from('products')
            .select('*, categories(slug, active)')
            .eq('id', id)
            .single();
          
          if (data) {
            // Se o produto está inativo ou sua categoria vinculada está inativa, ocultar da loja pública
            if (data.active === false || (data.categories && (data.categories as any).active === false)) {
              setProduct(null);
              setIsLoading(false);
              return;
            }

            const mappedProduct = mapProductFromDB(data);
            setProduct(mappedProduct);
            setIsLoading(false);

            // Carregar adicionais vinculados a este produto
            setLoadingAddons(true);
            try {
              const subs = await fetchSubproductsForProduct(id);
              setAddons(subs);
            } catch (e) {
              console.warn("Erro ao buscar adicionais:", e);
            } finally {
              setLoadingAddons(false);
            }
            return;
          }
        }
      } catch (err) {
        console.error("Erro ao buscar produto no Supabase:", err);
      }

      // Fallback para o catálogo local
      const local = getProductById(id);
      if (local) {
        setProduct(local);
        try {
          const subs = await fetchSubproductsForProduct(id);
          setAddons(subs);
        } catch (e) {
          console.warn("Erro ao carregar mimos locais:", e);
        }
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lista unificada e sem duplicidades de imagens do produto
  const images = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.image && typeof product.image === "string" && product.image.trim()) {
      list.push(product.image.trim());
    }
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((img) => {
        if (img && typeof img === "string" && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list;
  }, [product]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Reiniciar índice ao trocar de produto
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

  const goToNextImage = () => {
    if (images.length <= 1) return;
    setSlideDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevImage = () => {
    if (images.length <= 1) return;
    setSlideDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Suporte a swipe no celular (mantendo a rolagem vertical 100% natural)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (images.length <= 1 || touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Apenas se o movimento horizontal for predominante e perceptível (> 35px)
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Suporte a drag com mouse no desktop
  const mouseStartX = useRef<number | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    if (images.length <= 1 || e.button !== 0) return;
    mouseStartX.current = e.clientX;
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (images.length <= 1 || mouseStartX.current === null) return;
    const deltaX = e.clientX - mouseStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }
    mouseStartX.current = null;
  };

  const toggleSelectAddon = (addon: Subproduct) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, 1, selectedAddons);
    const addonsCount = selectedAddons.length;
    if (addonsCount > 0) {
      toast.success(`${product.name} (+ ${addonsCount} ${addonsCount === 1 ? 'mimo' : 'mimos'}) adicionado ao carrinho! 🎁`);
    } else {
      toast.success(`${product.name} adicionado ao carrinho! 🛍️`);
    }
    setIsCartOpen(true);
  };

  const handleCheckoutDirect = () => {
    if (!product) return;
    addItem(product, 1, selectedAddons);
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF7EE] text-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B233C]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF7EE] text-neutral-900">
        <h1 className="text-2xl font-light mb-4 tracking-widest text-[#8B233C]">PRODUTO NÃO ENCONTRADO</h1>
        <button 
          onClick={() => navigate('/')}
          className="text-sm border-b border-[#8B233C] pb-1 text-neutral-900 hover:text-[#8B233C] transition-colors"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-neutral-900 font-sans selection:bg-[#8B233C] selection:text-white pb-24">
      
      {/* Premium Header minimalista */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between bg-[#FBF7EE]/90 backdrop-blur-xl border-b border-[#EADFCF] transition-all">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-neutral-900 hover:text-[#8B233C] transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="text-xs uppercase tracking-widest font-medium hidden sm:inline">Voltar</span>
        </button>
        <Link to="/" className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#8B233C] uppercase absolute left-1/2 -translate-x-1/2">
          Eternizando Momentos
        </Link>
        <div className="flex gap-2 w-8 sm:w-auto">
           <button onClick={() => setIsCartOpen(true)} className="p-2 text-neutral-900 hover:text-[#8B233C] transition-colors">
             <ShoppingBag size={20} strokeWidth={1.5} />
           </button>
        </div> 
      </header>

      <main className="w-full max-w-[1400px] mx-auto px-0 md:px-8 pt-16 md:pt-32">
        <div className="flex flex-col md:flex-row gap-0 md:gap-16 lg:gap-24">
          
          {/* Esquerda: Imagem do Produto com Galeria Deslizante */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full md:w-1/2"
          >
            {/* Imagem Principal Grande e Limpa com suporte a Swipe */}
            <div 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className={`w-full aspect-[4/5] md:aspect-square bg-[#F5EFE6] border border-[#EADFCF] md:rounded-2xl overflow-hidden relative shadow-md mb-4 touch-pan-y ${
                images.length > 1 ? "cursor-grab active:cursor-grabbing select-none" : ""
              }`}
            >
              <div className="absolute inset-0 bg-[#F5EFE6]" />
              
              {images.length > 0 ? (
                <AnimatePresence initial={false} custom={slideDirection}>
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt={`${product.name} - Imagem ${currentImageIndex + 1}`}
                    custom={slideDirection}
                    variants={{
                      enter: (dir: number) => ({
                        x: dir > 0 ? "100%" : "-100%",
                        opacity: 0,
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                      },
                      exit: (dir: number) => ({
                        x: dir > 0 ? "-100%" : "100%",
                        opacity: 0,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  />
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                  <Gift size={32} />
                </div>
              )}

              {/* Badges de Promoção / Novidade */}
              {product.isPromo && (
                <div className="absolute top-4 right-4 bg-black text-white text-[10px] md:text-xs font-medium px-3 py-1 rounded-sm backdrop-blur-md bg-black/80 uppercase tracking-widest z-10 shadow-lg pointer-events-none">
                  Promoção
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] md:text-xs font-medium px-3 py-1 rounded-sm backdrop-blur-md bg-rose-600/90 uppercase tracking-widest z-10 shadow-lg pointer-events-none">
                  Novidade
                </div>
              )}

              {/* Controles de Navegação no Desktop (apenas se houver mais de uma foto) */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevImage();
                    }}
                    aria-label="Imagem anterior"
                    className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 dark:bg-black/70 hover:bg-white dark:hover:bg-black text-black dark:text-white backdrop-blur-md shadow-md items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 z-20"
                  >
                    <ChevronLeft size={18} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextImage();
                    }}
                    aria-label="Próxima imagem"
                    className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 dark:bg-black/70 hover:bg-white dark:hover:bg-black text-black dark:text-white backdrop-blur-md shadow-md items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 z-20"
                  >
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>

                  {/* Indicadores elegantes de paginação na própria foto */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex 
                            ? "w-5 bg-white shadow-sm" 
                            : "w-1.5 bg-white/60 backdrop-blur-sm"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Direita: Informações */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full md:w-1/2 px-5 md:px-0 pt-8 md:pt-4 flex flex-col"
          >
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 text-neutral-900">
                {product.name}
              </h1>
              <div className="flex flex-col mb-6">
                {product.isPromo && product.promoPrice ? (
                  <>
                    <span className="text-sm md:text-base text-neutral-400 line-through">
                      {product.price}
                    </span>
                    <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#8B233C]">
                      {product.promoPrice}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#8B233C]">
                    {product.price}
                  </span>
                )}
              </div>
              
              {/* Descrição Curta */}
              <FormattedDescription 
                text={(product as any).short_description || product.shortDescription} 
                className="text-sm md:text-base text-neutral-600 leading-relaxed"
              />
            </div>

            {/* Seção de Mimos & Adicionais Disponíveis (Card Branco) */}
            {addons.length > 0 && (
              <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-[#EADFCF] shadow-md text-neutral-900">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-[#8B233C] flex items-center justify-center shrink-0">
                      <Gift size={15} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
                        <span>Que tal adicionar um mimo?</span>
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Personalize seu presente e surpreenda quem você ama!
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                    Opcional
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {addons.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleSelectAddon(addon)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                          isSelected
                            ? "bg-rose-50/80 border-[#8B233C] shadow-sm"
                            : "bg-[#FAF7F2] border-[#EADFCF] hover:border-neutral-300"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 relative border border-neutral-200">
                          {addon.image ? (
                            <img src={addon.image} alt={addon.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <Gift size={16} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {addon.name}
                          </h4>
                          {addon.description && (
                            <p className="text-[10px] text-neutral-500 truncate">
                              {addon.description}
                            </p>
                          )}
                          <p className="text-[11px] font-extrabold text-[#8B233C] mt-0.5">
                            + {formatSubproductPrice(addon.price)}
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? "bg-[#8B233C] border-[#8B233C] text-white"
                              : "border-neutral-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedAddons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-200 flex items-center justify-between text-xs">
                    <span className="text-neutral-600 font-medium">
                      {selectedAddons.length} {selectedAddons.length === 1 ? "mimo selecionado" : "mimos selecionados"}
                    </span>
                    <span className="font-extrabold text-[#8B233C]">
                      + {formatSubproductPrice(selectedAddons.reduce((acc, a) => acc + (Number(a.price) || 0), 0))}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 mb-10">
              {/* Botão Adicionar ao Carrinho */}
              <motion.button 
                onClick={handleAddToCart}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#8B233C] hover:bg-[#6F1E31] text-white py-4 md:py-5 rounded-xl text-sm md:text-base font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-3 shadow-lg transition-all duration-300"
              >
                <ShoppingBag size={20} strokeWidth={1.8} className="text-white" />
                <span>
                  {selectedAddons.length > 0
                    ? `Adicionar ao Carrinho (+${selectedAddons.length} ${selectedAddons.length === 1 ? 'mimo' : 'mimos'})`
                    : "Adicionar ao Carrinho"}
                </span>
              </motion.button>

              {/* Botão Secundário WhatsApp Oficial */}
              <motion.button 
                onClick={handleCheckoutDirect}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 md:py-4 rounded-xl text-xs md:text-sm font-semibold tracking-[0.1em] uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:ring-offset-2"
              >
                <WhatsAppIcon size={19} className="text-white shrink-0" />
                <span className="text-white font-medium">Finalizar no WhatsApp</span>
              </motion.button>
            </div>

            {/* Informações Extras e Trust Badges */}
            <div className="flex items-center gap-6 mb-12 py-6 border-y border-[#EADFCF]">
              <div className="flex items-center gap-2 text-neutral-600">
                <Truck size={18} strokeWidth={1.5} className="text-[#8B233C]" />
                <span className="text-[11px] md:text-xs uppercase tracking-wider font-semibold">Envio Rápido</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <ShieldCheck size={18} strokeWidth={1.5} className="text-[#8B233C]" />
                <span className="text-[11px] md:text-xs uppercase tracking-wider font-semibold">Compra Segura</span>
              </div>
            </div>

            {/* Descrição Detalhada e Especificações */}
            <div className="space-y-10 text-sm md:text-base font-light text-neutral-700">
              
              <section>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#8B233C] mb-4">
                  Detalhes do Produto
                </h3>
                <FormattedDescription 
                  text={(product as any).description || (product as any).detailed_description || product.detailedDescription}
                />
              </section>

              {product.specifications && product.specifications.length > 0 && (
                <section>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#8B233C] mb-4">
                    Especificações
                  </h3>
                  <ul className="list-disc pl-4 space-y-2 marker:text-[#8B233C]">
                    {product.specifications.map((spec, index) => (
                      <li key={index} className="pl-2">{spec}</li>
                    ))}
                  </ul>
                </section>
              )}

              {product.observations && (
                <section className="bg-white p-5 rounded-2xl border border-[#EADFCF] shadow-sm text-neutral-900">
                  <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-[#8B233C] mb-2">
                    Observações
                  </h3>
                  <p className="text-xs leading-relaxed text-neutral-600 font-normal">
                    {product.observations}
                  </p>
                </section>
              )}

            </div>

          </motion.div>

        </div>
      </main>

    </div>
  );
}
