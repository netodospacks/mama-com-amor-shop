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
  Menu as MenuIcon,
  MapPin,
  MessageCircle,
  SlidersHorizontal,
  Star,
  ArrowUpRight
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { VSBrandMark } from "@/components/VSBrandMark";
import { SnowEffect, SnowToggleBadge } from "@/components/SnowEffect";
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
// Card de Produto Oficial — Virtual Store (Boutique de Afeto)
// ─────────────────────────────────────────────────────────────────────────────
const VirtualStoreProductCard = ({ 
  product, 
  badge = "Exclusivo",
  buttonText = "Personalizar"
}: { 
  product: Product; 
  badge?: string;
  buttonText?: string;
}) => {
  return (
    <article className="group bg-white rounded-2xl border border-[#EADFCF] p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg shadow-sm">
      <Link 
        to={`/product/${product.id}`}
        className="block relative overflow-hidden bg-[#FAF7F2] aspect-[4/5] rounded-xl"
      >
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover p-1.5 transition-transform duration-700 ease-out group-hover:scale-105 select-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <Gift size={32} strokeWidth={1.5} />
          </div>
        )}

        {/* Badges Oficiais da Loja */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isPromo && (
            <span className="bg-[#8B233C] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-[0.14em] shadow-sm">
              Promoção
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#173D32] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-[0.14em] shadow-sm">
              Novidade
            </span>
          )}
          {!product.isPromo && !product.isNew && product.isFeatured && (
            <span className="bg-[#D6BC85] text-[#2D0A14] font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded uppercase tracking-[0.14em] shadow-sm">
              Destaque
            </span>
          )}
        </div>
      </Link>

      <div className="pt-3 pb-1 flex flex-col flex-grow text-neutral-900">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-sans font-bold text-xs sm:text-[13px] text-neutral-900 line-clamp-1 leading-snug mb-1 group-hover:text-[#8B233C] transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed mb-2 font-sans font-normal">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-1.5 mb-2.5">
            {product.isPromo && product.promoPrice ? (
              <>
                <span className="text-[11px] sm:text-xs text-neutral-400 line-through font-sans">
                  {product.price}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-[#8B233C] tracking-tight">
                  {product.promoPrice}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-[#8B233C] tracking-tight">
                {product.price}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.id}`}
            className="w-full inline-flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#8B233C] hover:bg-[#A32A47] text-white text-[11px] font-sans font-bold tracking-wide transition-all shadow-sm group/btn active:scale-[0.98]"
          >
            <span>{buttonText}</span>
            <ArrowRight size={13} className="text-white transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: Index (VIRTUAL STORE)
// ─────────────────────────────────────────────────────────────────────────────
export default function Index() {
  const { totalItems, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Filtros interativos da vitrine "Queridinhos"
  const [favoritesFilter, setFavoritesFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Categoria ativa do Catálogo Completo
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");

  // Ordenação do catálogo
  const [catalogSort, setCatalogSort] = useState<"featured" | "low" | "high">("featured");

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

  // Produto em destaque para o Hero
  const heroFeaturedProduct = useMemo(() => {
    if (products.length === 0) return null;
    return products.find(p => p.isFeatured) || products.find(p => p.isPromo) || products[0];
  }, [products]);

  // Produtos filtrados para a vitrine "Queridinhos"
  const favoriteProducts = useMemo(() => {
    let list = products.length > 0 ? products : [];

    if (favoritesFilter === "cestas") {
      list = list.filter(p => p.categorySlug?.includes("cesta") || p.name.toLowerCase().includes("cesta"));
    } else if (favoritesFilter === "quadros") {
      list = list.filter(p => p.categorySlug?.includes("quadro") || p.name.toLowerCase().includes("quadro"));
    } else if (favoritesFilter === "amor") {
      list = list.filter(p => p.categorySlug?.includes("casal") || p.categorySlug?.includes("kit") || p.name.toLowerCase().includes("amor"));
    } else if (favoritesFilter === "combos") {
      list = list.filter(p => p.categorySlug?.includes("combo") || p.isPromo);
    } else {
      list = list.filter(p => p.isFeatured || p.isPromo || p.isNew);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    return list.slice(0, 8);
  }, [products, favoritesFilter, searchQuery]);

  // Produtos filtrados para o Catálogo Geral
  const catalogProducts = useMemo(() => {
    let list = [...products];

    if (activeCategorySlug !== "all") {
      list = list.filter(p => {
        if (p.categorySlug === activeCategorySlug) return true;
        const cat = categoriesList.find(c => c.slug === activeCategorySlug);
        if (cat && p.categoryId === cat.id) return true;
        return false;
      });
    }

    if (catalogSort === "low") {
      list.sort((a, b) => {
        const pA = parseFloat(a.price.replace("R$", "").replace(".", "").replace(",", ".").trim()) || 0;
        const pB = parseFloat(b.price.replace("R$", "").replace(".", "").replace(",", ".").trim()) || 0;
        return pA - pB;
      });
    } else if (catalogSort === "high") {
      list.sort((a, b) => {
        const pA = parseFloat(a.price.replace("R$", "").replace(".", "").replace(",", ".").trim()) || 0;
        const pB = parseFloat(b.price.replace("R$", "").replace(".", "").replace(",", ".").trim()) || 0;
        return pB - pA;
      });
    }

    return list;
  }, [products, activeCategorySlug, catalogSort, categoriesList]);

  // Função para rolagem suave
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-[#1F1A17] font-sans selection:bg-[#8B233C] selection:text-white">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HEADER (ÁREA EXCLUSIVA DE CABEÇALHO & APRESENTAÇÃO INICIAL)      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="relative bg-[#FBF7EE] select-none">
        
        {/* 1.1 Ticker Slim no Topo (Cor de Natal: Vinho Nobre Escuro) */}
        <div 
          role="region"
          aria-label="Aviso institucional"
          className="relative z-30 bg-[#1F060E] border-b border-[#D6BC85]/30 py-1.5 sm:py-2 overflow-hidden w-full shadow-inner"
        >
          <div className="animate-ticker-marquee flex items-center whitespace-nowrap">
            {/* Lote 1 */}
            <div className="flex items-center gap-6 sm:gap-8 px-4 text-[9.5px] sm:text-[10px] tracking-[0.18em] uppercase font-semibold text-[#FBF7EE]">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#D6BC85] shrink-0 animate-pulse" />
                <span>Presentes Personalizados com Afeto</span>
              </span>
              <span className="text-[#D6BC85]/60">•</span>
              <span>Entregas em <strong className="font-bold text-[#D6BC85]">Santa Rita, João Pessoa e Região</strong></span>
              <span className="text-[#D6BC85]/60">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#D6BC85] shrink-0" />
                <span>Presentes Personalizados com Afeto</span>
              </span>
              <span className="text-[#D6BC85]/60">•</span>
              <span>Entregas em <strong className="font-bold text-[#D6BC85]">Santa Rita, João Pessoa e Região</strong></span>
              <span className="text-[#D6BC85]/60">•</span>
            </div>

            {/* Lote 2 */}
            <div className="flex items-center gap-6 sm:gap-8 px-4 text-[9.5px] sm:text-[10px] tracking-[0.18em] uppercase font-semibold text-[#FBF7EE]" aria-hidden="true">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#D6BC85] shrink-0 animate-pulse" />
                <span>Presentes Personalizados com Afeto</span>
              </span>
              <span className="text-[#D6BC85]/60">•</span>
              <span>Entregas em <strong className="font-bold text-[#D6BC85]">Santa Rita, João Pessoa e Região</strong></span>
              <span className="text-[#D6BC85]/60">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#D6BC85] shrink-0" />
                <span>Presentes Personalizados com Afeto</span>
              </span>
              <span className="text-[#D6BC85]/60">•</span>
              <span>Entregas em <strong className="font-bold text-[#D6BC85]">Santa Rita, João Pessoa e Região</strong></span>
              <span className="text-[#D6BC85]/60">•</span>
            </div>
          </div>
        </div>

        {/* 1.2 Barra de Navegação (Fundo Bege Claro com Detalhes Delicados) */}
        <nav className="relative z-30 bg-[#FBF7EE]/95 backdrop-blur-md border-b border-[#EADFCF] px-4 sm:px-8 py-3 sm:py-3.5 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Esquerda: Hambúrguer para Menu Lateral */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir Menu de Coleções"
                className="p-2 -ml-2 text-neutral-800 hover:text-[#8B233C] hover:bg-[#F2ECE1] rounded-lg transition-colors focus:outline-none"
              >
                <MenuIcon size={22} strokeWidth={1.75} />
              </button>
              
              <button 
                onClick={() => scrollTo("universos")}
                className="hidden lg:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:text-[#8B233C] transition-colors"
              >
                <span>Coleções</span>
                <span className="text-[10px]">⌄</span>
              </button>
            </div>

            {/* Centro: Logomarca Oficial Virtual Store */}
            <Link to="/" onClick={() => scrollTo("top")} className="shrink min-w-0 flex items-center justify-center">
              <div className="sm:hidden">
                <VSBrandMark size="sm" variant="horizontal" colorTheme="dark" subtitle="PRESENTES PERSONALIZADOS" />
              </div>
              <div className="hidden sm:block">
                <VSBrandMark size="md" variant="horizontal" colorTheme="dark" subtitle="PRESENTES PERSONALIZADOS" />
              </div>
            </Link>

            {/* Direita: Ações e Botão da Sacola */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a
                href="https://instagram.com/virtualstore_3"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @virtualstore_3"
                className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl border border-[#EADFCF] bg-[#FBF7EE] text-neutral-800 hover:text-[#8B233C] hover:bg-[#F2ECE1] transition-all shadow-2xs shrink-0 focus:outline-none"
              >
                <Instagram size={19} strokeWidth={1.8} />
              </a>

              <a
                href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Atendimento pelo WhatsApp"
                className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-[#F2ECE1] hover:bg-[#EADFCF] text-neutral-800 hover:text-[#8B233C] border border-[#EADFCF] transition-all text-xs font-semibold tracking-wide uppercase focus:outline-none shrink-0"
              >
                <WhatsAppIcon size={14} className="shrink-0" />
                <span>(83) 99303-2780</span>
              </a>

              {/* Botão da Sacola com Badge */}
              <button 
                onClick={() => setIsCartOpen(true)}
                aria-label="Abrir Sacola de Compras"
                className="relative h-9 sm:h-10 px-2.5 sm:px-3 text-neutral-800 bg-[#FBF7EE] hover:bg-[#F2ECE1] rounded-xl border border-[#EADFCF] transition-all focus:outline-none flex items-center gap-1.5 shadow-2xs shrink-0"
              >
                <ShoppingBag size={19} strokeWidth={1.8} />
                <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">Sacola</span>
                {totalItems > 0 && (
                  <span className="bg-[#8B233C] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

          </div>
        </nav>
      </header>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FECHAMENTO DO HEADER — NAVEGAÇÃO INDEPENDENTE                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. HERO NATALINO — SEÇÃO INDEPENDENTE (INSPIRAÇÃO REFERÊNCIA SUBLIME) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section 
        id="hero-natal" 
        aria-label="Apresentação da Coleção de Natal"
        className="relative overflow-hidden bg-[#0a180f] min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center select-none"
      >
        
        {/* FOTOGRAFIA NATALINA DE FUNDO — CLARA, ILUMINADA E EXPOSTA */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="/hero-natal.png" 
            alt="Coleção de Natal Virtual Store - Árvore Iluminada e Presentes Finos" 
            className="w-full h-full object-cover object-[76%_center] sm:object-[80%_center] lg:object-[86%_center] select-none"
            loading="eager"
          />
          
          {/* Gradiente Localizado Somente Atrás do Texto (Transição Suave — A árvore, luzes e presentes na direita mantêm sua iluminação pura) */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[75%] lg:w-[58%] bg-gradient-to-r from-black/75 via-black/30 via-55% to-transparent pointer-events-none" />

          {/* Vinheta ultra sutil na base do hero para transição orgânica */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Animação de Neve Restrita ao Hero */}
        <SnowEffect />

        {/* Botão de Controle de Neve Discreto no Canto Superior Direito (Restrito ao Hero, não acompanha rolagem) */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-8 z-20">
          <SnowToggleBadge />
        </div>

        {/* Conteúdo Principal do Hero Natalino */}
        <div className="relative z-20 max-w-7xl mx-auto w-full py-16 sm:py-24 px-4 sm:px-8">
          <div className="max-w-xl lg:max-w-2xl flex flex-col items-start text-left space-y-3.5 sm:space-y-5">
            
            {/* 1. Estrela Elegante + COLEÇÃO DE NATAL 2026 */}
            <div className="inline-flex items-center gap-2 text-[#dfc285]">
              <Star size={16} strokeWidth={1.5} className="text-[#dfc285] fill-none shrink-0" />
              <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.24em] uppercase text-[#dfc285] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                COLEÇÃO DE NATAL 2026
              </span>
            </div>

            {/* 2. Título Principal em Tipografia Editorial de Alto Padrão (Fiel à Referência) */}
            <h1 className="font-serif select-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)]">
              <span className="block text-[42px] min-[390px]:text-[48px] sm:text-[60px] md:text-[68px] lg:text-[78px] font-normal text-white tracking-tight leading-[0.95]">
                Um Natal
              </span>
              <span className="block text-[42px] min-[390px]:text-[48px] sm:text-[60px] md:text-[68px] lg:text-[78px] font-normal italic text-[#dfc285] tracking-tight leading-[0.95] mt-1 sm:mt-2">
                feito com amor.
              </span>
            </h1>

            {/* 3. Subtítulo Exato Preservado */}
            <p className="text-[13px] min-[390px]:text-[14px] sm:text-base md:text-lg text-white/90 max-w-[280px] min-[390px]:max-w-[340px] sm:max-w-md font-light leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
              Transformamos sentimentos em presentes inesquecíveis.
            </p>

            {/* 4. Botão de Conversão em Vinho Aveludado (Inspirado na Referência) + WhatsApp */}
            <div className="flex flex-col sm:flex-row items-start justify-start gap-2.5 sm:gap-3 pt-2 w-full sm:w-auto">
              <button 
                onClick={() => scrollTo("destaque-natal")}
                className="self-start px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#6f1e31] hover:bg-[#83243a] border border-[#99344c]/70 text-white text-xs font-semibold tracking-[0.14em] uppercase flex items-center justify-start gap-2.5 transition-all shadow-[0_8px_24px_rgba(111,30,49,0.45)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Escolher meu presente</span>
                <span className="w-5 h-5 rounded bg-white/15 flex items-center justify-center shrink-0">
                  <ArrowUpRight size={14} className="text-white" />
                </span>
              </button>

              <a
                href="https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20encomendar%20um%20presente%20da%20Cole%C3%A7%C3%A3o%20de%20Natal%20na%20Virtual%20Store."
                target="_blank"
                rel="noopener noreferrer"
                className="self-start px-5 py-3 sm:py-4 rounded-xl bg-emerald-900/80 hover:bg-[#25D366] border border-emerald-500/40 hover:border-[#25D366] text-white text-xs font-semibold tracking-[0.12em] uppercase inline-flex items-center justify-start gap-2 backdrop-blur-sm transition-all shadow-sm active:scale-[0.98]"
              >
                <WhatsAppIcon size={15} className="text-white shrink-0" />
                <span>Pedir no WhatsApp</span>
              </a>
            </div>

            {/* 5. Linha Institucional e Região de Entrega */}
            <div className="pt-2 text-[11px] sm:text-xs text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] flex items-center justify-start gap-1.5 font-light">
              <MapPin size={13} className="text-[#dfc285] shrink-0" />
              <span>Presentes personalizados por Larissa Gouveia • Santa Rita, João Pessoa e Região</span>
            </div>

          </div>
        </div>

      </section>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FECHAMENTO DO HEADER                                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MENU LATERAL DRAWER                                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
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
              className="fixed top-0 left-0 h-full w-80 bg-white text-neutral-900 z-[210] shadow-2xl flex flex-col border-r border-neutral-200"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
                <VSBrandMark size="sm" variant="horizontal" colorTheme="dark" subtitle="Catálogo Oficial" />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                <button
                  onClick={() => scrollTo("destaque-natal")}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 hover:text-[#8B233C] transition-colors"
                >
                  🎄 Destaque de Natal
                </button>

                <button
                  onClick={() => scrollTo("universos")}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 hover:text-[#8B233C] transition-colors"
                >
                  🌟 Coleções em Destaque
                </button>

                <button
                  onClick={() => scrollTo("queridinhos")}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 hover:text-[#8B233C] transition-colors"
                >
                  ❤️ Queridinhos da Loja
                </button>

                <div className="pt-3 pb-1 px-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8B233C]">
                    Todas as Categorias
                  </span>
                </div>

                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategorySlug(cat.slug);
                      scrollTo("categorias");
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-[#8B233C] transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}

                <button
                  onClick={() => scrollTo("empresas")}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 hover:text-[#8B233C] transition-colors mt-2 border-t border-neutral-200"
                >
                  🏢 Para Empresas & Equipes
                </button>
              </nav>

              <div className="p-6 border-t border-neutral-200 flex flex-col gap-3">
                <a
                  href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
                >
                  <WhatsAppIcon size={16} className="text-white shrink-0" />
                  <span>Falar no WhatsApp</span>
                </a>
                
                <a
                  href="https://instagram.com/virtualstore_3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-neutral-600 hover:text-[#8B233C] transition-colors pt-1 font-medium"
                >
                  <Instagram size={15} />
                  <span>@virtualstore_3</span>
                </a>

                <Link
                  to="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-[11px] text-neutral-400 hover:text-neutral-800 transition-colors pt-1"
                >
                  Acesso ao Painel Admin
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CONTEÚDO PRINCIPAL (FORA DO HEADER)                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <main className="bg-[#FBF7EE] text-[#1F1A17]">
        
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 2. SEÇÃO INDEPENDENTE: DESTAQUE DE NATAL (CARD BRANCO NO FUNDO BEGE)*/}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {heroFeaturedProduct && (
          <section id="destaque-natal" className="bg-[#F5EFE6] border-b border-[#EADFCF] py-12 sm:py-16 px-4 sm:px-8 scroll-mt-20">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-[#EADFCF] p-6 sm:p-10 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center text-neutral-900">
              
              {/* Fotografia em Destaque */}
              <div className="md:col-span-5 aspect-[4/5] bg-[#FAF7F2] rounded-2xl overflow-hidden relative shadow-md border border-neutral-200/80">
                {heroFeaturedProduct.image ? (
                  <img
                    src={heroFeaturedProduct.image}
                    alt={heroFeaturedProduct.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <Gift size={48} />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-[#8B233C] text-white px-3.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md">
                  Destaque de Natal
                </div>
              </div>

              {/* Informações e Conversão do Produto */}
              <div className="md:col-span-7 flex flex-col items-start justify-center text-left space-y-4 sm:space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8B233C] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#8B233C]" />
                    <span>Sugestão Especial de Natal</span>
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 mt-1 font-sans">
                    {heroFeaturedProduct.name}
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-600 mt-3 leading-relaxed">
                    Personalização sob medida com fotos, nomes e acabamento especial de boutique feito com afeto para celebrar o Natal.
                  </p>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#8B233C]">
                    {heroFeaturedProduct.price}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">
                    Personalização sob encomenda
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                  <Link
                    to={`/product/${heroFeaturedProduct.id}`}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#8B233C] hover:bg-[#A32A47] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Eu Quero Este Presente</span>
                    <ArrowRight size={15} className="text-white" />
                  </Link>

                  <a
                    href={`https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20encomendar%20o%20Destaque%20de%20Natal%3A%20${encodeURIComponent(heroFeaturedProduct.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                  >
                    <WhatsAppIcon size={16} className="text-white" />
                    <span>Pedir no WhatsApp</span>
                  </a>
                </div>

                <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-600 font-medium">
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-[#8B233C]" /> Encomenda com prévia</span>
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-[#8B233C]" /> Entrega em João Pessoa, Santa Rita e Região</span>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 4. TIRA DE PROMESSAS DE VALOR DA VIRTUAL STORE (FUNDO BEGE)         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-[#FBF7EE] border-b border-[#EADFCF] py-7 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-600">
            <div className="flex items-center gap-3.5">
              <span className="font-serif-sublime text-3xl text-[#8B233C] font-bold">01</span>
              <div>
                <strong className="block text-neutral-900 text-sm mb-0.5">Personalização com Afeto</strong>
                <span>Fotos, nomes e mensagens feitas sob medida para emocionar.</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="font-serif-sublime text-3xl text-[#8B233C] font-bold">02</span>
              <div>
                <strong className="block text-neutral-900 text-sm mb-0.5">João Pessoa, Santa Rita e Região</strong>
                <span>Entrega ágil e com todo o cuidado para a sua data comemorativa.</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="font-serif-sublime text-3xl text-[#8B233C] font-bold">03</span>
              <div>
                <strong className="block text-neutral-900 text-sm mb-0.5">Atendimento Humanizado</strong>
                <span>Tire dúvidas e acompanhe a prévia do seu pedido no WhatsApp.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 5. SEÇÃO DE UNIVERSOS & COLEÇÕES                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="universos" className="bg-[#F5EFE6] border-b border-[#EADFCF] py-16 sm:py-24 px-4 sm:px-8 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-10 border-b border-[#EADFCF] pb-5">
              <div>
                <span className="eyebrow-vs block mb-1 text-[#8B233C]">CADA MOMENTO, UMA HOMENAGEM</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight">
                  Qual história <br className="hidden sm:inline" />
                  <span className="text-[#8B233C]">vamos celebrar?</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-xs font-normal leading-relaxed">
                Escolha a ocasião que deseja homenagear. Nós transformamos o carinho em um presente inesquecível.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Cestas */}
              <div 
                onClick={() => { setActiveCategorySlug("cesta-cafe-da-manha"); scrollTo("categorias"); }}
                className="group relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 cursor-pointer shadow-lg hover:shadow-2xl transition-all"
              >
                <img 
                  src="/cestas/cestacoluna1_valor129,90.jpeg" 
                  alt="Cestas de Café da Manhã"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                  <small className="block text-[9px] uppercase tracking-[0.22em] text-[#F5E6C8] mb-1 font-bold">
                    O CARINHO DE ESTAR PERTO
                  </small>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                    Cestas de Café
                  </h3>
                  <span className="inline-block text-[11px] font-semibold border-b border-[#F5E6C8] pb-0.5 text-[#F5E6C8] group-hover:text-white group-hover:border-white transition-colors">
                    Ver opções ↗
                  </span>
                </div>
              </div>

              {/* Card 2: Quadros */}
              <div 
                onClick={() => { setActiveCategorySlug("quadros-casal"); scrollTo("categorias"); }}
                className="group relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 cursor-pointer shadow-lg hover:shadow-2xl transition-all"
              >
                <img 
                  src="/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.48.jpeg" 
                  alt="Quadros Personalizados"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                  <small className="block text-[9px] uppercase tracking-[0.22em] text-[#F5E6C8] mb-1 font-bold">
                    MEMÓRIAS ETERNAS
                  </small>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                    Quadros & Placas
                  </h3>
                  <span className="inline-block text-[11px] font-semibold border-b border-[#F5E6C8] pb-0.5 text-[#F5E6C8] group-hover:text-white group-hover:border-white transition-colors">
                    Ver modelos ↗
                  </span>
                </div>
              </div>

              {/* Card 3: Kits Casal */}
              <div 
                onClick={() => { setActiveCategorySlug("kits-casal"); scrollTo("categorias"); }}
                className="group relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 cursor-pointer shadow-lg hover:shadow-2xl transition-all"
              >
                <img 
                  src="/produtos_combos/comboVS_valor29,90.jpeg" 
                  alt="Kits Casal e Românticos"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                  <small className="block text-[9px] uppercase tracking-[0.22em] text-[#F5E6C8] mb-1 font-bold">
                    AMOR QUE VIRA PRESENTE
                  </small>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                    Kits Românticos
                  </h3>
                  <span className="inline-block text-[11px] font-semibold border-b border-[#F5E6C8] pb-0.5 text-[#F5E6C8] group-hover:text-white group-hover:border-white transition-colors">
                    Surpreender ↗
                  </span>
                </div>
              </div>

              {/* Card 4: Mamães e Bebês */}
              <div 
                onClick={() => { setActiveCategorySlug("mamaes-e-bebes"); scrollTo("categorias"); }}
                className="group relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 cursor-pointer shadow-lg hover:shadow-2xl transition-all"
              >
                <img 
                  src="/mamaes_bebes/caixa2bebe_valor34,90.jpeg" 
                  alt="Mamães e Bebês"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                  <small className="block text-[9px] uppercase tracking-[0.22em] text-[#F5E6C8] mb-1 font-bold">
                    DELICADEZA & TERNURA
                  </small>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                    Mamães & Bebês
                  </h3>
                  <span className="inline-block text-[11px] font-semibold border-b border-[#F5E6C8] pb-0.5 text-[#F5E6C8] group-hover:text-white group-hover:border-white transition-colors">
                    Conhecer ↗
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 7. QUERIDINHOS VIRTUAL STORE (FUNDO BEGE)                          */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="queridinhos" className="bg-[#FBF7EE] border-b border-[#EADFCF] py-16 sm:py-24 px-4 sm:px-8 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8">
              <div>
                <span className="eyebrow-vs block mb-1 text-[#8B233C]">A SELEÇÃO MAIS PEDIDA</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight">
                  Queridinhos <span className="text-[#8B233C]">Virtual Store.</span>
                </h2>
              </div>
              <button 
                onClick={() => scrollTo("categorias")}
                className="text-xs font-bold text-[#8B233C] border-b border-[#8B233C]/40 pb-1 hover:text-neutral-900 hover:border-neutral-900 transition-colors"
              >
                Ver catálogo completo ↗
              </button>
            </div>

            {/* Abas e Campo de Busca */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#EADFCF] pb-4 mb-8">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide py-1">
                {[
                  { id: "all", label: "Destaques" },
                  { id: "cestas", label: "Cestas" },
                  { id: "quadros", label: "Quadros" },
                  { id: "amor", label: "Kits Amor" },
                  { id: "combos", label: "Combos" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFavoritesFilter(tab.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      favoritesFilter === tab.id
                        ? "bg-[#8B233C] text-white border-[#8B233C] shadow-md scale-105"
                        : "bg-white text-neutral-700 hover:bg-neutral-50 border-[#EADFCF]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-72 relative">
                <input
                  type="search"
                  placeholder="Buscar presentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#EADFCF] rounded-full py-2.5 pl-4 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8B233C] shadow-sm"
                />
                <Search size={16} className="absolute right-3.5 top-3 text-neutral-400" />
              </div>
            </div>

            {/* Grid dos Queridinhos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {favoriteProducts.map((product) => (
                <VirtualStoreProductCard key={product.id} product={product} />
              ))}
            </div>

            {favoriteProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#EADFCF] p-8 shadow-sm">
                <Gift size={40} className="mx-auto text-neutral-300 mb-3" />
                <p className="font-semibold text-neutral-900 mb-1">
                  Nenhum presente encontrado com esse filtro
                </p>
                <p className="text-xs text-neutral-500 mb-4">
                  Tente buscar por outro termo ou explore as outras coleções abaixo.
                </p>
                <button
                  onClick={() => { setFavoritesFilter("all"); setSearchQuery(""); }}
                  className="btn-vs-primary text-xs"
                >
                  Limpar busca
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 8. CATÁLOGO COMPLETO POR CATEGORIAS (FUNDO BEGE SUAVE)             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="categorias" className="bg-[#F5EFE6] border-b border-[#EADFCF] py-16 sm:py-24 px-4 sm:px-8 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="eyebrow-vs block mb-2 text-[#8B233C]">CATÁLOGO COMPLETO</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight mb-3">
                Cada ocasião, um gesto especial.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                Navegue pelas categorias ativas do nosso catálogo artesanal. Escolha os detalhes que nós cuidamos de cada surpresa.
              </p>
            </div>

            {/* Pílulas de Categorias Reais do Supabase */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 mb-8">
              <button
                onClick={() => setActiveCategorySlug("all")}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategorySlug === "all"
                    ? "bg-[#8B233C] text-white border-[#8B233C] shadow-md scale-105"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 border-[#EADFCF]"
                }`}
              >
                Todos ({products.length})
              </button>

              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    activeCategorySlug === cat.slug
                      ? "bg-[#8B233C] text-white border-[#8B233C] shadow-md scale-105"
                      : "bg-white text-neutral-700 hover:bg-neutral-50 border-[#EADFCF]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Ferramentas de Ordenação */}
            <div className="flex items-center justify-between border-b border-[#EADFCF] pb-3 mb-8 text-xs text-neutral-700">
              <span>
                Exibindo <strong className="text-neutral-900 font-bold">{catalogProducts.length}</strong> produtos
              </span>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-neutral-600 font-medium">Ordenar por:</label>
                <select
                  id="sort-select"
                  value={catalogSort}
                  onChange={(e) => setCatalogSort(e.target.value as any)}
                  className="bg-white border border-[#EADFCF] text-neutral-900 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B233C]"
                >
                  <option value="featured">Recomendados</option>
                  <option value="low">Menor preço</option>
                  <option value="high">Maior preço</option>
                </select>
              </div>
            </div>

            {/* Renderização dos Produtos do Catálogo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {catalogProducts.map((product) => (
                <VirtualStoreProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 9. SEÇÃO EDITORIAL / VALORES (CARDS BRANCOS)                        */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-[#FBF7EE] text-neutral-900 border-y border-[#EADFCF] py-16 sm:py-24 px-6 sm:px-12">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-block text-xs font-extrabold tracking-[0.22em] text-[#8B233C] uppercase mb-2">
              O CUIDADO ESTÁ NOS DETALHES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight mb-12 text-neutral-900">
              Feito para chegar <br />
              <span className="text-[#8B233C]">ao coração.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white text-neutral-900 p-6 sm:p-8 rounded-2xl border border-[#EADFCF] shadow-sm hover:shadow-md transition-shadow">
                <strong className="block text-base font-bold text-neutral-900 mb-2">
                  Seu toque pessoal
                </strong>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  Nomes, mensagens carinhosas e fotos que eternizam lembranças. Cada produto é customizado com todo cuidado.
                </p>
              </div>

              <div className="bg-white text-neutral-900 p-6 sm:p-8 rounded-2xl border border-[#EADFCF] shadow-sm hover:shadow-md transition-shadow">
                <strong className="block text-base font-bold text-neutral-900 mb-2">
                  Acabamento impecável
                </strong>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  Itens selecionados, caixas artesanais de qualidade, laços delicados e embalagens feitas para encantar.
                </p>
              </div>

              <div className="bg-white text-neutral-900 p-6 sm:p-8 rounded-2xl border border-[#EADFCF] shadow-sm hover:shadow-md transition-shadow">
                <strong className="block text-base font-bold text-neutral-900 mb-2">
                  O presente certo
                </strong>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  Seja um aniversário, um pedido de namoro ou um simples café da manhã, o gesto certo emociona para sempre.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 10. SEÇÃO CORPORATIVA                                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="empresas" className="bg-[#F5EFE6] border-b border-[#EADFCF] py-16 sm:py-24 px-6 sm:px-12 scroll-mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="eyebrow-vs block mb-2 text-[#8B233C]">CORPORATIVO & EVENTOS</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight mb-4">
                Reconhecer também <br />
                é presentear.
              </h2>
              <p className="text-sm text-neutral-700 leading-relaxed mb-4 font-normal">
                Para colaboradores, clientes VIP e parceiros comerciais: cestas e mimos personalizados que fortalecem relações e valorizam a sua marca.
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed mb-6 font-normal">
                Montamos propostas sob medida com a identidade da sua empresa, cartões com mensagens institucionais e entregas programadas em Santa Rita, João Pessoa e Região.
              </p>
              
              <a
                href="https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20presentes%20corporativos%20na%20Virtual%20Store."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-vs-whatsapp inline-flex items-center gap-2.5 shadow-md"
              >
                <WhatsAppIcon size={16} className="text-white" />
                <span>Orçamento via WhatsApp</span>
              </a>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EADFCF] shadow-md text-center text-neutral-900">
              <span className="text-xl font-bold text-neutral-900 block mb-2">
                Atendimento Corporativo Personalizado
              </span>
              <p className="text-xs text-[#8B233C] mb-6 font-semibold">
                Atendemos pedidos corporativos com personalização completa e pontualidade.
              </p>
              <div className="grid grid-cols-2 gap-3 text-left text-xs">
                <div className="border border-[#EADFCF] p-3.5 rounded-xl bg-[#FAF7F2]">
                  <strong className="block mb-0.5 text-neutral-900">Kits comemorativos</strong>
                  <p className="text-[11px] text-neutral-600">Aniversariantes & metas</p>
                </div>
                <div className="border border-[#EADFCF] p-3.5 rounded-xl bg-[#FAF7F2]">
                  <strong className="block mb-0.5 text-neutral-900">Fim de ano & Brindes</strong>
                  <p className="text-[11px] text-neutral-600">Mimos para clientes especiais</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 11. COMO FUNCIONA O SEU PEDIDO                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-[#FBF7EE] border-t border-[#EADFCF] py-16 sm:py-24 px-6 sm:px-12">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow-vs block mb-2 text-[#8B233C]">PASSO A PASSO</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight mb-12">
              Escolha. Personalize. Celebre.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-t-2 border-[#8B233C] pt-6">
                <span className="text-3xl font-black text-[#8B233C] block mb-2">01</span>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Encontre seu presente</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Navegue pelo catálogo e escolha a cesta, quadro ou kit que melhor representa o seu sentimento.
                </p>
              </div>

              <div className="border-t-2 border-[#8B233C] pt-6">
                <span className="text-3xl font-black text-[#8B233C] block mb-2">02</span>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Personalize os detalhes</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Envie sua foto, escolha as frases e adicione itens extras. Nós conferimos tudo com você no WhatsApp.
                </p>
              </div>

              <div className="border-t-2 border-[#8B233C] pt-6">
                <span className="text-3xl font-black text-[#8B233C] block mb-2">03</span>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Entrega com todo cuidado</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Entregamos no endereço e horário combinados em Santa Rita, João Pessoa e Região.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 12. RODAPÉ OFICIAL — VIRTUAL STORE                                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#18040A] text-[#FBF7EE] py-14 px-6 sm:px-12 border-t border-[#D6BC85]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <div className="md:col-span-5">
            <div className="mb-4">
              <VSBrandMark size="md" variant="horizontal" colorTheme="light" subtitle="PRESENTES PERSONALIZADOS" />
            </div>
            <p className="text-xs text-[#EADFCF]/80 leading-relaxed max-w-sm mb-4 font-light">
              Transformando sentimentos, momentos especiais e datas comemorativas em presentes artesanais que tocam o coração.
            </p>
            <p className="text-xs text-[#D6BC85] font-semibold tracking-wider uppercase">
              Eternizando Momentos
            </p>
          </div>

          <div className="md:col-span-4 text-xs space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FBF7EE] mb-3">Atendimento & Pedidos</h4>
            <p className="text-[#EADFCF]/75 font-light">
              Para dúvidas, encomendas personalizadas ou orçamentos:
            </p>
            <div className="pt-2 space-y-2">
              <a 
                href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#25D366] hover:underline"
              >
                <WhatsAppIcon size={16} />
                <span>WhatsApp: (83) 99303-2780</span>
              </a>
              <a 
                href="https://instagram.com/virtualstore_3" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#EADFCF]/90 hover:text-[#D6BC85]"
              >
                <Instagram size={15} />
                <span>Instagram: @virtualstore_3</span>
              </a>
              <div className="flex items-center gap-1.5 text-[#EADFCF]/75 pt-1">
                <MapPin size={14} className="text-[#D6BC85]" />
                <span>Santa Rita, João Pessoa e Região</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 text-xs space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FBF7EE] mb-3">Navegação</h4>
            <ul className="space-y-2 text-[#EADFCF]/80">
              <li><button onClick={() => scrollTo("universos")} className="hover:text-[#D6BC85] cursor-pointer">Coleções</button></li>
              <li><button onClick={() => scrollTo("queridinhos")} className="hover:text-[#D6BC85] cursor-pointer">Mais Pedidos</button></li>
              <li><button onClick={() => scrollTo("categorias")} className="hover:text-[#D6BC85] cursor-pointer">Catálogo Geral</button></li>
              <li><button onClick={() => scrollTo("empresas")} className="hover:text-[#D6BC85] cursor-pointer">Para Empresas</button></li>
              <li><Link to="/admin/login" className="hover:text-[#D6BC85]">Painel do Administrador</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#D6BC85]/15 text-center text-[11px] text-[#EADFCF]/60 flex flex-col sm:flex-row items-center justify-between gap-3 font-light">
          <span>© {new Date().getFullYear()} VIRTUAL STORE. Todos os direitos reservados.</span>
          <span>Santa Rita, João Pessoa e Região • Presentes Personalizados com Afeto.</span>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 13. BARRA DE NAVEGAÇÃO MOBILE FIXA INFERIOR                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF7EE]/95 backdrop-blur-md border-t border-[#EADFCF] py-2 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden grid grid-cols-5 gap-1 text-neutral-700">
        <button
          onClick={() => scrollTo("top")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-900 py-1 cursor-pointer font-semibold hover:text-[#8B233C]"
        >
          <Gift size={17} strokeWidth={1.8} />
          <span>Início</span>
        </button>

        <button
          onClick={() => scrollTo("universos")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-600 py-1 cursor-pointer hover:text-[#8B233C]"
        >
          <Gift size={17} strokeWidth={1.8} />
          <span>Coleções</span>
        </button>

        <button
          onClick={() => scrollTo("categorias")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-600 py-1 cursor-pointer hover:text-[#8B233C]"
        >
          <Search size={17} strokeWidth={1.8} />
          <span>Catálogo</span>
        </button>

        <a
          href="https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20atendimento%20para%20presentes%20da%20Virtual%20Store."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-600 py-1 hover:text-[#8B233C]"
        >
          <WhatsAppIcon size={17} className="text-[#25D366]" />
          <span>Contato</span>
        </a>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-900 py-1 relative cursor-pointer font-semibold hover:text-[#8B233C]"
        >
          <ShoppingBag size={17} strokeWidth={1.8} />
          <span>Sacola</span>
          {totalItems > 0 && (
            <span className="absolute top-0.5 right-3 w-4 h-4 rounded-full bg-[#8B233C] text-white text-[9px] flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
