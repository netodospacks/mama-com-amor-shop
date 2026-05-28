import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { getProductById } from "@/data/catalog";
import { useCart } from "@/context/CartContext";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id || "");
  const { addItem, isCartOpen, setIsCartOpen, setIsCheckoutOpen } = useCart();

  const [mainImage, setMainImage] = useState<string | undefined>(product?.gallery?.[0] || product?.image);

  useEffect(() => {
    if (product) {
      setMainImage(product.gallery?.[0] || product.image);
    }
  }, [product]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = () => {
    addItem(product!);
    navigate("/");
  };

  const handleCheckoutDirect = () => {
    addItem(product!);
    setIsCheckoutOpen(true);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-white">
        <h1 className="text-2xl font-light mb-4 tracking-widest">PRODUTO NÃO ENCONTRADO</h1>
        <button 
          onClick={() => navigate('/')}
          className="text-sm border-b border-black dark:border-white pb-1 hover:opacity-60 transition-opacity"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 selection:text-black pb-24">
      
      {/* Premium Header minimalista */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-all">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-neutral-800 dark:text-neutral-200 hover:opacity-60 transition-opacity flex items-center gap-2"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="text-xs uppercase tracking-widest font-medium hidden sm:inline">Voltar</span>
        </button>
        <Link to="/" className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-neutral-900 dark:text-white uppercase absolute left-1/2 -translate-x-1/2">
          Eternizando Momentos
        </Link>
        <div className="flex gap-2 w-8 sm:w-auto">
           <button onClick={() => setIsCartOpen(true)} className="p-2 text-neutral-800 dark:text-neutral-200 hover:opacity-60">
             <ShoppingBag size={20} strokeWidth={1.5} />
           </button>
        </div> 
      </header>

      <main className="w-full max-w-[1400px] mx-auto px-0 md:px-8 pt-16 md:pt-32">
        <div className="flex flex-col md:flex-row gap-0 md:gap-16 lg:gap-24">
          
          {/* Esquerda: Imagem do Produto */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full md:w-1/2"
          >
            {/* Mobile: Full bleed image without extreme rounding on sides. Desktop: Rounded image with shadow. */}
            <div className="w-full aspect-[4/5] md:aspect-square bg-neutral-100 dark:bg-neutral-800 md:rounded-2xl overflow-hidden relative shadow-sm md:shadow-xl mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900" />
              {mainImage && (
                 <img src={mainImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover" /> 
              )}
              {product.isPromo && (
                <div className="absolute top-4 right-4 bg-black text-white text-[10px] md:text-xs font-medium px-3 py-1 rounded-sm backdrop-blur-md bg-black/80 uppercase tracking-widest z-10 shadow-lg">
                  Promoção
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] md:text-xs font-medium px-3 py-1 rounded-sm backdrop-blur-md bg-rose-600/90 uppercase tracking-widest z-10 shadow-lg">
                  Novidade
                </div>
              )}
            </div>

            {/* Galeria de Fotos */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide">
                {product.gallery.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${mainImage === img ? 'border-black dark:border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${product.name} - Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Direita: Informações */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full md:w-1/2 px-5 md:px-0 pt-8 md:pt-4 flex flex-col"
          >
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-3 text-black dark:text-white">
                {product.name}
              </h1>
              <p className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 mb-6">
                {product.price}
              </p>
              
              {/* Descrição Curta */}
              <p className="text-sm md:text-base text-neutral-500 leading-relaxed font-light">
                {product.shortDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-10">
              {/* Botão Adicionar ao Carrinho Premium */}
              <motion.button 
                onClick={handleAddToCart}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 md:py-5 rounded-xl text-sm md:text-base font-medium tracking-[0.15em] uppercase flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-xl" />
                <ShoppingBag size={20} strokeWidth={1.5} className="relative z-10" />
                <span className="relative z-10">Adicionar ao Carrinho</span>
              </motion.button>

              {/* Botão Secundário WhatsApp */}
              <motion.button 
                onClick={handleCheckoutDirect}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 py-3.5 md:py-4 rounded-xl text-xs md:text-sm font-medium tracking-[0.1em] uppercase flex items-center justify-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-300"
              >
                <MessageCircle size={18} strokeWidth={1.5} />
                <span>Finalizar no WhatsApp</span>
              </motion.button>
            </div>

            {/* Informações Extras e Trust Badges */}
            <div className="flex items-center gap-6 mb-12 py-6 border-y border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-500">
                <Truck size={18} strokeWidth={1.5} />
                <span className="text-[11px] md:text-xs uppercase tracking-wider">Envio Rápido</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <ShieldCheck size={18} strokeWidth={1.5} />
                <span className="text-[11px] md:text-xs uppercase tracking-wider">Compra Segura</span>
              </div>
            </div>

            {/* Descrição Detalhada e Especificações */}
            <div className="space-y-10 text-sm md:text-base font-light text-neutral-600 dark:text-neutral-400">
              
              <section>
                <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-black dark:text-white mb-4">
                  Detalhes do Produto
                </h3>
                <p className="leading-relaxed">
                  {product.detailedDescription}
                </p>
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-black dark:text-white mb-4">
                  Especificações
                </h3>
                <ul className="list-disc pl-4 space-y-2 marker:text-neutral-300 dark:marker:text-neutral-700">
                  {product.specifications.map((spec, index) => (
                    <li key={index} className="pl-2">{spec}</li>
                  ))}
                </ul>
              </section>

              <section className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium text-black dark:text-white mb-2">
                  Observações
                </h3>
                <p className="text-xs leading-relaxed text-neutral-500">
                  {product.observations}
                </p>
              </section>

            </div>

          </motion.div>

        </div>
      </main>

    </div>
  );
}
