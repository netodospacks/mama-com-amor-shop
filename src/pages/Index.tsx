import { motion, AnimatePresence } from "framer-motion";
import { Instagram, MoreHorizontal, X, ChevronRight, ChevronLeft, Menu, Gift, MapPin, Settings2, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { Product } from "@/types/product";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mapProductFromDB } from "@/lib/mapper";
import { 
  CATEGORIES, 
  CESTAS_CAFE_DA_MANHA, 
  CESTAS_ANIVERSARIO, 
  CESTAS_CORES,
  QUADROS_A4_CASAL,
  QUADROS_A4_ANIVERSARIO,
  QUADROS_10x15_CASAL,
  QUADROS_10x15_ANIVERSARIO
} from "@/data/catalog";

const CATEGORY_PILLS = [
  { label: "Destaques", id: "destaques" },
  { label: "Cestas", id: "cestas" },
  { label: "Quadros A4", id: "quadros-a4" },
  { label: "Quadros 10x15", id: "quadros-10x15" },
  { label: "Kits Casal", id: "kits" },
  { label: "Mamães / Bebês", id: "mamaes-bebes" },
  { label: "Produtos", id: "produtos" },
  { label: "Placas Acrílicas", id: "placas" },
  { label: "Combos", id: "combos" },
  { label: "Especial Mães", id: "maes" },
];

// ─────────────────────────────────────────────────────────────────────────────
// FeaturedCard — card boutique premium para "Produtos em destaque"
// ─────────────────────────────────────────────────────────────────────────────
const FeaturedCard = ({ product, lazy = false }: { product: Product; lazy?: boolean }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="block flex-shrink-0 w-[195px] sm:w-[230px] md:w-[260px] snap-start group h-full select-none"
    >
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300"
      >
        {/* Fotografia de Boutique com Proporção 4/5 desobstruída */}
        <div className="w-full aspect-[4/5] bg-neutral-50 dark:bg-neutral-800/60 relative overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading={lazy ? "lazy" : "eager"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Gift size={24} className="text-neutral-300 dark:text-neutral-600" />
            </div>
          )}

          {/* Badges Discretas e Elegantes */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {product.isPromo && (
              <span className="inline-block bg-black/85 backdrop-blur-md text-white text-[8.5px] sm:text-[9.5px] font-medium px-2 py-0.5 rounded uppercase tracking-[0.16em] shadow-sm">
                Promoção
              </span>
            )}
            {product.isNew && (
              <span className="inline-block bg-white/90 backdrop-blur-md text-black border border-neutral-200 text-[8.5px] sm:text-[9.5px] font-medium px-2 py-0.5 rounded uppercase tracking-[0.16em] shadow-sm">
                Novidade
              </span>
            )}
          </div>
        </div>

        {/* Textos: Hierarquia Editorial e Conversão */}
        <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="text-xs sm:text-[13px] font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2 leading-snug mb-2">
              {product.name}
            </h3>
          </div>

          <div className="mt-auto pt-1">
            {/* Preços com Clareza e Elegância */}
            <div className="flex items-baseline gap-1.5 mb-2.5">
              {product.isPromo && product.promoPrice ? (
                <>
                  <span className="text-[11px] sm:text-xs text-neutral-400 line-through font-normal">
                    {product.price}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-black dark:text-white tracking-tight">
                    {product.promoPrice}
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-base font-bold text-black dark:text-white tracking-tight">
                  {product.price}
                </span>
              )}
            </div>

            {/* Ação de Conversão: Botão Refinado de Boutique */}
            <div className="w-full py-1.5 sm:py-2 px-3 rounded-lg bg-neutral-900 group-hover:bg-black dark:bg-white dark:group-hover:bg-neutral-100 text-white dark:text-black text-[10.5px] sm:text-xs font-medium uppercase tracking-[0.12em] flex items-center justify-center gap-1.5 transition-colors shadow-sm">
              <span>Personalizar</span>
              <ArrowRight size={12} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MiniCard — card padrão para grades normais (cestas, kits, etc.)
// ─────────────────────────────────────────────────────────────────────────────
const MiniCard = ({ product }: { product: Product }) => {
  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col group relative cursor-pointer h-full"
      >
        <div className="w-full aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 rounded-lg sm:rounded-xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-500 relative mb-2 sm:mb-3">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 group-hover:scale-105 transition-transform duration-700 ease-out" />
          )}

          {product.isPromo && (
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black text-white text-[8px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-sm backdrop-blur-md bg-black/80 uppercase tracking-wider z-10">
              Promo
            </div>
          )}
          {product.isNew && (
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-black text-white text-[8px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wider z-10">
              Novidade
            </div>
          )}
        </div>

        <div className="px-0.5 mt-auto">
          <h3 className="text-[10px] sm:text-[12px] md:text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate mb-0.5 sm:mb-1 transition-colors group-hover:text-black dark:group-hover:text-white">
            {product.name}
          </h3>
          <div className="flex flex-col leading-none gap-0.5 pb-1">
            {product.isPromo && product.promoPrice ? (
              <>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] text-neutral-400 line-through font-normal">
                  {product.price}
                </span>
                <span className="text-[10px] sm:text-[12px] md:text-sm font-bold text-black dark:text-white tracking-tight">
                  {product.promoPrice}
                </span>
              </>
            ) : (
              <span className="text-[10px] sm:text-[12px] md:text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
                {product.price}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HScrollCard — card para containers com rolagem horizontal (quadros)
// ─────────────────────────────────────────────────────────────────────────────
const HScrollCard = ({ product }: { product: Product }) => {
  return (
    <Link to={`/product/${product.id}`} className="block flex-shrink-0 w-[140px] sm:w-[180px] md:w-[200px]">
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col group cursor-pointer"
      >
        <div className="w-full aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 rounded-lg sm:rounded-xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-500 relative mb-2">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900" />
          )}
          {product.isPromo && (
            <div className="absolute top-1 right-1 bg-black text-white text-[8px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wider z-10">
              Promo
            </div>
          )}
        </div>
        <div className="px-0.5 mt-2">
          <h3 className="text-[10px] sm:text-[12px] font-medium text-neutral-800 dark:text-neutral-200 truncate mb-0.5 transition-colors group-hover:text-black dark:group-hover:text-white">
            {product.name}
          </h3>
          <div className="flex flex-col leading-none gap-0.5 pb-1">
            {product.isPromo && product.promoPrice ? (
              <>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 line-through font-normal">
                  {product.price}
                </span>
                <span className="text-[10px] sm:text-[12px] font-bold text-black dark:text-white tracking-tight">
                  {product.promoPrice}
                </span>
              </>
            ) : (
              <span className="text-[10px] sm:text-[12px] font-semibold text-neutral-900 dark:text-white tracking-tight">
                {product.price}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HScrollRow — linha de produtos com rolagem horizontal (somente quadros)
// ─────────────────────────────────────────────────────────────────────────────
const HScrollRow = ({ products }: { products: Product[] }) => (
  <div className="w-full overflow-x-auto overflow-y-visible pb-3 -mx-2 px-2 scrollbar-hide"
       style={{ WebkitOverflowScrolling: "touch" }}>
    <div className="flex gap-3 sm:gap-4 w-max">
      {products.map(product => (
        <HScrollCard key={product.id} product={product} />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SubSectionHeader — cabeçalho de subcategoria (alinhado à esquerda)
// ─────────────────────────────────────────────────────────────────────────────
const SubSectionHeader = ({ title, description }: { title: string; description?: string }) => (
  <div className="mb-4 sm:mb-6">
    <h3 className="text-sm sm:text-base font-semibold tracking-[0.12em] uppercase text-black mb-1">
      {title}
    </h3>
    {description && (
      <p className="text-[11px] sm:text-xs text-neutral-600 font-light leading-relaxed max-w-sm">
        {description}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SubSectionCarousel — carrossel horizontal independente para subseções (Cestas)
// ─────────────────────────────────────────────────────────────────────────────
const SubSectionCarousel = ({
  title,
  description,
  products,
}: {
  title: string;
  description?: string;
  products: Product[];
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-10 sm:mb-14 px-2 sm:px-0">
      <div className="flex items-end justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-semibold tracking-[0.12em] uppercase text-black dark:text-white mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-sm">
              {description}
            </p>
          )}
        </div>

        {/* Controles de Navegação no Desktop/Tablet com o mesmo estilo da vitrine de destaques */}
        {products.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 pb-1">
            <button
              onClick={() => scroll('left')}
              aria-label={`Rolar ${title} para a esquerda`}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label={`Rolar ${title} para a direita`}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Trilho de rolagem horizontal com snap e peeking para smartphone */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto overflow-y-visible pb-2 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide no-scrollbar scroll-smooth snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 sm:gap-4.5 w-max pr-6 sm:pr-8">
          {products.map((product) => (
            <FeaturedCard key={product.id} product={product} lazy={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SectionCarousel — carrossel horizontal independente para seções completas (Kits, Mamães, etc.)
// ─────────────────────────────────────────────────────────────────────────────
const SectionCarousel = ({
  id,
  title,
  description,
  products,
}: {
  id: string;
  title: string;
  description?: string;
  products: Product[];
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section id={id} className="w-full mb-10 sm:mb-14">
      <div className="flex items-end justify-between mb-4 sm:mb-6 px-2 sm:px-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left text-neutral-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-[11px] sm:text-sm text-neutral-500 dark:text-neutral-400 font-light tracking-wide mt-1">
              {description}
            </p>
          )}
          <div className="w-8 h-px bg-black dark:bg-white mt-3" />
        </div>

        {/* Controles de Navegação no Desktop */}
        {products.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 pb-1">
            <button
              onClick={() => scroll('left')}
              aria-label={`Rolar ${title} para a esquerda`}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label={`Rolar ${title} para a direita`}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Trilho de rolagem horizontal com snap e peeking para smartphone */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto overflow-y-visible pb-2 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide no-scrollbar scroll-smooth snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 sm:gap-4.5 w-max pr-6 sm:pr-8">
          {products.map((product) => (
            <FeaturedCard key={product.id} product={product} lazy={true} />
          ))}
        </div>
      </div>
    </section>
  );
};



// ─────────────────────────────────────────────────────────────────────────────
// Menu
// ─────────────────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { label: "Destaques", id: "destaques" },
  { label: "Cestas", id: "cestas" },
  { label: "Quadro A4", id: "quadros-a4" },
  { label: "Quadro 10x15", id: "quadros-10x15" },
  { label: "Kits Casal", id: "kits" },
  { label: "Mamães / Bebês", id: "mamaes-bebes" },
  { label: "Produtos", id: "produtos" },
  { label: "Placas Acrílicas", id: "placas" },
  { label: "Combos Promocionais", id: "combos" },
  { label: "Especial Mães", id: "maes" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("destaques");
  const pillsContainerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isSupabaseConfigured) {
          setIsLoading(false);
          return;
        }

        const [prodRes, catRes] = await Promise.all([
          supabase
            .from('products')
            .select('*, categories(id, name, slug)')
            .eq('active', true)
            .order('sort_order'),
          supabase
            .from('categories')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true })
        ]);
        
        if (prodRes.data && prodRes.data.length > 0) {
          setProducts(prodRes.data.map(mapProductFromDB));
        }

        if (catRes.data && catRes.data.length > 0) {
          setCategoriesList(catRes.data);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do catálogo:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Retorna o nome atualizado da categoria pelo slug ou fallback
  const getCategoryDisplayName = (slug: string, defaultName: string): string => {
    const found = categoriesList.find(c => 
      c.slug === slug || 
      (slug === 'kits-casal' && (c.slug === 'kits' || c.slug === 'kits-casal')) ||
      (slug === 'mamaes-e-bebes' && (c.slug === 'mamaes-bebes' || c.slug === 'mamaes-e-bebes')) ||
      (slug === 'combos-promocionais' && (c.slug === 'combos' || c.slug === 'combos-promocionais')) ||
      (slug === 'placas-acrilicas' && (c.slug === 'placas' || c.slug === 'placas-acrilicas')) ||
      (slug === 'especial-maes' && (c.slug === 'maes' || c.slug === 'especial-maes')) ||
      c.name?.toLowerCase() === defaultName.toLowerCase()
    );
    return found?.name || defaultName;
  };

  // Retorna a descrição atualizada da categoria pelo slug ou fallback
  const getCategoryDescription = (slug: string, defaultDesc?: string): string | undefined => {
    const found = categoriesList.find(c => 
      c.slug === slug || 
      (slug === 'kits-casal' && (c.slug === 'kits' || c.slug === 'kits-casal')) ||
      (slug === 'mamaes-e-bebes' && (c.slug === 'mamaes-bebes' || c.slug === 'mamaes-e-bebes')) ||
      (slug === 'combos-promocionais' && (c.slug === 'combos' || c.slug === 'combos-promocionais')) ||
      (slug === 'placas-acrilicas' && (c.slug === 'placas' || c.slug === 'placas-acrilicas')) ||
      (slug === 'especial-maes' && (c.slug === 'maes' || c.slug === 'especial-maes'))
    );
    return found?.description ?? defaultDesc;
  };

  // Verifica se a categoria está cadastrada e ativa no Supabase
  const isCategoryActive = (slugOrId: string): boolean => {
    if (!isSupabaseConfigured || categoriesList.length === 0) return true;
    return categoriesList.some(c => 
      c.active && (
        c.slug === slugOrId || 
        c.id === slugOrId ||
        (slugOrId === 'kits-casal' && (c.slug === 'kits' || c.slug === 'kits-casal')) ||
        (slugOrId === 'mamaes-e-bebes' && (c.slug === 'mamaes-bebes' || c.slug === 'mamaes-e-bebes')) ||
        (slugOrId === 'combos-promocionais' && (c.slug === 'combos' || c.slug === 'combos-promocionais')) ||
        (slugOrId === 'placas-acrilicas' && (c.slug === 'placas' || c.slug === 'placas-acrilicas')) ||
        (slugOrId === 'especial-maes' && (c.slug === 'maes' || c.slug === 'especial-maes'))
      )
    );
  };

  // Busca produtos vinculados à categoria por ID estável, por slug ou por aliases
  const getCategoryProducts = (slugOrId: string, fallback?: Product[]): Product[] => {
    if (isSupabaseConfigured && products && products.length > 0) {
      if (!isCategoryActive(slugOrId)) {
        return [];
      }

      const matchedCat = categoriesList.find(c => 
        c.slug === slugOrId || 
        c.id === slugOrId ||
        (slugOrId === 'kits-casal' && (c.slug === 'kits' || c.slug === 'kits-casal')) ||
        (slugOrId === 'mamaes-e-bebes' && (c.slug === 'mamaes-bebes' || c.slug === 'mamaes-e-bebes')) ||
        (slugOrId === 'combos-promocionais' && (c.slug === 'combos' || c.slug === 'combos-promocionais')) ||
        (slugOrId === 'placas-acrilicas' && (c.slug === 'placas' || c.slug === 'placas-acrilicas')) ||
        (slugOrId === 'especial-maes' && (c.slug === 'maes' || c.slug === 'especial-maes'))
      );

      const targetCatId = matchedCat?.id;
      const targetSlug = matchedCat?.slug || slugOrId;

      const filtered = products.filter(p => {
        // 1. Vínculo estável primário por ID da categoria (imune a edições de nome ou slug)
        if (targetCatId && p.categoryId === targetCatId) return true;

        // 2. Vínculo por slug
        if (p.categorySlug === targetSlug || p.categorySlug === slugOrId) return true;

        // 3. Aliases de compatibilidade histórica
        if (slugOrId === 'kits-casal' && (p.categorySlug === 'kits' || p.categorySlug === 'kits-casal')) return true;
        if (slugOrId === 'mamaes-e-bebes' && (p.categorySlug === 'mamaes-bebes' || p.categorySlug === 'mamaes-e-bebes')) return true;
        if (slugOrId === 'combos-promocionais' && (p.categorySlug === 'combos' || p.categorySlug === 'combos-promocionais')) return true;
        if (slugOrId === 'placas-acrilicas' && (p.categorySlug === 'placas' || p.categorySlug === 'placas-acrilicas')) return true;
        if (slugOrId === 'especial-maes' && (p.categorySlug === 'maes' || p.categorySlug === 'especial-maes')) return true;

        return false;
      });

      return filtered;
    }
    return fallback || [];
  };

  const featuredScrollRef = useRef<HTMLDivElement>(null);

  const scrollFeatured = (direction: 'left' | 'right') => {
    if (featuredScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      featuredScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getFeaturedProducts = (): Product[] => {
    if (products && products.length > 0) {
      const fromDb = products.filter(p => p.isFeatured);
      if (fromDb.length > 0) return fromDb;
    }
    // Fallback inicial para curadoria em destaque com rolagem horizontal
    const fallbackList = [
      CESTAS_CAFE_DA_MANHA?.[0],
      QUADROS_A4_CASAL?.[0],
      CATEGORIES.KITS?.[0],
      CATEGORIES.COMBOS?.[0],
      CESTAS_ANIVERSARIO?.[0],
      QUADROS_10x15_CASAL?.[0],
      CATEGORIES.MAMAES_BEBES?.[0],
      CATEGORIES.PRODUTOS?.[0],
    ].filter(Boolean) as Product[];

    return fallbackList.map(p => ({ ...p, isFeatured: true }));
  };

  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToSection = (id: string) => {
    setActiveCategory(id);
    setMenuOpen(false);
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    const el = document.getElementById(id);
    if (el) {
      const navHeight = 70;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = Math.max(0, elementPosition - navHeight);

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    } else {
      isScrollingRef.current = false;
    }
  };

  // Categorias ativas adicionais do Supabase que não estejam nas seções nativas fixas
  const knownCategorySlugs = [
    'destaques',
    'cestas', 'cesta', 'cesta-cafe-da-manha', 'cesta-aniversario', 'cesta-cores',
    'quadros-a4', 'quadro-a4', 'quadros-casal', 'quadros-aniversario',
    'quadros-10x15', 'quadro-10x15', 'quadro-10x15-casal', 'quadro-10x15-aniversario',
    'kits', 'kits-casal',
    'mamaes-bebes', 'mamaes-e-bebes',
    'produtos',
    'placas', 'placas-acrilicas',
    'combos', 'combos-promocionais',
    'maes', 'especial-maes'
  ];

  const extraCategories = useMemo(() => {
    return categoriesList.filter(c => 
      c.active && 
      !knownCategorySlugs.includes(c.slug)
    );
  }, [categoriesList]);

  // Seções com produtos computados
  const cestasCafeProds = useMemo(() => getCategoryProducts('cesta-cafe-da-manha', CESTAS_CAFE_DA_MANHA), [products, categoriesList]);
  const cestasAnivProds = useMemo(() => getCategoryProducts('cesta-aniversario', CESTAS_ANIVERSARIO), [products, categoriesList]);
  const cestasCoresProds = useMemo(() => getCategoryProducts('cesta-cores', CESTAS_CORES), [products, categoriesList]);
  const hasCestas = cestasCafeProds.length > 0 || cestasAnivProds.length > 0 || cestasCoresProds.length > 0;

  const quadrosCasalProds = useMemo(() => getCategoryProducts('quadros-casal', QUADROS_A4_CASAL), [products, categoriesList]);
  const quadrosAnivProds = useMemo(() => getCategoryProducts('quadros-aniversario', QUADROS_A4_ANIVERSARIO), [products, categoriesList]);
  const hasQuadrosA4 = quadrosCasalProds.length > 0 || quadrosAnivProds.length > 0;

  const quadro10x15CasalProds = useMemo(() => getCategoryProducts('quadro-10x15-casal', QUADROS_10x15_CASAL), [products, categoriesList]);
  const quadro10x15AnivProds = useMemo(() => getCategoryProducts('quadro-10x15-aniversario', QUADROS_10x15_ANIVERSARIO), [products, categoriesList]);
  const hasQuadros10x15 = quadro10x15CasalProds.length > 0 || quadro10x15AnivProds.length > 0;

  const kitsProds = useMemo(() => getCategoryProducts('kits-casal', CATEGORIES.KITS), [products, categoriesList]);
  const mamaesProds = useMemo(() => getCategoryProducts('mamaes-e-bebes', CATEGORIES.MAMAES_BEBES), [products, categoriesList]);
  const produtosAvulsosProds = useMemo(() => getCategoryProducts('produtos', CATEGORIES.PRODUTOS), [products, categoriesList]);
  const placasProds = useMemo(() => getCategoryProducts('placas-acrilicas', CATEGORIES.QUADROS_PLACAS), [products, categoriesList]);
  const combosProds = useMemo(() => getCategoryProducts('combos-promocionais', CATEGORIES.COMBOS), [products, categoriesList]);
  const maesProds = useMemo(() => getCategoryProducts('especial-maes', CATEGORIES.MAES), [products, categoriesList]);

  // Lista dinâmica de pills de navegação com nomes atualizados do banco (oculta seções vazias ou inativas)
  const dynamicCategoryPills = useMemo(() => {
    const pills: { label: string; id: string }[] = [{ label: "Destaques", id: "destaques" }];

    if (hasCestas) pills.push({ label: getCategoryDisplayName('cestas', 'Cestas'), id: 'cestas' });
    if (hasQuadrosA4) pills.push({ label: getCategoryDisplayName('quadros-a4', 'Quadros A4'), id: 'quadros-a4' });
    if (hasQuadros10x15) pills.push({ label: getCategoryDisplayName('quadros-10x15', 'Quadros 10x15'), id: 'quadros-10x15' });
    if (kitsProds.length > 0) pills.push({ label: getCategoryDisplayName('kits-casal', 'Kits Casal'), id: 'kits' });
    if (mamaesProds.length > 0) pills.push({ label: getCategoryDisplayName('mamaes-e-bebes', 'Mamães / Bebês'), id: 'mamaes-bebes' });
    if (produtosAvulsosProds.length > 0) pills.push({ label: getCategoryDisplayName('produtos', 'Produtos'), id: 'produtos' });
    if (placasProds.length > 0) pills.push({ label: getCategoryDisplayName('placas-acrilicas', 'Placas Acrílicas'), id: 'placas' });
    if (combosProds.length > 0) pills.push({ label: getCategoryDisplayName('combos-promocionais', 'Combos'), id: 'combos' });
    if (maesProds.length > 0) pills.push({ label: getCategoryDisplayName('especial-maes', 'Especial Mães'), id: 'maes' });

    extraCategories.forEach(cat => {
      const catProds = getCategoryProducts(cat.id);
      if (catProds.length > 0) {
        pills.push({
          label: cat.name,
          id: cat.slug || `cat-${cat.id}`
        });
      }
    });

    return pills;
  }, [
    categoriesList, extraCategories, 
    hasCestas, hasQuadrosA4, hasQuadros10x15, 
    kitsProds, mamaesProds, produtosAvulsosProds, placasProds, combosProds, maesProds
  ]);

  // Lista dinâmica do menu lateral
  const dynamicMenuItems = useMemo(() => {
    return dynamicCategoryPills;
  }, [dynamicCategoryPills]);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      const scrollPosition = window.scrollY + 140;
      for (let i = dynamicCategoryPills.length - 1; i >= 0; i--) {
        const item = dynamicCategoryPills[i];
        const el = document.getElementById(item.id);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveCategory(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [dynamicCategoryPills]);

  useEffect(() => {
    if (pillsContainerRef.current) {
      const container = pillsContainerRef.current;
      const activeButton = container.querySelector<HTMLButtonElement>(`[data-pill-id="${activeCategory}"]`);
      if (activeButton) {
        const buttonLeft = activeButton.offsetLeft;
        const buttonWidth = activeButton.offsetWidth;
        const containerWidth = container.offsetWidth;
        const targetScroll = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: "smooth"
        });
      }
    }
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* Menu Lateral */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-[#0A0A0A] z-[210] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-semibold tracking-[0.25em] uppercase">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4">
                {dynamicMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full text-left px-6 py-4 text-sm font-medium tracking-widest uppercase text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition-all border-b border-neutral-50 dark:border-neutral-900"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="px-6 py-5 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-3">
                <a
                  href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
                >
                  <WhatsAppIcon size={18} className="text-white shrink-0" />
                  <span>Falar no WhatsApp</span>
                </a>
                <a
                  href="https://instagram.com/larissagouveiaaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors pt-1"
                >
                  <Instagram size={16} strokeWidth={1.5} />
                  <span className="tracking-wider">@larissagouveiaaa</span>
                </a>
                <Link
                  to="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 text-sm text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Settings2 size={16} strokeWidth={1.5} />
                  <span className="tracking-wider text-xs">Painel Admin</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* CABEÇALHO E HERO PROFISSIONAL — VIRTUAL STORE              */}
      {/* ========================================================== */}
      <header className="relative w-full bg-white text-neutral-900 border-b border-neutral-100">
        {/* Barra Superior: Menu + Marca Central + Ações (Instagram + WhatsApp) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-neutral-100">
          {/* Menu Hambúrguer */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir Menu"
            className="p-2 -ml-2 text-neutral-700 hover:text-black hover:bg-neutral-100/80 rounded-lg transition-colors focus:outline-none"
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>

          {/* Marca Centralizada */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Gift size={16} strokeWidth={1.75} className="text-neutral-900" />
              <span className="text-sm sm:text-base font-semibold tracking-[0.22em] text-neutral-900 uppercase leading-tight font-sans">
                VIRTUAL STORE
              </span>
            </div>
            <span className="text-[8.5px] sm:text-[9.5px] font-normal tracking-[0.26em] text-neutral-400 uppercase">
              Presentes Personalizados
            </span>
          </div>

          {/* Ações Direitas: Instagram + Botão WhatsApp no Header */}
          <div className="flex items-center gap-1.5 sm:gap-2 -mr-2">
            <a
              href="https://instagram.com/larissagouveiaaa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da loja"
              className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100/80 rounded-lg transition-colors focus:outline-none"
            >
              <Instagram size={20} strokeWidth={1.75} />
            </a>
            <a
              href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 transition-all duration-200 text-[11px] sm:text-xs font-semibold tracking-wider uppercase focus:outline-none"
            >
              <WhatsAppIcon size={14} className="shrink-0" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Apresentação da Marca (Hero Editorial e Equilibrado) */}
        <div className="max-w-3xl mx-auto px-4 pt-10 sm:pt-14 pb-8 sm:pb-10 flex flex-col items-center text-center">
          {/* Tag de Topo Refinada */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100/80 border border-neutral-200/60 text-neutral-500 text-[10.5px] sm:text-xs font-medium tracking-[0.2em] uppercase mb-4 sm:mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            <span>Catálogo Exclusivo</span>
          </div>

          {/* Slogan Principal — Fonte Anton (anterior) */}
          <h1 className="font-anton text-[36px] sm:text-[58px] md:text-[72px] lg:text-[84px] font-normal text-black tracking-[-0.01em] leading-[0.98] max-w-2xl mx-auto mb-5 sm:mb-6 text-center select-none">
            Transformamos<br />
            sentimentos em presentes<br />
            inesquecíveis.
          </h1>

          {/* Região de Atendimento */}
          <div className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-medium tracking-[0.14em] text-neutral-500 uppercase mb-6 sm:mb-7">
            <MapPin size={13} strokeWidth={1.8} className="text-neutral-400 shrink-0" />
            <span>João Pessoa • Santa Rita e Região</span>
          </div>

          {/* Botão Principal de WhatsApp no Header / Hero */}
          <a
            href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-[0_4px_18px_rgba(37,211,102,0.28)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.42)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 group"
          >
            <WhatsAppIcon size={18} className="text-white shrink-0 group-hover:scale-110 transition-transform" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Barra de Categorias Horizontal ("Cards Pequenos" inspirados no esboço, com tipografia profissional e acabamento comercial) */}
      <nav 
        aria-label="Navegação por categorias"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-y border-neutral-200 py-3 sm:py-3.5 shadow-sm transition-all"
      >
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Fades laterais para indicar rolagem no mobile */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 sm:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 sm:hidden" />

          <div 
            ref={pillsContainerRef}
            className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5 px-1 scroll-smooth"
          >
            {dynamicCategoryPills.map((pill) => {
              const isActive = activeCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  data-pill-id={pill.id}
                  onClick={() => scrollToSection(pill.id)}
                  className={`relative shrink-0 px-4 py-2 sm:px-4.5 sm:py-2 rounded-lg text-xs sm:text-[13px] tracking-wide transition-all whitespace-nowrap focus:outline-none select-none border ${
                    isActive
                      ? "bg-black text-white border-black font-semibold shadow-sm"
                      : "bg-neutral-50/90 text-neutral-600 hover:text-black hover:bg-neutral-100 border-neutral-200/80 font-medium"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal com Catálogo */}
      <main className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 md:px-8 py-10 sm:py-16 space-y-16 sm:space-y-28">

        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
          </div>
        ) : (
          <>
            {/* PRODUTOS EM DESTAQUE (ROLAGEM HORIZONTAL PARA A DIREITA) */}
            <section id="destaques" className="w-full pb-0">
              <div className="flex items-end justify-between mb-4 sm:mb-6 px-1 sm:px-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left text-black dark:text-white">
                    Produtos em destaque
                  </h2>
                  <div className="w-8 h-px bg-black dark:bg-white mt-2" />
                </div>

                {/* Controles de Navegação (Desktop/Tablet) */}
                <div className="hidden sm:flex items-center gap-1.5 pb-1">
                  <button
                    onClick={() => scrollFeatured('left')}
                    aria-label="Rolar para a esquerda"
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollFeatured('right')}
                    aria-label="Rolar para a direita"
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Trilho com rolagem horizontal para a direita */}
              <div
                ref={featuredScrollRef}
                className="w-full overflow-x-auto overflow-y-visible pb-2 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide no-scrollbar scroll-smooth snap-x snap-mandatory"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="flex gap-3 sm:gap-4.5 w-max pr-6 sm:pr-8">
                  {getFeaturedProducts().map(product => (
                    <FeaturedCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>

            {/* CESTAS */}
            {hasCestas && (
              <section id="cestas" className="w-full -mt-5 sm:-mt-8">
                <div className="mb-8 sm:mb-10 px-2 sm:px-0">
                  <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                    {getCategoryDisplayName('cestas', 'Cestas')}
                  </h2>
                  <div className="w-8 h-px bg-black mt-2" />
                </div>
                {cestasCafeProds.length > 0 && (
                  <SubSectionCarousel 
                    title={getCategoryDisplayName('cesta-cafe-da-manha', 'Cesta Café da Manhã')} 
                    description={getCategoryDescription('cesta-cafe-da-manha', 'Cada detalhe escolhido pensando em transformar uma manhã em uma lembrança inesquecível.')} 
                    products={cestasCafeProds}
                  />
                )}
                {cestasAnivProds.length > 0 && (
                  <SubSectionCarousel 
                    title={getCategoryDisplayName('cesta-aniversario', 'Cesta Aniversário')} 
                    description={getCategoryDescription('cesta-aniversario', 'Um aniversário ainda mais especial, com carinho em cada detalhe.')} 
                    products={cestasAnivProds}
                  />
                )}
                {cestasCoresProds.length > 0 && (
                  <SubSectionCarousel 
                    title={getCategoryDisplayName('cesta-cores', 'Cesta Cores')} 
                    description={getCategoryDescription('cesta-cores', 'Mais do que uma cesta, um carinho preparado em cada detalhe.')} 
                    products={cestasCoresProds}
                  />
                )}
              </section>
            )}

            {/* QUADRO A4 */}
            {hasQuadrosA4 && (
              <section id="quadros-a4" className="w-full">
                <div className="mb-8 sm:mb-10 px-2 sm:px-0">
                  <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                    {getCategoryDisplayName('quadros-a4', 'Quadro A4')}
                  </h2>
                  <p className="text-[11px] sm:text-sm text-neutral-500 dark:text-neutral-400 font-light tracking-wide mt-1">
                    {getCategoryDescription('quadros-a4', 'Escolha o tema, personalize cada detalhe e transforme uma memória.')}
                  </p>
                  <div className="w-8 h-px bg-black mt-3" />
                </div>
                {quadrosCasalProds.length > 0 && (
                  <SubSectionCarousel 
                    title={getCategoryDisplayName('quadros-casal', 'Quadros Casal')} 
                    description={getCategoryDescription('quadros-casal')}
                    products={quadrosCasalProds}
                  />
                )}
                {quadrosAnivProds.length > 0 && (
                  <SubSectionCarousel 
                    title={getCategoryDisplayName('quadros-aniversario', 'Quadros Aniversário')} 
                    description={getCategoryDescription('quadros-aniversario')}
                    products={quadrosAnivProds}
                  />
                )}
              </section>
            )}

            {/* QUADRO 10X15 */}
            {hasQuadros10x15 && (
              <section id="quadros-10x15" className="w-full">
                <div className="mb-8 sm:mb-10 px-2 sm:px-0">
                  <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                    {getCategoryDisplayName('quadros-10x15', 'Quadro 10x15')}
                  </h2>
                  <p className="text-[11px] sm:text-sm text-neutral-500 dark:text-neutral-400 font-light tracking-wide mt-1">
                    {getCategoryDescription('quadros-10x15', 'Transforme momentos especiais em uma lembrança que fica para sempre.')}
                  </p>
                  <div className="w-8 h-px bg-black mt-3" />
                </div>
                {quadro10x15CasalProds.length > 0 && (
                  <SubSectionCarousel 
                    title={getCategoryDisplayName('quadro-10x15-casal', 'Quadro 10x15 Casal')} 
                    description={getCategoryDescription('quadro-10x15-casal')}
                    products={quadro10x15CasalProds}
                  />
                )}
                {quadro10x15AnivProds.length > 0 && (
                  <SubSectionCarousel 
                    title={getCategoryDisplayName('quadro-10x15-aniversario', 'Quadro 10x15 Aniversário')} 
                    description={getCategoryDescription('quadro-10x15-aniversario')}
                    products={quadro10x15AnivProds}
                  />
                )}
              </section>
            )}

            {/* KITS CASAL */}
            {kitsProds.length > 0 && (
              <SectionCarousel
                id="kits"
                title={getCategoryDisplayName('kits-casal', 'Kits Casal')}
                description={getCategoryDescription('kits-casal', 'Composições exclusivas criadas por especialistas')}
                products={kitsProds}
              />
            )}

            {/* MAMÃES / BEBÊS */}
            {mamaesProds.length > 0 && (
              <SectionCarousel
                id="mamaes-bebes"
                title={getCategoryDisplayName('mamaes-e-bebes', 'Mamães / Bebês')}
                description={getCategoryDescription('mamaes-e-bebes', 'Presentes especiais para mamãe e bebê')}
                products={mamaesProds}
              />
            )}

            {/* PRODUTOS AVULSOS */}
            {produtosAvulsosProds.length > 0 && (
              <SectionCarousel
                id="produtos"
                title={getCategoryDisplayName('produtos', 'Produtos')}
                description={getCategoryDescription('produtos', 'Coleção principal com curadoria especial')}
                products={produtosAvulsosProds}
              />
            )}
            
            {/* PLACAS ACRÍLICAS */}
            {placasProds.length > 0 && (
              <SectionCarousel
                id="placas"
                title={getCategoryDisplayName('placas-acrilicas', 'Placas Acrílicas')}
                description={getCategoryDescription('placas-acrilicas', 'Placas decorativas incríveis')}
                products={placasProds}
              />
            )}

            {/* COMBOS PROMOCIONAIS */}
            {combosProds.length > 0 && (
              <SectionCarousel
                id="combos"
                title={getCategoryDisplayName('combos-promocionais', 'Combos Promocionais')}
                description={getCategoryDescription('combos-promocionais', 'Ofertas imperdíveis por tempo limitado')}
                products={combosProds}
              />
            )}
            
            {/* ESPECIAL MÃES */}
            {maesProds.length > 0 && (
              <SectionCarousel
                id="maes"
                title={getCategoryDisplayName('especial-maes', 'Especial Mães')}
                description={getCategoryDescription('especial-maes', 'Presentes inesquecíveis para quem você mais ama')}
                products={maesProds}
              />
            )}

            {/* CATEGORIAS EXTRAS DINÂMICAS DO BANCO DE DADOS */}
            {extraCategories.map(cat => {
              const catProducts = getCategoryProducts(cat.id);
              if (catProducts.length === 0) return null;
              return (
                <SectionCarousel
                  key={cat.id}
                  id={cat.slug || `cat-${cat.id}`}
                  title={cat.name}
                  description={cat.description}
                  products={catProducts}
                />
              );
            })}
          </>
        )}

      </main>

      <footer className="w-full border-t border-neutral-200 py-16 px-4 flex flex-col items-center justify-center text-center mt-20 bg-white text-black">
        <span className="text-sm font-semibold tracking-[0.3em] mb-4 uppercase">Eternizando Momentos</span>
        <p className="text-xs text-neutral-500 max-w-sm font-light leading-relaxed">
          A excelência em produtos premium, pensados para os clientes mais exigentes.
        </p>
        <div className="mt-8 pt-8 border-t border-neutral-200 w-full max-w-xs text-[10px] text-neutral-400">
          © {new Date().getFullYear()} Eternizando Momentos. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
