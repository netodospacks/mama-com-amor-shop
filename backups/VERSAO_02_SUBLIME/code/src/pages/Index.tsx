import { motion, AnimatePresence } from "framer-motion";
import { 
  Instagram, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Gift, 
  ArrowRight, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Heart, 
  Award, 
  Briefcase, 
  Clock, 
  ShieldCheck, 
  Check, 
  HelpCircle,
  Menu as MenuIcon
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { Product } from "@/types/product";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mapProductFromDB } from "@/lib/mapper";
import { useCart } from "@/context/CartContext";
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

// ─────────────────────────────────────────────────────────────────────────────
// Hook para rolagem por arraste do mouse no desktop sem interferir no clique
// ─────────────────────────────────────────────────────────────────────────────
const useCarouselDrag = (scrollRef: React.RefObject<HTMLDivElement>) => {
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 5) {
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        setIsDragging(true);
      }
      scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const onMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setTimeout(() => {
        setIsDragging(false);
        hasMovedRef.current = false;
      }, 50);
    }
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return {
    isDragging,
    dragProps: {
      onMouseDown,
      onMouseMove,
      onMouseUp: onMouseUpOrLeave,
      onMouseLeave: onMouseUpOrLeave,
      onClickCapture,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Card de Produto Sublime / Visual Story
// ─────────────────────────────────────────────────────────────────────────────
const SublimeProductCard = ({ 
  product, 
  badge = "SELEÇÃO ESPECIAL",
  buttonText = "Conhecer e personalizar"
}: { 
  product: Product; 
  badge?: string;
  buttonText?: string;
}) => {
  return (
    <article className="group bg-[#fffdfa] rounded-[2px] border border-[#e5ded4] p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(11,34,57,0.06)]">
      <Link 
        to={`/product/${product.id}`}
        className="block relative overflow-hidden bg-[#f1ece3] aspect-[4/5] rounded-[2px]"
      >
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover p-2.5 transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#c6a16b]">
            <Gift size={32} strokeWidth={1.5} />
          </div>
        )}

        {/* Tag Sublime */}
        <div className="absolute left-2.5 bottom-2.5 bg-[#fcfaf6ec] text-[#7d663f] text-[8px] font-sans font-medium px-2 py-0.5 border border-[#c6a16b45] uppercase tracking-[0.12em]">
          {product.isPromo ? "PROMOÇÃO" : (product.isNew ? "NOVIDADE" : badge)}
        </div>
      </Link>

      <div className="pt-3 pb-1 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif-sublime text-[17px] sm:text-[19px] text-[#0b2239] line-clamp-1 leading-snug mb-1 group-hover:text-[#8b693b] transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-[11px] text-[#6d757a] line-clamp-2 leading-relaxed mb-2 font-sans">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-2 mb-2.5">
            {product.isPromo && product.promoPrice ? (
              <>
                <span className="text-xs text-[#a0a6aa] line-through font-sans">
                  {product.price}
                </span>
                <span className="text-[16px] sm:text-[18px] font-sans font-semibold text-[#0b2239] tracking-tight">
                  {product.promoPrice}
                </span>
              </>
            ) : (
              <span className="text-[15px] sm:text-[17px] font-sans font-medium text-[#0b2239]">
                {product.price}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.id}`}
            className="w-full inline-flex items-center justify-between py-2.5 px-3 bg-transparent border-b border-[#c7b18e] hover:border-[#0b2239] text-[#0b2239] hover:text-[#8b693b] text-[11px] font-sans font-medium tracking-[0.03em] transition-all group/btn"
          >
            <span>{buttonText}</span>
            <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: Index (Visual Story — Conceito Sublime)
// ─────────────────────────────────────────────────────────────────────────────
export default function Index() {
  const { totalItems, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros interativos da vitrine "Queridinhos"
  const [favoritesFilter, setFavoritesFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Categoria ativa do Catálogo Completo
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");

  // Ordenação do catálogo
  const [catalogSort, setCatalogSort] = useState<"featured" | "low" | "high">("featured");

  // Modal / Dropdown "Presente para"
  const [isGiftGuideOpen, setIsGiftGuideOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Busca de dados do Supabase
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

  // Produto de destaque para a Hero Section (obtido dinamicamente do Supabase)
  const heroFeaturedProduct = useMemo(() => {
    if (products.length === 0) return null;
    return products.find(p => p.isFeatured) || products.find(p => p.isPromo) || products[0];
  }, [products]);

  // Produtos filtrados para a vitrine "Queridinhos"
  const favoriteProducts = useMemo(() => {
    let list = products.length > 0 ? products : [];
    
    // Filtro por categoria da aba
    if (favoritesFilter !== "all") {
      list = list.filter(p => {
        const slug = (p.categorySlug || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        if (favoritesFilter === "cestas") return slug.includes("cesta") || name.includes("cesta");
        if (favoritesFilter === "quadros") return slug.includes("quadro") || name.includes("quadro");
        if (favoritesFilter === "amor") return slug.includes("casal") || slug.includes("amor") || name.includes("casal");
        if (favoritesFilter === "combos") return slug.includes("combo") || name.includes("combo") || p.isPromo;
        return true;
      });
    }

    // Busca textual
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.shortDescription.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    return list.slice(0, 8);
  }, [products, favoritesFilter, searchQuery]);

  // Produtos para a seção de catálogo por categoria selecionada
  const catalogProducts = useMemo(() => {
    let list = [...products];

    if (activeCategorySlug !== "all") {
      list = list.filter(p => 
        p.categorySlug === activeCategorySlug || 
        p.categoryId === activeCategorySlug
      );
    }

    if (catalogSort === "low") {
      list.sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        const pB = parseFloat(b.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        return pA - pB;
      });
    } else if (catalogSort === "high") {
      list.sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        const pB = parseFloat(b.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        return pB - pA;
      });
    }

    return list;
  }, [products, activeCategorySlug, catalogSort]);

  // Rolar suavemente para elemento
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-[#0b2239] font-sans antialiased selection:bg-[#c6a16b] selection:text-white pb-20 sm:pb-0">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP ANNOUNCEMENT BAR                                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <aside className="bg-[#0b2239] text-[#e9d8ba] py-2 px-4 text-center text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase font-sans border-b border-[#c6a16b30]">
        São Paulo & Região · Presentes finos personalizados, feitos por encomenda
      </aside>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. HEADER SUBLIME / VISUAL STORY                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#fcfaf6f5] backdrop-blur-md border-b border-[#c6a16b40] px-4 sm:px-8 py-3.5 sm:py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Marca / Brand */}
          <Link to="/" className="flex items-center gap-3 text-decoration-none group">
            {/* Monograma Circular Exclusivo VS */}
            <div className="brand-seal-vs w-11 h-11 sm:w-12 sm:h-12 text-2xl group-hover:scale-105 transition-transform">
              <span>VS</span>
            </div>
            <div>
              <span className="block font-serif-sublime text-xl sm:text-2xl tracking-[0.14em] text-[#0b2239] leading-tight font-normal">
                VISUAL STORY
              </span>
              <small className="block text-[8px] sm:text-[9px] tracking-[0.28em] text-[#8e744e] uppercase font-sans font-medium -mt-0.5">
                Presentes Finos & Afeto
              </small>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-[12px] font-sans tracking-[0.05em] text-[#0b2239]">
            {/* Dropdown "Presente para" */}
            <div className="relative">
              <button 
                onClick={() => setIsGiftGuideOpen(!isGiftGuideOpen)}
                className="flex items-center gap-1.5 py-1.5 hover:text-[#8b693b] transition-colors cursor-pointer"
              >
                <span>Presente para</span>
                <span className="text-[#9c7b4b] text-[10px]">⌄</span>
              </button>

              {isGiftGuideOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-[460px] bg-[#fcfaf6] border border-[#c6a16b70] shadow-[0_20px_50px_rgba(11,34,57,0.15)] p-5 z-50 grid grid-cols-2 gap-5 rounded-[2px]"
                  onMouseLeave={() => setIsGiftGuideOpen(false)}
                >
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.18em] text-[#987440] font-sans font-semibold mb-2.5">
                      Ocasiões
                    </h4>
                    <ul className="space-y-1.5 text-[12px] text-[#283c49]">
                      <li>
                        <button onClick={() => { setActiveCategorySlug("all"); scrollTo("categorias"); setIsGiftGuideOpen(false); }} className="hover:text-[#916a32] text-left">
                          Aniversário
                        </button>
                      </li>
                      <li>
                        <button onClick={() => { setActiveCategorySlug("cesta-cafe-da-manha"); scrollTo("categorias"); setIsGiftGuideOpen(false); }} className="hover:text-[#916a32] text-left">
                          Café da Manhã & Carinho
                        </button>
                      </li>
                      <li>
                        <button onClick={() => { setActiveCategorySlug("quadros-casal"); scrollTo("categorias"); setIsGiftGuideOpen(false); }} className="hover:text-[#916a32] text-left">
                          Pedido de Namoro / Casamento
                        </button>
                      </li>
                      <li>
                        <button onClick={() => { setActiveCategorySlug("all"); scrollTo("categorias"); setIsGiftGuideOpen(false); }} className="hover:text-[#916a32] text-left">
                          Formatura & Conquistas
                        </button>
                      </li>
                      <li>
                        <button onClick={() => { setActiveCategorySlug("all"); scrollTo("categorias"); setIsGiftGuideOpen(false); }} className="hover:text-[#916a32] text-left">
                          Maternidade & Bebê
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.18em] text-[#987440] font-sans font-semibold mb-2.5">
                      Destinatários
                    </h4>
                    <ul className="space-y-1.5 text-[12px] text-[#283c49]">
                      <li>
                        <button onClick={() => { scrollTo("categorias"); setIsGiftGuideOpen(false); }} className="hover:text-[#916a32] text-left">
                          Meu Amor
                        </button>
                      </li>
                      <li>
                        <button onClick={() => { scrollTo("categorias"); setIsGiftGuideOpen(false); }} className="hover:text-[#916a32] text-left">
                          Mãe & Família
                        </button>
                      </li>
                      <li>
                        <button onClick={() => { scrollTo("categorias"); setIsGiftGuideOpen(false); }} className="hover:text-[#916a32] text-left">
                          Amigos & Colegas
                        </button>
                      </li>
                      <li>
                        <button onClick={() => { scrollTo("empresas"); setIsGiftGuideOpen(false); }} className="hover:text-[#916a32] text-left">
                          Equipe & Empresas
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => scrollTo("universos")} className="hover:text-[#8b693b] transition-colors cursor-pointer">
              Coleções
            </button>
            <button onClick={() => scrollTo("queridinhos")} className="hover:text-[#8b693b] transition-colors cursor-pointer">
              Os Presentes
            </button>
            <button onClick={() => scrollTo("empresas")} className="hover:text-[#8b693b] transition-colors cursor-pointer">
              Para Empresas
            </button>

            <a 
              href="https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20consultar%20meus%20pedidos%20na%20Visual%20Story."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6d757a] hover:text-[#0b2239] transition-colors"
            >
              Meus Pedidos
            </a>

            {/* Botão da Sacola / Carrinho */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="border border-[#c6a16b80] hover:border-[#0b2239] bg-transparent text-[#0b2239] px-4 py-2 rounded-[2px] flex items-center gap-2 transition-all hover:bg-[#0b2239] hover:text-[#fcfaf6] cursor-pointer"
            >
              <span>Sacola</span>
              <span className="w-5 h-5 rounded-full bg-[#0b2239] text-white text-[10px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </button>
          </nav>

          {/* Botão de Sacola Mobile Rápido */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#0b2239] hover:text-[#8b693b]"
              aria-label="Buscar presentes"
            >
              <Search size={20} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="border border-[#c6a16b80] text-[#0b2239] px-3 py-1.5 rounded-[2px] flex items-center gap-1.5 text-xs font-sans"
            >
              <span>Sacola</span>
              <span className="w-4 h-4 rounded-full bg-[#0b2239] text-white text-[9px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </button>
          </div>

        </div>

        {/* Campo de Busca Rápida Mobile */}
        {isSearchOpen && (
          <div className="mt-3 pt-3 border-t border-[#c6a16b30] md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Busque por cesta, flores, quadro ou chocolate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#c6a16b60] rounded-[2px] py-2 pl-9 pr-4 text-xs text-[#0b2239] focus:outline-none focus:border-[#0b2239]"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-[#8e744e]" />
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. BARRA UTILITÁRIA                                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#fffaf0] border-b border-[#ddd1b9] px-4 sm:px-8 py-2.5 text-xs text-[#263d33]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => scrollTo("categorias")}
            className="flex items-center gap-1.5 hover:text-[#8b693b] font-medium cursor-pointer"
          >
            <span>☰</span>
            <span>Menu de Coleções</span>
          </button>

          <button 
            onClick={() => scrollTo("universos")}
            className="hover:text-[#8b693b] font-medium cursor-pointer"
          >
            Presente para ⌄
          </button>

          <button 
            onClick={() => scrollTo("queridinhos")}
            className="flex items-center gap-1 hover:text-[#8b693b] font-medium cursor-pointer"
          >
            <span>Buscar</span>
            <span>⌕</span>
          </button>
        </div>
      </div>

      <main>
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 4. HERO SECTION SUBLIME                                            */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[580px] sm:min-h-[640px] bg-[#0b2239] text-[#fff3da] overflow-hidden flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Texto à Esquerda */}
            <div className="lg:col-span-7 px-6 sm:px-12 py-12 sm:py-20 z-10 relative">
              <span className="eyebrow-sublime text-[#e0c49c] mb-3 block">
                VISUAL STORY · EXCLUSIVO
              </span>

              <h1 className="font-serif-sublime text-4xl sm:text-5xl lg:text-[64px] font-normal tracking-[-0.03em] leading-[1.08] mb-6 text-[#fffdfa]">
                O extraordinário <br />
                começa em <br />
                <em className="text-[#e5c798] not-italic font-serif-sublime">um gesto.</em>
              </h1>

              <p className="text-sm sm:text-base text-[#dce0dd] max-w-md font-sans font-light leading-relaxed mb-8">
                Presentes personalizados que carregam carinho, afeto e significado. 
                Detalhes que contam a sua história e emocionam quem você ama.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => scrollTo("universos")}
                  className="btn-sublime-gold inline-flex items-center gap-3 cursor-pointer"
                >
                  <span>Descobrir as Coleções</span>
                  <span aria-hidden="true">↗</span>
                </button>

                <button 
                  onClick={() => scrollTo("categorias")}
                  className="text-xs text-[#ebd4a0] hover:text-white underline underline-offset-4 tracking-[0.05em] py-2 px-1 cursor-pointer"
                >
                  Encontre a sua ocasião ↓
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-[#c6a16b30] flex items-center gap-6 text-[11px] text-[#bdc4c5]">
                <span>✓ Feito por encomenda</span>
                <span>✓ Fotos & Nomes exclusivos</span>
                <span>✓ Entrega com todo o cuidado</span>
              </div>
            </div>

            {/* Vitrine / Foto à Direita */}
            <div className="lg:col-span-5 relative h-[380px] sm:h-[460px] lg:h-[580px] bg-gradient-to-tr from-[#071726] to-[#123025] flex items-center justify-center p-6 sm:p-10">
              
              {/* Selo Dourado Flutuante */}
              <div className="absolute right-6 top-6 sm:right-10 sm:top-10 z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#d8bd7b66] bg-[#16372b85] backdrop-blur-md flex flex-col items-center justify-center text-center p-2">
                <span className="text-[7.5px] uppercase tracking-[0.2em] text-[#ebd4a0]">FEITO PARA</span>
                <i className="font-serif-sublime italic text-lg sm:text-xl text-[#e5c798] leading-tight">emocionar</i>
              </div>

              {/* Fotografia Principal do Produto */}
              {heroFeaturedProduct?.image ? (
                <img 
                  src={heroFeaturedProduct.image} 
                  alt={heroFeaturedProduct.name}
                  className="w-full h-full max-h-[460px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-10"
                />
              ) : (
                <div className="w-64 h-64 rounded-full bg-[#173d30] border border-[#c6a16b40] flex items-center justify-center text-[#e5c798]">
                  <Gift size={64} strokeWidth={1} />
                </div>
              )}

              {/* Card de Preço Jateado Flutuante */}
              {heroFeaturedProduct && (
                <Link 
                  to={`/product/${heroFeaturedProduct.id}`}
                  className="absolute bottom-6 left-6 right-6 sm:left-10 sm:right-10 z-20 bg-[#fffdf9ea] backdrop-blur-md border border-[#c6a16b75] p-3.5 sm:p-4 rounded-[2px] text-[#0b2239] shadow-[0_15px_35px_rgba(11,34,57,0.2)] flex items-center justify-between hover:bg-white transition-all group"
                >
                  <div>
                    <span className="block font-serif-sublime text-[17px] sm:text-[19px] leading-tight group-hover:text-[#8b693b] transition-colors">
                      {heroFeaturedProduct.name}
                    </span>
                    <strong className="text-sm font-sans font-semibold text-[#0b2239]">
                      {heroFeaturedProduct.price}
                    </strong>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#8e744e] flex items-center gap-1">
                    <span>Personalizar</span>
                    <ArrowRight size={12} />
                  </span>
                </Link>
              )}
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 5. FAIXA DE PROMESSAS DE VALOR                                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-[#e8dec9] text-[#4f5746] py-5 px-4 border-b border-[#ddd1b9]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-4 text-xs font-sans">
            <div className="flex items-center gap-2">
              <b className="font-serif-sublime text-lg text-[#9b793c] font-normal">01</b>
              <span>Personalize o seu gesto com nomes, mensagens e fotos</span>
            </div>
            <div className="flex items-center gap-2">
              <b className="font-serif-sublime text-lg text-[#9b793c] font-normal">02</b>
              <span>Feito por encomenda com acabamento fino artesanal</span>
            </div>
            <div className="flex items-center gap-2">
              <b className="font-serif-sublime text-lg text-[#9b793c] font-normal">03</b>
              <span>Entrega rápida e programada para a sua data especial</span>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 6. SEÇÃO DE UNIVERSOS & COLEÇÕES                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="universos" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-10 border-b border-[#c6a16b35] pb-5">
            <div>
              <span className="eyebrow-sublime block mb-1">CADA MOMENTO, UM UNIVERSO</span>
              <h2 className="font-serif-sublime text-3xl sm:text-4xl text-[#0b2239]">
                Qual história <br className="hidden sm:inline" />
                <em className="text-[#8f6b3f] not-italic font-serif-sublime">vamos celebrar?</em>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6e776b] max-w-xs font-sans">
              Escolha a ocasião que deseja homenagear. Nós transformamos o carinho em um presente inesquecível.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Cestas */}
            <div 
              onClick={() => { setActiveCategorySlug("cesta-cafe-da-manha"); scrollTo("categorias"); }}
              className="group relative h-[360px] sm:h-[420px] rounded-[2px] overflow-hidden bg-[#213c30] cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img 
                src="/cestas/cestacoluna1_valor129,90.jpeg" 
                alt="Cestas de Café da Manhã"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b2239f5] via-[#0b223940] to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <small className="block text-[8.5px] uppercase tracking-[0.2em] text-[#e5c798] mb-1 font-sans">
                  O CARINHO DE ESTAR PERTO
                </small>
                <h3 className="font-serif-sublime text-2xl mb-2 text-[#fff3df]">
                  Cestas de Café
                </h3>
                <span className="inline-block text-[11px] font-sans border-b border-[#e0c79a66] pb-1 text-[#e5c798] group-hover:border-white group-hover:text-white transition-colors">
                  Explorar a coleção ↗
                </span>
              </div>
            </div>

            {/* Card 2: Gestos de Amor */}
            <div 
              onClick={() => { setActiveCategorySlug("quadros-casal"); scrollTo("categorias"); }}
              className="group relative h-[360px] sm:h-[420px] rounded-[2px] overflow-hidden bg-[#371922] cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img 
                src="/quadros_a4/quadro_casal_1_valor69,90.jpeg" 
                alt="Gestos de Amor e Casal"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#32151ef5] via-[#32151e40] to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <small className="block text-[8.5px] uppercase tracking-[0.2em] text-[#e5c798] mb-1 font-sans">
                  AMOR QUE VIRA SURPRESA
                </small>
                <h3 className="font-serif-sublime text-2xl mb-2 text-[#fff3df]">
                  Gestos de Amor
                </h3>
                <span className="inline-block text-[11px] font-sans border-b border-[#e0c79a66] pb-1 text-[#e5c798] group-hover:border-white group-hover:text-white transition-colors">
                  Encontrar o presente ↗
                </span>
              </div>
            </div>

            {/* Card 3: Aniversários */}
            <div 
              onClick={() => { setActiveCategorySlug("cesta-aniversario"); scrollTo("categorias"); }}
              className="group relative h-[360px] sm:h-[420px] rounded-[2px] overflow-hidden bg-[#243f30] cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img 
                src="/cestas/cesta2_valor119,99.jpeg" 
                alt="Presentes de Aniversário"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#132b20f5] via-[#132b2040] to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <small className="block text-[8.5px] uppercase tracking-[0.2em] text-[#e5c798] mb-1 font-sans">
                  O DIA DE QUEM VOCÊ AMA
                </small>
                <h3 className="font-serif-sublime text-2xl mb-2 text-[#fff3df]">
                  Aniversários
                </h3>
                <span className="inline-block text-[11px] font-sans border-b border-[#e0c79a66] pb-1 text-[#e5c798] group-hover:border-white group-hover:text-white transition-colors">
                  Ver presentes ↗
                </span>
              </div>
            </div>

            {/* Card 4: Para Empresas */}
            <div 
              onClick={() => scrollTo("empresas")}
              className="group relative h-[360px] sm:h-[420px] rounded-[2px] overflow-hidden bg-[#142a3b] cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img 
                src="/mamaes_bebes/caixa2bebe_valor34,90.jpeg" 
                alt="Presentes Corporativos"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b2239f5] via-[#0b223940] to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <small className="block text-[8.5px] uppercase tracking-[0.2em] text-[#e5c798] mb-1 font-sans">
                  SUA MARCA, SEU CUIDADO
                </small>
                <h3 className="font-serif-sublime text-2xl mb-2 text-[#fff3df]">
                  Para Empresas
                </h3>
                <span className="inline-block text-[11px] font-sans border-b border-[#e0c79a66] pb-1 text-[#e5c798] group-hover:border-white group-hover:text-white transition-colors">
                  Fazer um orçamento ↗
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 7. ATALHOS RÁPIDOS DE OCASIÕES (hp-occasions)                       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-[#eee5d5] py-8 px-4 sm:px-8 border-y border-[#d2c3a5]">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow-sublime block mb-3 text-[#9b793c]">PRESENTE PARA…</span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <button 
                onClick={() => { setActiveCategorySlug("quadros-casal"); scrollTo("categorias"); }}
                className="flex items-center justify-between gap-4 font-serif-sublime text-lg sm:text-xl text-[#0b2239] border-b border-[#bd9e72] pb-1 hover:text-[#907043] transition-colors cursor-pointer"
              >
                <span>Meu amor</span>
                <span className="text-[#907043]">↗</span>
              </button>

              <button 
                onClick={() => { setActiveCategorySlug("cesta-aniversario"); scrollTo("categorias"); }}
                className="flex items-center justify-between gap-4 font-serif-sublime text-lg sm:text-xl text-[#0b2239] border-b border-[#bd9e72] pb-1 hover:text-[#907043] transition-colors cursor-pointer"
              >
                <span>Um aniversário</span>
                <span className="text-[#907043]">↗</span>
              </button>

              <button 
                onClick={() => { setActiveCategorySlug("cesta-cafe-da-manha"); scrollTo("categorias"); }}
                className="flex items-center justify-between gap-4 font-serif-sublime text-lg sm:text-xl text-[#0b2239] border-b border-[#bd9e72] pb-1 hover:text-[#907043] transition-colors cursor-pointer"
              >
                <span>Uma conquista</span>
                <span className="text-[#907043]">↗</span>
              </button>

              <button 
                onClick={() => scrollTo("empresas")}
                className="flex items-center justify-between gap-4 font-serif-sublime text-lg sm:text-xl text-[#0b2239] border-b border-[#bd9e72] pb-1 hover:text-[#907043] transition-colors cursor-pointer"
              >
                <span>Minha equipe & empresas</span>
                <span className="text-[#907043]">↗</span>
              </button>

              <button 
                onClick={() => { setActiveCategorySlug("all"); scrollTo("categorias"); }}
                className="flex items-center justify-between gap-4 font-serif-sublime text-lg sm:text-xl text-[#0b2239] border-b border-[#bd9e72] pb-1 hover:text-[#907043] transition-colors cursor-pointer"
              >
                <span>Surpreender sem data</span>
                <span className="text-[#907043]">↗</span>
              </button>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 8. QUERIDINHOS VISUAL STORY (VITRINE DESTACADA)                    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="queridinhos" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow-sublime block mb-1">A SELEÇÃO DA NOSSA MARCA</span>
              <h2 className="font-serif-sublime text-3xl sm:text-4xl text-[#0b2239]">
                Queridinhos <br className="hidden sm:inline" />
                <em className="text-[#8f6b3f] not-italic font-serif-sublime">Visual Story.</em>
              </h2>
            </div>
            <button 
              onClick={() => scrollTo("categorias")}
              className="text-xs text-[#8f6b3f] border-b border-[#b69566] pb-1 hover:text-[#0b2239] transition-colors cursor-pointer"
            >
              Ver todos os presentes ↗
            </button>
          </div>

          {/* Abas e Ferramentas da Seleção */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#c6a16b35] pb-4 mb-8">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto scrollbar-hide py-1">
              {[
                { id: "all", label: "Todos" },
                { id: "cestas", label: "Cestas" },
                { id: "quadros", label: "Quadros" },
                { id: "amor", label: "Românticos" },
                { id: "combos", label: "Combos" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFavoritesFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-sans tracking-[0.03em] whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    favoritesFilter === tab.id
                      ? "border-[#8f6b3f] text-[#0b2239] font-semibold"
                      : "border-transparent text-[#6d757a] hover:text-[#0b2239]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64 relative">
              <input
                type="search"
                placeholder="Buscar na seleção..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#c6a16b60] rounded-[2px] py-2 pl-3 pr-8 text-xs text-[#0b2239] focus:outline-none focus:border-[#0b2239]"
              />
              <Search size={14} className="absolute right-2.5 top-2.5 text-[#8e744e]" />
            </div>
          </div>

          <p className="text-[11px] text-[#7c7f72] mb-6">
            {favoriteProducts.length} presentes selecionados com carinho
          </p>

          {/* Grid dos Queridinhos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {favoriteProducts.map((product) => (
              <SublimeProductCard key={product.id} product={product} />
            ))}
          </div>

          {favoriteProducts.length === 0 && (
            <div className="text-center py-16 bg-[#fffdfa] border border-[#e5ded4] p-8">
              <Gift size={40} className="mx-auto text-[#c6a16b] mb-3 opacity-60" />
              <p className="font-serif-sublime text-lg text-[#0b2239] mb-1">
                Nenhum presente encontrado nesta seleção
              </p>
              <p className="text-xs text-[#6e776b] mb-4">
                Tente buscar por outro termo ou explore as outras categorias abaixo.
              </p>
              <button
                onClick={() => { setFavoritesFilter("all"); setSearchQuery(""); }}
                className="btn-sublime-primary text-xs"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 9. CATÁLOGO COMPLETO POR CATEGORIAS (SUPABASE)                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="categorias" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-20 border-t border-[#c6a16b30]">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="eyebrow-sublime block mb-2">CATÁLOGO COMPLETO</span>
            <h2 className="font-serif-sublime text-3xl sm:text-4xl text-[#0b2239] mb-3">
              Cada ocasião, um gesto especial.
            </h2>
            <p className="text-xs sm:text-sm text-[#626870] font-sans">
              Navegue por todas as categorias do nosso catálogo artesanal. Escolha os detalhes que nós cuidamos do carinho.
            </p>
          </div>

          {/* Abas de Categorias Reais do Supabase */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 mb-8">
            <button
              onClick={() => setActiveCategorySlug("all")}
              className={`px-4 py-2 rounded-full text-xs font-sans whitespace-nowrap transition-all border cursor-pointer ${
                activeCategorySlug === "all"
                  ? "bg-[#0b2239] text-[#fcfaf6] border-[#0b2239]"
                  : "bg-white text-[#0b2239] border-[#c6a16b60] hover:border-[#0b2239]"
              }`}
            >
              Todas as Coleções ({products.length})
            </button>

            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-sans whitespace-nowrap transition-all border cursor-pointer ${
                  activeCategorySlug === cat.slug
                    ? "bg-[#0b2239] text-[#fcfaf6] border-[#0b2239]"
                    : "bg-white text-[#0b2239] border-[#c6a16b60] hover:border-[#0b2239]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Ferramentas de Ordenação */}
          <div className="flex items-center justify-between border-b border-[#c6a16b35] pb-3 mb-8 text-xs">
            <span className="text-[#626870]">
              Exibindo <strong>{catalogProducts.length}</strong> presentes
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-[#626870]">Ordenar por:</label>
              <select
                id="sort-select"
                value={catalogSort}
                onChange={(e) => setCatalogSort(e.target.value as any)}
                className="bg-white border border-[#c6a16b60] text-[#0b2239] px-2 py-1 rounded-[2px] text-xs focus:outline-none"
              >
                <option value="featured">Seleção da Marca</option>
                <option value="low">Menor preço</option>
                <option value="high">Maior preço</option>
              </select>
            </div>
          </div>

          {/* Renderização dos Produtos do Catálogo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {catalogProducts.map((product) => (
              <SublimeProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 10. SEÇÃO EDITORIAL / VALORES                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-[#ece5d9] py-16 sm:py-24 px-6 sm:px-12">
          <div className="max-w-5xl mx-auto text-center">
            <span className="eyebrow-sublime block mb-2">O CUIDADO ESTÁ NOS DETALHES</span>
            <h2 className="font-serif-sublime text-3xl sm:text-5xl text-[#0b2239] mb-12">
              Feito para chegar <br />
              <em className="text-[#8f6b3f] not-italic font-serif-sublime">ao coração.</em>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-[#fffdf9a0] p-6 rounded-[2px] border border-[#d8ccba]">
                <strong className="block font-serif-sublime text-xl text-[#0b2239] mb-2">
                  Seu toque pessoal
                </strong>
                <p className="text-xs sm:text-sm text-[#526458] font-sans leading-relaxed">
                  Nomes, mensagens comoventes e fotos que eternizam lembranças. Cada produto é customizado individualmente para vocês.
                </p>
              </div>

              <div className="bg-[#fffdf9a0] p-6 rounded-[2px] border border-[#d8ccba]">
                <strong className="block font-serif-sublime text-xl text-[#0b2239] mb-2">
                  Uma escolha cuidadosa
                </strong>
                <p className="text-xs sm:text-sm text-[#526458] font-sans leading-relaxed">
                  Chocolates finos, caixas artesanais de alta gramatura, laços de cetim e acabamento de alto padrão de boutique.
                </p>
              </div>

              <div className="bg-[#fffdf9a0] p-6 rounded-[2px] border border-[#d8ccba]">
                <strong className="block font-serif-sublime text-xl text-[#0b2239] mb-2">
                  O presente certo
                </strong>
                <p className="text-xs sm:text-sm text-[#526458] font-sans leading-relaxed">
                  Um mesmo carinho pode celebrar um aniversário, um pedido de namoro ou a vitória de quem conquistou um grande sonho.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 11. SEÇÃO CORPORATIVA                                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="empresas" className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="eyebrow-sublime block mb-2">PRESENTES CORPORATIVOS</span>
              <h2 className="font-serif-sublime text-3xl sm:text-4xl text-[#0b2239] mb-4">
                Reconhecer também <br />
                é presentear.
              </h2>
              <p className="text-sm text-[#53655b] font-sans leading-relaxed mb-4">
                Para clientes especiais, equipes dedicadas e parceiros comerciais: composições que carregam o carinho e o valor da sua marca.
              </p>
              <p className="text-xs text-[#6e776b] font-sans leading-relaxed mb-6">
                Montamos propostas sob medida com a identidade visual da sua empresa, cartões com mensagens institucionais e entregas programadas.
              </p>
              
              <a
                href="https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20presentes%20corporativos%20da%20Visual%20Story."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sublime-primary inline-flex items-center gap-3"
              >
                <span>Monte seu orçamento via WhatsApp</span>
                <span>↗</span>
              </a>
            </div>

            <div className="bg-[#eee6d8] p-4 sm:p-6 rounded-[2px] border border-[#dcd5c8]">
              <div className="bg-[#fffdf8] p-6 rounded-[2px] border border-[#cfcabf] text-center">
                <span className="font-serif-sublime text-2xl text-[#0b2239] block mb-2">
                  Atendimento Corporativo VIP
                </span>
                <p className="text-xs text-[#526458] mb-6">
                  Atendemos pedidos em lote com descontos progressivos e personalização corporativa completa.
                </p>
                <div className="grid grid-cols-2 gap-3 text-left text-xs text-[#0b2239]">
                  <div className="border border-[#c6a16b40] p-3 bg-[#faf8f2]">
                    <strong>Kits comemorativos</strong>
                    <p className="text-[10px] text-[#6e776b]">Aniversariantes do mês & metas</p>
                  </div>
                  <div className="border border-[#c6a16b40] p-3 bg-[#faf8f2]">
                    <strong>Fim de ano & Brindes</strong>
                    <p className="text-[10px] text-[#6e776b]">Agradecimento a clientes VIP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 12. PASSO A PASSO DA ENCOMENDA                                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-[#fcfaf6] border-t border-[#c6a16b35] py-16 sm:py-24 px-6 sm:px-12">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow-sublime block mb-2">COMO FUNCIONA</span>
            <h2 className="font-serif-sublime text-3xl sm:text-4xl text-[#0b2239] mb-12">
              Escolha. Personalize. Celebre.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-t border-[#c6a16b60] pt-6">
                <span className="font-serif-sublime text-3xl sm:text-4xl text-[#c6a16b] block mb-3">01</span>
                <h3 className="font-serif-sublime text-xl text-[#0b2239] mb-2">Encontre seu presente</h3>
                <p className="text-xs sm:text-sm text-[#5b656b] font-sans leading-relaxed">
                  Navegue pelas coleções e descubra a cesta, caixa ou quadro que melhor representa seu afeto.
                </p>
              </div>

              <div className="border-t border-[#c6a16b60] pt-6">
                <span className="font-serif-sublime text-3xl sm:text-4xl text-[#c6a16b] block mb-3">02</span>
                <h3 className="font-serif-sublime text-xl text-[#0b2239] mb-2">Conte sua ideia</h3>
                <p className="text-xs sm:text-sm text-[#5b656b] font-sans leading-relaxed">
                  Envie sua foto, escolha as frases e personalize cada detalhe. Nós enviamos a prévia antes de produzir.
                </p>
              </div>

              <div className="border-t border-[#c6a16b60] pt-6">
                <span className="font-serif-sublime text-3xl sm:text-4xl text-[#c6a16b] block mb-3">03</span>
                <h3 className="font-serif-sublime text-xl text-[#0b2239] mb-2">Prepare a entrega</h3>
                <p className="text-xs sm:text-sm text-[#5b656b] font-sans leading-relaxed">
                  Todos os presentes são feitos sob encomenda com entrega ágil ou agendada para a sua data especial.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 13. RODAPÉ DE ALTA JOALHERIA & BOUTIQUE                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0b2239] text-[#e2dfd6] py-14 px-6 sm:px-12 border-t border-[#c6a16b50]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="brand-seal-vs w-11 h-11 text-xl text-[#e5c798]">
                <span>VS</span>
              </div>
              <div>
                <span className="block font-serif-sublime text-2xl tracking-[0.14em] text-[#fffdfa]">
                  VISUAL STORY
                </span>
                <small className="block text-[8px] tracking-[0.28em] text-[#c6a16b] uppercase">
                  Presentes Finos & Afeto
                </small>
              </div>
            </div>
            <p className="text-xs text-[#a0a8ad] font-sans leading-relaxed max-w-sm mb-4">
              Transformando sentimentos, momentos especiais e lembranças inesquecíveis em presentes artesanais que tocam a alma.
            </p>
            <p className="text-[11px] text-[#c6a16b]">
              O extraordinário está nos detalhes.
            </p>
          </div>

          <div className="md:col-span-4 text-xs font-sans space-y-2">
            <h4 className="font-serif-sublime text-base text-[#e5c798] mb-3">Atendimento & Pedidos</h4>
            <p className="text-[#a0a8ad]">
              Para dúvidas, encomendas personalizadas ou orçamentos corporativos:
            </p>
            <div className="pt-2 space-y-1.5">
              <a 
                href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#e5c798] hover:underline"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp: (83) 99303-2780</span>
              </a>
              <a 
                href="https://instagram.com/virtualstore_3" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#e5c798] hover:underline"
              >
                <Instagram size={15} />
                <span>Instagram: @virtualstore_3</span>
              </a>
            </div>
          </div>

          <div className="md:col-span-3 text-xs font-sans space-y-2">
            <h4 className="font-serif-sublime text-base text-[#e5c798] mb-3">Links Úteis</h4>
            <ul className="space-y-1.5 text-[#a0a8ad]">
              <li><button onClick={() => scrollTo("universos")} className="hover:text-white cursor-pointer">Coleções</button></li>
              <li><button onClick={() => scrollTo("categorias")} className="hover:text-white cursor-pointer">Catálogo Geral</button></li>
              <li><button onClick={() => scrollTo("empresas")} className="hover:text-white cursor-pointer">Para Empresas</button></li>
              <li><Link to="/admin" className="hover:text-white">Painel do Administrador</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#c6a16b25] text-center text-[10px] text-[#788289] font-sans flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Visual Story. Todos os direitos reservados.</span>
          <span>Feito por encomenda · Entregas pontuais e com embalagem especial.</span>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 14. BARRA DE NAVEGAÇÃO MOBILE FIXA INFERIOR                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#fffdf9f7] backdrop-blur-md border-t border-[#c6a16b60] py-2 px-3 shadow-[0_-4px_22px_rgba(11,34,57,0.08)] sm:hidden grid grid-cols-5 gap-1">
        <button
          onClick={() => scrollTo("top")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-[#0b2239] py-1 cursor-pointer"
        >
          <span className="font-serif-sublime text-base font-bold">VS</span>
          <span>Início</span>
        </button>

        <button
          onClick={() => scrollTo("universos")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-[#566672] py-1 cursor-pointer hover:text-[#0b2239]"
        >
          <Gift size={18} strokeWidth={1.5} />
          <span>Coleções</span>
        </button>

        <button
          onClick={() => scrollTo("categorias")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-[#566672] py-1 cursor-pointer hover:text-[#0b2239]"
        >
          <Search size={18} strokeWidth={1.5} />
          <span>Buscar</span>
        </button>

        <a
          href="https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20atendimento%20para%20presentes%20da%20Visual%20Story."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-[#566672] py-1 hover:text-[#0b2239]"
        >
          <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
          <span>Contato</span>
        </a>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-[#0b2239] py-1 relative cursor-pointer"
        >
          <ShoppingBag size={18} strokeWidth={1.5} />
          <span>Sacola</span>
          {totalItems > 0 && (
            <span className="absolute top-0.5 right-3 w-4 h-4 rounded-full bg-[#0b2239] text-white text-[9px] flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
