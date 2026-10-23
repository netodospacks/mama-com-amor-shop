import { motion, AnimatePresence } from "framer-motion";
import { Instagram, MoreHorizontal, X, ChevronRight, ChevronLeft, Menu, Gift, MapPin, Settings2 } from "lucide-react";
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
// FeaturedCard — card especial para "Produtos em destaque" (conforme referência)
// ─────────────────────────────────────────────────────────────────────────────
const FeaturedCard = ({ product }: { product: Product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="block flex-shrink-0 w-[205px] sm:w-[240px] md:w-[270px] snap-start group h-full select-none"
    >
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col h-full bg-[#f2f3f5] dark:bg-neutral-800/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      >
        {/* Imagem do Produto */}
        <div className="w-full aspect-[4/5] bg-neutral-200/60 dark:bg-neutral-700/50 relative overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700" />
          )}

          {product.isPromo && (
            <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider z-10">
              Promo
            </div>
          )}

          {/* Botão Comprar flutuante no canto inferior direito da foto */}
          <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10">
            <span className="inline-flex items-center justify-center bg-black text-white text-xs sm:text-[13px] font-medium px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl shadow-md group-hover:bg-neutral-800 group-hover:scale-105 transition-all duration-200">
              Comprar
            </span>
          </div>
        </div>

        {/* Textos: Nome e Preço */}
        <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-grow">
          <h3 className="text-xs sm:text-[13px] md:text-sm font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide line-clamp-2 leading-snug mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto">
            {product.isPromo && product.promoPrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] sm:text-xs text-neutral-400 line-through">
                  {product.price}
                </span>
                <span className="text-sm sm:text-base md:text-lg font-bold text-neutral-700 dark:text-neutral-100">
                  {product.promoPrice}
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-base md:text-lg font-bold text-neutral-700 dark:text-neutral-100">
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
            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
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
            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
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

  // Busca produtos vinculados à categoria por ID estável, por slug ou por aliases
  const getCategoryProducts = (slugOrId: string, fallback?: Product[]): Product[] => {
    if (products && products.length > 0) {
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

      if (filtered && filtered.length > 0) return filtered;
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

  // Lista dinâmica de pills de navegação com nomes atualizados do banco
  const dynamicCategoryPills = useMemo(() => {
    const base = CATEGORY_PILLS.map(pill => ({
      ...pill,
      label: pill.id === 'destaques' ? 'Destaques' : getCategoryDisplayName(pill.id, pill.label)
    }));
    const extras = extraCategories.map(cat => ({
      label: cat.name,
      id: cat.slug || `cat-${cat.id}`
    }));
    return [...base, ...extras];
  }, [categoriesList, extraCategories]);

  // Lista dinâmica do menu lateral
  const dynamicMenuItems = useMemo(() => {
    const base = MENU_ITEMS.map(item => ({
      ...item,
      label: item.id === 'destaques' ? 'Destaques' : getCategoryDisplayName(item.id, item.label)
    }));
    const extras = extraCategories.map(cat => ({
      label: cat.name,
      id: cat.slug || `cat-${cat.id}`
    }));
    return [...base, ...extras];
  }, [categoriesList, extraCategories]);

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
            <section id="cestas" className="w-full -mt-5 sm:-mt-8">
              <div className="mb-8 sm:mb-10 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                  {getCategoryDisplayName('cestas', 'Cestas')}
                </h2>
                <div className="w-8 h-px bg-black mt-2" />
              </div>
              <div className="mb-10 sm:mb-14 px-2 sm:px-0">
                <SubSectionHeader title="Cesta Café da Manhã" description="Cada detalhe escolhido pensando em transformar uma manhã em uma lembrança inesquecível." />
                <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                  {getCategoryProducts('cesta-cafe-da-manha', CESTAS_CAFE_DA_MANHA).map(product => <MiniCard key={product.id} product={product} />)}
                </div>
              </div>
              <div className="mb-10 sm:mb-14 px-2 sm:px-0">
                <SubSectionHeader title="Cesta Aniversário" description="Um aniversário ainda mais especial, com carinho em cada detalhe." />
                <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                  {getCategoryProducts('cesta-aniversario', CESTAS_ANIVERSARIO).map(product => <MiniCard key={product.id} product={product} />)}
                </div>
              </div>
              <div className="px-2 sm:px-0">
                <SubSectionHeader title="Cesta Cores" description="Mais do que uma cesta, um carinho preparado em cada detalhe." />
                <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                  {getCategoryProducts('cesta-cores', CESTAS_CORES).map(product => <MiniCard key={product.id} product={product} />)}
                </div>
              </div>
            </section>

            {/* QUADRO A4 */}
            <section id="quadros-a4" className="w-full">
              <div className="mb-8 sm:mb-10 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                  {getCategoryDisplayName('quadros-a4', 'Quadro A4')}
                </h2>
                <p className="text-[11px] sm:text-sm text-neutral-500 dark:text-neutral-400 font-light tracking-wide mt-1">Escolha o tema, personalize cada detalhe e transforme uma memória.</p>
                <div className="w-8 h-px bg-black mt-3" />
              </div>
              <div className="mb-10 sm:mb-14 px-2 sm:px-0">
                <SubSectionHeader title="Quadros Casal" />
                <HScrollRow products={getCategoryProducts('quadros-casal', QUADROS_A4_CASAL)} />
              </div>
              <div className="px-2 sm:px-0">
                <SubSectionHeader title="Quadros Aniversário" />
                <HScrollRow products={getCategoryProducts('quadros-aniversario', QUADROS_A4_ANIVERSARIO)} />
              </div>
            </section>

            {/* QUADRO 10X15 */}
            <section id="quadros-10x15" className="w-full">
              <div className="mb-8 sm:mb-10 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                  {getCategoryDisplayName('quadros-10x15', 'Quadro 10x15')}
                </h2>
                <p className="text-[11px] sm:text-sm text-neutral-500 dark:text-neutral-400 font-light tracking-wide mt-1">Transforme momentos especiais em uma lembrança que fica para sempre.</p>
                <div className="w-8 h-px bg-black mt-3" />
              </div>
              <div className="mb-10 sm:mb-14 px-2 sm:px-0">
                <SubSectionHeader title="Quadro 10x15 Casal" />
                <HScrollRow products={getCategoryProducts('quadro-10x15-casal', QUADROS_10x15_CASAL)} />
              </div>
              <div className="px-2 sm:px-0">
                <SubSectionHeader title="Quadro 10x15 Aniversário" />
                <HScrollRow products={getCategoryProducts('quadro-10x15-aniversario', QUADROS_10x15_ANIVERSARIO)} />
              </div>
            </section>

            {/* KITS CASAL */}
            <section id="kits" className="w-full">
              <div className="mb-8 sm:mb-12 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                  {getCategoryDisplayName('kits-casal', 'Kits Casal')}
                </h2>
                <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide mt-1">Composições exclusivas criadas por especialistas</p>
                <div className="w-8 h-px bg-black mt-3" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                {getCategoryProducts('kits-casal', CATEGORIES.KITS).map(product => <MiniCard key={product.id} product={product} />)}
              </div>
            </section>

            {/* MAMÃES / BEBÊS */}
            <section id="mamaes-bebes" className="w-full">
              <div className="mb-8 sm:mb-12 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                  {getCategoryDisplayName('mamaes-e-bebes', 'Mamães / Bebês')}
                </h2>
                <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide mt-1">Presentes especiais para mamãe e bebê</p>
                <div className="w-8 h-px bg-black mt-3" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                {getCategoryProducts('mamaes-e-bebes', CATEGORIES.MAMAES_BEBES).map(product => <MiniCard key={product.id} product={product} />)}
              </div>
            </section>

            {/* PRODUTOS AVULSOS */}
            <section id="produtos" className="w-full">
              <div className="mb-8 sm:mb-12 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                  {getCategoryDisplayName('produtos', 'Produtos')}
                </h2>
                <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide mt-1">Coleção principal com curadoria especial</p>
                <div className="w-8 h-px bg-black mt-3" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                {getCategoryProducts('produtos', CATEGORIES.PRODUTOS).map(product => (
                  <div key={product.id} className="scale-[1.02] sm:scale-100">
                    <MiniCard product={product} />
                  </div>
                ))}
              </div>
            </section>
            
            {/* PLACAS ACRÍLICAS */}
            <section id="placas" className="w-full">
              <div className="mb-8 sm:mb-12 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left">
                  {getCategoryDisplayName('placas-acrilicas', 'Placas Acrílicas')}
                </h2>
                <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide mt-1">Placas decorativas incríveis</p>
                <div className="w-8 h-px bg-black mt-3" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                {getCategoryProducts('placas-acrilicas', CATEGORIES.QUADROS_PLACAS).map(product => <MiniCard key={product.id} product={product} />)}
              </div>
            </section>

            {/* COMBOS PROMOCIONAIS */}
            <section id="combos" className="w-full">
              <div className="mb-8 sm:mb-12 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left text-neutral-900 dark:text-white">
                  {getCategoryDisplayName('combos-promocionais', 'Combos Promocionais')}
                </h2>
                <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide mt-1">Ofertas imperdíveis por tempo limitado</p>
                <div className="w-8 h-px bg-black mt-3" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                {getCategoryProducts('combos-promocionais', CATEGORIES.COMBOS).map(product => <MiniCard key={product.id} product={product} />)}
              </div>
            </section>
            
            {/* ESPECIAL MÃES */}
            <section id="maes" className="w-full">
              <div className="mb-8 sm:mb-12 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left text-black">
                  {getCategoryDisplayName('especial-maes', 'Especial Mães')}
                </h2>
                <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide mt-1">Presentes inesquecíveis para quem você mais ama</p>
                <div className="w-8 h-px bg-black mt-3" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                {getCategoryProducts('especial-maes', CATEGORIES.MAES).map(product => <MiniCard key={product.id} product={product} />)}
              </div>
            </section>

            {/* CATEGORIAS EXTRAS DINÂMICAS DO BANCO DE DADOS */}
            {extraCategories.map(cat => {
              const catProducts = getCategoryProducts(cat.id);
              if (catProducts.length === 0) return null;
              return (
                <section key={cat.id} id={cat.slug || `cat-${cat.id}`} className="w-full">
                  <div className="mb-8 sm:mb-12 px-2 sm:px-0">
                    <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-1 text-left text-black dark:text-white">
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide mt-1">
                        {cat.description}
                      </p>
                    )}
                    <div className="w-8 h-px bg-black dark:bg-white mt-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
                    {catProducts.map(product => <MiniCard key={product.id} product={product} />)}
                  </div>
                </section>
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
