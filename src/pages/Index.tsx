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
  SlidersHorizontal
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { VSBrandMark } from "@/components/VSBrandMark";
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
    <article className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#ffd1dc] hover:shadow-[0_12px_30px_rgba(209,91,112,0.12)]">
      <Link 
        to={`/product/${product.id}`}
        className="block relative overflow-hidden bg-neutral-50 dark:bg-neutral-800/60 aspect-[4/5] rounded-lg"
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
            <span className="bg-[#111111] text-white text-[8.5px] sm:text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-[0.14em] shadow-sm">
              Promoção
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#fff0f3] text-[#d15b70] border border-[#ffd1dc] text-[8.5px] sm:text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-[0.14em] shadow-sm">
              Novidade
            </span>
          )}
          {!product.isPromo && !product.isNew && product.isFeatured && (
            <span className="bg-[#fffdf7] text-[#9b7a2d] border border-[#ebdcb3] text-[8.5px] sm:text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-[0.14em] shadow-sm">
              Destaque
            </span>
          )}
        </div>
      </Link>

      <div className="pt-3 pb-1 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-sans font-semibold text-xs sm:text-[13px] text-neutral-800 dark:text-neutral-200 line-clamp-1 leading-snug mb-1 group-hover:text-[#d15b70] transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-2 font-sans font-normal">
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
                <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                  {product.promoPrice}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                {product.price}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.id}`}
            className="w-full inline-flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-50 hover:bg-[#fff0f3] border border-neutral-200 hover:border-[#ffd1dc] text-neutral-800 hover:text-[#d15b70] text-[11px] font-sans font-semibold tracking-wide transition-all group/btn"
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
    <div className="min-h-screen bg-[#faf8f6] text-neutral-900 font-sans selection:bg-[#ff8da1] selection:text-neutral-900">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. BARRA SUPERIOR DE ANÚNCIO (TOPBAR INSTITUCIONAL)                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#111111] text-white py-2 px-4 text-center text-[10.5px] sm:text-xs font-medium tracking-wider flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-[#ff8da1] shrink-0 animate-pulse" />
        <span>
          Presentes Personalizados com Afeto • Entregas em <strong>Santa Rita, João Pessoa e Região</strong>
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. CABEÇALHO BOUTIQUE — VIRTUAL STORE                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Esquerda: Hambúrguer para Menu Lateral */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir Menu de Coleções"
              className="p-2 -ml-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
            >
              <MenuIcon size={22} strokeWidth={1.75} />
            </button>
            
            <button 
              onClick={() => scrollTo("universos")}
              className="hidden lg:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
            >
              <span>Coleções</span>
              <span className="text-[10px]">⌄</span>
            </button>
          </div>

          {/* Centro: Logomarca Oficial Virtual Store */}
          <Link to="/" onClick={() => scrollTo("top")}>
            <VSBrandMark size="md" variant="horizontal" subtitle="Presentes Personalizados" />
          </Link>

          {/* Direita: Ações e Botão da Sacola */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://instagram.com/virtualstore_3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @virtualstore_3"
              className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
            >
              <Instagram size={20} strokeWidth={1.75} />
            </a>

            <a
              href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Atendimento pelo WhatsApp"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 transition-all text-xs font-semibold tracking-wide uppercase focus:outline-none"
            >
              <WhatsAppIcon size={14} className="shrink-0" />
              <span>(83) 99303-2780</span>
            </a>

            {/* Botão da Sacola com Badge */}
            <button 
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir Sacola de Compras"
              className="relative p-2 text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none flex items-center gap-1.5 border border-neutral-200/80 px-3"
            >
              <ShoppingBag size={19} strokeWidth={1.8} />
              <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">Sacola</span>
              {totalItems > 0 && (
                <span className="bg-[#d15b70] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

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
              className="fixed top-0 left-0 h-full w-80 bg-white z-[210] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
                <VSBrandMark size="sm" variant="horizontal" subtitle="Catálogo Oficial" />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                <button
                  onClick={() => scrollTo("universos")}
                  className="w-full text-left px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:bg-[#fff0f3] hover:text-[#d15b70] transition-colors"
                >
                  🌟 Coleções em Destaque
                </button>

                <button
                  onClick={() => scrollTo("queridinhos")}
                  className="w-full text-left px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:bg-[#fff0f3] hover:text-[#d15b70] transition-colors"
                >
                  ❤️ Queridinhos da Loja
                </button>

                <div className="pt-2 pb-1 px-4">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-neutral-400">
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
                    className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-black transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}

                <button
                  onClick={() => scrollTo("empresas")}
                  className="w-full text-left px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:bg-neutral-50 transition-colors mt-2 border-t border-neutral-100"
                >
                  🏢 Para Empresas & Equipes
                </button>
              </nav>

              <div className="p-6 border-t border-neutral-100 flex flex-col gap-3">
                <a
                  href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
                >
                  <WhatsAppIcon size={16} className="text-white shrink-0" />
                  <span>Falar no WhatsApp</span>
                </a>
                
                <a
                  href="https://instagram.com/virtualstore_3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-neutral-600 hover:text-black transition-colors pt-1"
                >
                  <Instagram size={15} />
                  <span>@virtualstore_3</span>
                </a>

                <Link
                  to="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-[11px] text-neutral-400 hover:text-black transition-colors pt-1"
                >
                  Acesso ao Painel Admin
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main>
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 3. HERO SECTION — VIRTUAL STORE (BOUTIQUE ELEGANTE E LUMINOSA)      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white border-b border-neutral-200/60 py-12 sm:py-20 px-4 sm:px-8">
          {/* Gradiente sutil decorativo de fundo */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#ffd1dc]/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-40 -mt-20" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#ffe8b3]/30 to-transparent rounded-full blur-3xl pointer-events-none -ml-32 -mb-20" />

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Texto de Impacto Editorial */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Badge Oficial */}
              <div className="badge-vs-tag mb-4 sm:mb-5 shadow-sm">
                <Sparkles size={12} className="text-[#d15b70]" />
                <span>Catálogo Exclusivo</span>
              </div>

              {/* Slogan com a Fonte Anton Consagrada */}
              <h1 className="font-anton text-[38px] sm:text-[58px] md:text-[70px] lg:text-[78px] font-normal tracking-[-0.01em] leading-[0.96] text-neutral-900 uppercase mb-5 select-none">
                Transformamos <br />
                sentimentos em <br />
                <span className="text-[#d15b70]">presentes inesquecíveis.</span>
              </h1>

              {/* Localização Oficial */}
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold tracking-[0.14em] text-neutral-600 uppercase mb-6">
                <MapPin size={14} className="text-[#d15b70] shrink-0" />
                <span>Santa Rita, João Pessoa e Região</span>
              </div>

              {/* Breve Descrição Comercial */}
              <p className="text-sm sm:text-base text-neutral-600 max-w-lg leading-relaxed font-light mb-8">
                Cestas especiais de café da manhã, quadros afetivos, kits personalizados e memórias eternizadas com carinho e acabamento de boutique.
              </p>

              {/* Ações / Botões Principais */}
              <div className="flex flex-wrap items-center gap-3.5">
                <a
                  href="https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20encomendar%20um%20presente%20personalizado%20na%20Virtual%20Store."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-vs-whatsapp inline-flex items-center gap-2.5"
                >
                  <WhatsAppIcon size={18} className="text-white" />
                  <span>Pedir pelo WhatsApp</span>
                </a>

                <button 
                  onClick={() => scrollTo("universos")}
                  className="btn-vs-primary inline-flex items-center gap-2"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Selos de Confiança */}
              <div className="mt-8 pt-6 border-t border-neutral-200/80 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-500 font-medium">
                <span className="flex items-center gap-1.5"><Check size={14} className="text-[#25D366]" /> Feito por encomenda</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-[#25D366]" /> Fotos & Nomes exclusivos</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-[#25D366]" /> Entrega cuidadosa</span>
              </div>
            </div>

            {/* Vitrine / Fotografia de Produto em Destaque */}
            <div className="lg:col-span-5 relative flex items-center justify-center p-4 sm:p-6">
              
              {/* Moldura de Fundo do Card */}
              <div className="relative w-full max-w-[380px] bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                
                {/* Selo de Topo */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                  <span className="eyebrow-vs">O Mais Pedido</span>
                  <span className="text-[10px] font-bold text-[#d15b70] bg-[#fff0f3] px-2 py-0.5 rounded-full uppercase">
                    Virtual Store
                  </span>
                </div>

                {/* Fotografia Principal */}
                <div className="w-full aspect-[4/5] bg-neutral-100 rounded-xl overflow-hidden relative mb-4">
                  {heroFeaturedProduct?.image ? (
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
                </div>

                {/* Detalhes do Produto & Botão de Conversão */}
                {heroFeaturedProduct && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-sm text-neutral-900 leading-snug line-clamp-1">
                          {heroFeaturedProduct.name}
                        </h2>
                        <span className="text-xs text-neutral-500 font-normal">
                          Personalização sob encomenda
                        </span>
                      </div>
                      <span className="font-bold text-base text-neutral-900">
                        {heroFeaturedProduct.price}
                      </span>
                    </div>

                    <Link
                      to={`/product/${heroFeaturedProduct.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <span>Eu Quero Este Presente</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}

              </div>

            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 4. TIRA DE PROMESSAS DE VALOR DA VIRTUAL STORE                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-neutral-100 border-b border-neutral-200/80 py-6 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-700">
            <div className="flex items-center gap-3">
              <span className="font-serif-sublime text-2xl text-[#d15b70] font-bold">01</span>
              <div>
                <strong className="block text-neutral-900 text-sm mb-0.5">Personalização com Afeto</strong>
                <span>Fotos, nomes e mensagens feitas sob medida para emocionar.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-serif-sublime text-2xl text-[#d15b70] font-bold">02</span>
              <div>
                <strong className="block text-neutral-900 text-sm mb-0.5">João Pessoa, Santa Rita e Região</strong>
                <span>Entrega ágil e com todo o cuidado para a sua data comemorativa.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-serif-sublime text-2xl text-[#d15b70] font-bold">03</span>
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
        <section id="universos" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-10 border-b border-neutral-200 pb-5">
            <div>
              <span className="eyebrow-vs block mb-1">CADA MOMENTO, UMA HOMENAGEM</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight">
                Qual história <br className="hidden sm:inline" />
                <span className="text-[#d15b70]">vamos celebrar?</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xs font-normal">
              Escolha a ocasião que deseja homenagear. Nós transformamos o carinho em um presente inesquecível.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Cestas */}
            <div 
              onClick={() => { setActiveCategorySlug("cesta-cafe-da-manha"); scrollTo("categorias"); }}
              className="group relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img 
                src="/cestas/cestacoluna1_valor129,90.jpeg" 
                alt="Cestas de Café da Manhã"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <small className="block text-[8.5px] uppercase tracking-[0.2em] text-[#ffd1dc] mb-1 font-semibold">
                  O CARINHO DE ESTAR PERTO
                </small>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Cestas de Café
                </h3>
                <span className="inline-block text-[11px] font-medium border-b border-white/50 pb-0.5 text-white/90 group-hover:border-white group-hover:text-white transition-colors">
                  Ver opções ↗
                </span>
              </div>
            </div>

            {/* Card 2: Quadros */}
            <div 
              onClick={() => { setActiveCategorySlug("quadros-casal"); scrollTo("categorias"); }}
              className="group relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img 
                src="/QUADROSA4/WhatsApp Image 2026-05-27 at 02.30.48.jpeg" 
                alt="Quadros Personalizados"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <small className="block text-[8.5px] uppercase tracking-[0.2em] text-[#ffd1dc] mb-1 font-semibold">
                  MEMÓRIAS ETERNAS
                </small>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Quadros & Placas
                </h3>
                <span className="inline-block text-[11px] font-medium border-b border-white/50 pb-0.5 text-white/90 group-hover:border-white group-hover:text-white transition-colors">
                  Ver modelos ↗
                </span>
              </div>
            </div>

            {/* Card 3: Kits Casal */}
            <div 
              onClick={() => { setActiveCategorySlug("kits-casal"); scrollTo("categorias"); }}
              className="group relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img 
                src="/produtos_combos/comboVS_valor29,90.jpeg" 
                alt="Kits Casal e Românticos"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <small className="block text-[8.5px] uppercase tracking-[0.2em] text-[#ffd1dc] mb-1 font-semibold">
                  AMOR QUE VIRA PRESENTE
                </small>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Kits Românticos
                </h3>
                <span className="inline-block text-[11px] font-medium border-b border-white/50 pb-0.5 text-white/90 group-hover:border-white group-hover:text-white transition-colors">
                  Surpreender ↗
                </span>
              </div>
            </div>

            {/* Card 4: Mamães e Bebês */}
            <div 
              onClick={() => { setActiveCategorySlug("mamaes-e-bebes"); scrollTo("categorias"); }}
              className="group relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img 
                src="/mamaes_bebes/caixa2bebe_valor34,90.jpeg" 
                alt="Mamães e Bebês"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <small className="block text-[8.5px] uppercase tracking-[0.2em] text-[#ffd1dc] mb-1 font-semibold">
                  DELICADEZA & TERNURA
                </small>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Mamães & Bebês
                </h3>
                <span className="inline-block text-[11px] font-medium border-b border-white/50 pb-0.5 text-white/90 group-hover:border-white group-hover:text-white transition-colors">
                  Conhecer ↗
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 6. ATALHOS RÁPIDOS DE OCASIÕES                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-white py-8 px-4 sm:px-8 border-y border-neutral-200/80">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow-vs block mb-3">PRESENTES POR OCASIÃO</span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <button 
                onClick={() => { setActiveCategorySlug("quadros-casal"); scrollTo("categorias"); }}
                className="flex items-center gap-2 text-sm sm:text-base font-semibold text-neutral-800 hover:text-[#d15b70] transition-colors border-b border-neutral-200 pb-1"
              >
                <span>❤️ Para Meu Amor</span>
                <span className="text-[#d15b70]">↗</span>
              </button>

              <button 
                onClick={() => { setActiveCategorySlug("cesta-aniversario"); scrollTo("categorias"); }}
                className="flex items-center gap-2 text-sm sm:text-base font-semibold text-neutral-800 hover:text-[#d15b70] transition-colors border-b border-neutral-200 pb-1"
              >
                <span>🎂 Aniversário</span>
                <span className="text-[#d15b70]">↗</span>
              </button>

              <button 
                onClick={() => { setActiveCategorySlug("cesta-cafe-da-manha"); scrollTo("categorias"); }}
                className="flex items-center gap-2 text-sm sm:text-base font-semibold text-neutral-800 hover:text-[#d15b70] transition-colors border-b border-neutral-200 pb-1"
              >
                <span>☕ Café da Manhã</span>
                <span className="text-[#d15b70]">↗</span>
              </button>

              <button 
                onClick={() => { setActiveCategorySlug("combos-promocionais"); scrollTo("categorias"); }}
                className="flex items-center gap-2 text-sm sm:text-base font-semibold text-neutral-800 hover:text-[#d15b70] transition-colors border-b border-neutral-200 pb-1"
              >
                <span>🔥 Combos em Oferta</span>
                <span className="text-[#d15b70]">↗</span>
              </button>

              <button 
                onClick={() => scrollTo("empresas")}
                className="flex items-center gap-2 text-sm sm:text-base font-semibold text-neutral-800 hover:text-[#d15b70] transition-colors border-b border-neutral-200 pb-1"
              >
                <span>🏢 Para Empresas</span>
                <span className="text-[#d15b70]">↗</span>
              </button>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 7. QUERIDINHOS VIRTUAL STORE (VITRINE DESTACADA COM BUSCA)          */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="queridinhos" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow-vs block mb-1">A SELEÇÃO MAIS PEDIDA</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight">
                Queridinhos <span className="text-[#d15b70]">Virtual Store.</span>
              </h2>
            </div>
            <button 
              onClick={() => scrollTo("categorias")}
              className="text-xs font-semibold text-[#d15b70] border-b border-[#ffd1dc] pb-1 hover:text-black transition-colors"
            >
              Ver catálogo completo ↗
            </button>
          </div>

          {/* Abas e Campo de Busca */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-neutral-200 pb-4 mb-8">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    favoritesFilter === tab.id
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                      : "bg-white text-neutral-600 hover:text-black border-neutral-200"
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
                className="w-full bg-white border border-neutral-300 rounded-full py-2 pl-3.5 pr-9 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#d15b70] focus:ring-1 focus:ring-[#d15b70]"
              />
              <Search size={15} className="absolute right-3.5 top-2.5 text-neutral-400" />
            </div>
          </div>

          {/* Grid dos Queridinhos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {favoriteProducts.map((product) => (
              <VirtualStoreProductCard key={product.id} product={product} />
            ))}
          </div>

          {favoriteProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-neutral-200 p-8">
              <Gift size={40} className="mx-auto text-neutral-300 mb-3" />
              <p className="font-semibold text-neutral-800 mb-1">
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
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 8. CATÁLOGO COMPLETO POR CATEGORIAS (SUPABASE)                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="categorias" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-20 border-t border-neutral-200/80">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="eyebrow-vs block mb-2">CATÁLOGO COMPLETO</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight mb-3">
              Cada ocasião, um gesto especial.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-normal">
              Navegue pelas categorias ativas do nosso catálogo artesanal. Escolha os detalhes que nós cuidamos de cada surpresa.
            </p>
          </div>

          {/* Pílulas de Categorias Reais do Supabase */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 mb-8">
            <button
              onClick={() => setActiveCategorySlug("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategorySlug === "all"
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                  : "bg-white text-neutral-600 hover:text-black border-neutral-200"
              }`}
            >
              Todos ({products.length})
            </button>

            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeCategorySlug === cat.slug
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                    : "bg-white text-neutral-600 hover:text-black border-neutral-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Ferramentas de Ordenação */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-8 text-xs text-neutral-600">
            <span>
              Exibindo <strong>{catalogProducts.length}</strong> produtos
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-neutral-500">Ordenar por:</label>
              <select
                id="sort-select"
                value={catalogSort}
                onChange={(e) => setCatalogSort(e.target.value as any)}
                className="bg-white border border-neutral-300 text-neutral-800 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#d15b70]"
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
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 9. SEÇÃO EDITORIAL / VALORES                                       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-white border-y border-neutral-200/80 py-16 sm:py-24 px-6 sm:px-12">
          <div className="max-w-5xl mx-auto text-center">
            <span className="eyebrow-vs block mb-2">O CUIDADO ESTÁ NOS DETALHES</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 uppercase tracking-tight mb-12">
              Feito para chegar <br />
              <span className="text-[#d15b70]">ao coração.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-[#faf8f6] p-6 rounded-2xl border border-neutral-200/80">
                <strong className="block text-base font-bold text-neutral-900 mb-2">
                  Seu toque pessoal
                </strong>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Nomes, mensagens carinhosas e fotos que eternizam lembranças. Cada produto é customizado com todo cuidado.
                </p>
              </div>

              <div className="bg-[#faf8f6] p-6 rounded-2xl border border-neutral-200/80">
                <strong className="block text-base font-bold text-neutral-900 mb-2">
                  Acabamento impecável
                </strong>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Itens selecionados, caixas artesanais de qualidade, laços delicados e embalagens feitas para encantar.
                </p>
              </div>

              <div className="bg-[#faf8f6] p-6 rounded-2xl border border-neutral-200/80">
                <strong className="block text-base font-bold text-neutral-900 mb-2">
                  O presente certo
                </strong>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Seja um aniversário, um pedido de namoro ou um simples café da manhã, o gesto certo emociona para sempre.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 10. SEÇÃO CORPORATIVA                                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="empresas" className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="eyebrow-vs block mb-2">CORPORATIVO & EVENTOS</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight mb-4">
                Reconhecer também <br />
                é presentear.
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4 font-light">
                Para colaboradores, clientes VIP e parceiros comerciais: cestas e mimos personalizados que fortalecem relações e valorizam a sua marca.
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                Montamos propostas sob medida com a identidade da sua empresa, cartões com mensagens institucionais e entregas programadas em Santa Rita, João Pessoa e Região.
              </p>
              
              <a
                href="https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20presentes%20corporativos%20na%20Virtual%20Store."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-vs-whatsapp inline-flex items-center gap-2.5"
              >
                <WhatsAppIcon size={16} className="text-white" />
                <span>Orçamento via WhatsApp</span>
              </a>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm text-center">
              <span className="text-xl font-bold text-neutral-900 block mb-2">
                Atendimento Corporativo Personalizado
              </span>
              <p className="text-xs text-neutral-500 mb-6 font-light">
                Atendemos pedidos corporativos com personalização completa e pontualidade.
              </p>
              <div className="grid grid-cols-2 gap-3 text-left text-xs text-neutral-800">
                <div className="border border-neutral-200 p-3.5 rounded-xl bg-neutral-50">
                  <strong className="block mb-0.5">Kits comemorativos</strong>
                  <p className="text-[11px] text-neutral-500">Aniversariantes & metas</p>
                </div>
                <div className="border border-neutral-200 p-3.5 rounded-xl bg-neutral-50">
                  <strong className="block mb-0.5">Fim de ano & Brindes</strong>
                  <p className="text-[11px] text-neutral-500">Mimos para clientes especiais</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 11. COMO FUNCIONA O SEU PEDIDO                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="bg-white border-t border-neutral-200 py-16 sm:py-24 px-6 sm:px-12">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow-vs block mb-2">PASSO A PASSO</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight mb-12">
              Escolha. Personalize. Celebre.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-t-2 border-[#ffd1dc] pt-6">
                <span className="text-2xl font-bold text-[#d15b70] block mb-2">01</span>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Encontre seu presente</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Navegue pelo catálogo e escolha a cesta, quadro ou kit que melhor representa o seu sentimento.
                </p>
              </div>

              <div className="border-t-2 border-[#ffd1dc] pt-6">
                <span className="text-2xl font-bold text-[#d15b70] block mb-2">02</span>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Personalize os detalhes</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Envie sua foto, escolha as frases e adicione itens extras. Nós conferimos tudo com você no WhatsApp.
                </p>
              </div>

              <div className="border-t-2 border-[#ffd1dc] pt-6">
                <span className="text-2xl font-bold text-[#d15b70] block mb-2">03</span>
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
      <footer className="bg-neutral-900 text-white py-14 px-6 sm:px-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <div className="md:col-span-5">
            <div className="mb-4">
              <VSBrandMark size="md" variant="horizontal" subtitle="Presentes Personalizados" />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mb-4 font-light">
              Transformando sentimentos, momentos especiais e datas comemorativas em presentes artesanais que tocam o coração.
            </p>
            <p className="text-xs text-[#ff8da1] font-semibold tracking-wider uppercase">
              Eternizando Momentos
            </p>
          </div>

          <div className="md:col-span-4 text-xs space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Atendimento & Pedidos</h4>
            <p className="text-neutral-400 font-light">
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
                className="flex items-center gap-2 text-neutral-300 hover:text-white"
              >
                <Instagram size={15} />
                <span>Instagram: @virtualstore_3</span>
              </a>
              <div className="flex items-center gap-1.5 text-neutral-400 pt-1">
                <MapPin size={14} className="text-[#ff8da1]" />
                <span>Santa Rita, João Pessoa e Região</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 text-xs space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Navegação</h4>
            <ul className="space-y-2 text-neutral-400">
              <li><button onClick={() => scrollTo("universos")} className="hover:text-white cursor-pointer">Coleções</button></li>
              <li><button onClick={() => scrollTo("queridinhos")} className="hover:text-white cursor-pointer">Mais Pedidos</button></li>
              <li><button onClick={() => scrollTo("categorias")} className="hover:text-white cursor-pointer">Catálogo Geral</button></li>
              <li><button onClick={() => scrollTo("empresas")} className="hover:text-white cursor-pointer">Para Empresas</button></li>
              <li><Link to="/admin/login" className="hover:text-white">Painel do Administrador</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-neutral-800 text-center text-[11px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3 font-light">
          <span>© {new Date().getFullYear()} VIRTUAL STORE. Todos os direitos reservados.</span>
          <span>Santa Rita, João Pessoa e Região • Presentes Personalizados com Afeto.</span>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 13. BARRA DE NAVEGAÇÃO MOBILE FIXA INFERIOR                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-2 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] sm:hidden grid grid-cols-5 gap-1">
        <button
          onClick={() => scrollTo("top")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-900 py-1 cursor-pointer font-semibold"
        >
          <Gift size={17} strokeWidth={1.8} />
          <span>Início</span>
        </button>

        <button
          onClick={() => scrollTo("universos")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-500 py-1 cursor-pointer hover:text-black"
        >
          <Gift size={17} strokeWidth={1.8} />
          <span>Coleções</span>
        </button>

        <button
          onClick={() => scrollTo("categorias")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-500 py-1 cursor-pointer hover:text-black"
        >
          <Search size={17} strokeWidth={1.8} />
          <span>Catálogo</span>
        </button>

        <a
          href="https://wa.me/5583993032780?text=Ol%C3%A1!%20Gostaria%20de%20atendimento%20para%20presentes%20da%20Virtual%20Store."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-500 py-1 hover:text-black"
        >
          <WhatsAppIcon size={17} className="text-[#25D366]" />
          <span>Contato</span>
        </a>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-900 py-1 relative cursor-pointer font-semibold"
        >
          <ShoppingBag size={17} strokeWidth={1.8} />
          <span>Sacola</span>
          {totalItems > 0 && (
            <span className="absolute top-0.5 right-3 w-4 h-4 rounded-full bg-[#d15b70] text-white text-[9px] flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
