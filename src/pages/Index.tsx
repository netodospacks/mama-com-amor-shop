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
  Snowflake,
  ArrowUpRight
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { VSBrandMark } from "@/components/VSBrandMark";
import { GlobalSnowEffect } from "@/components/GlobalSnowEffect";
import { BoutiqueSectionHeader } from "@/components/BoutiqueSectionHeader";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const displayImage = product.image || (product.gallery && product.gallery.length > 0 ? product.gallery[0] : null);

  return (
    <article className="group relative z-20 bg-white rounded-xl sm:rounded-2xl border border-[#EADFCF] p-2 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg shadow-sm h-full">
      <Link 
        to={`/product/${product.id}`}
        className="block relative overflow-hidden bg-[#FAF7F2] aspect-[4/5] rounded-lg sm:rounded-xl shrink-0"
      >
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="w-full h-full object-cover p-1 sm:p-1.5 transition-transform duration-700 ease-out group-hover:scale-105 select-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <Gift size={24} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
          </div>
        )}

        {/* Badges Oficiais da Loja */}
        <div className="absolute left-1.5 top-1.5 sm:left-2.5 sm:top-2.5 flex flex-col gap-0.5 sm:gap-1 z-10 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-[#D97706] text-white text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-[0.1em] sm:tracking-[0.14em] shadow-sm flex items-center gap-0.5 sm:gap-1">
              <span>★</span> Mais Pedido
            </span>
          )}
          {product.isPromo && (
            <span className="bg-[#8B233C] text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-[0.1em] sm:tracking-[0.14em] shadow-sm">
              Promoção
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#173D32] text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-[0.1em] sm:tracking-[0.14em] shadow-sm">
              Novidade
            </span>
          )}
          {!product.isBestSeller && !product.isPromo && !product.isNew && product.isFeatured && (
            <span className="bg-[#D6BC85] text-[#2D0A14] font-bold text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-[0.1em] sm:tracking-[0.14em] shadow-sm">
              Destaque
            </span>
          )}
        </div>
      </Link>

      <div className="pt-2 sm:pt-3 pb-0.5 sm:pb-1 flex flex-col flex-grow text-neutral-900">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-sans font-bold text-[11px] sm:text-[13px] text-neutral-900 line-clamp-2 leading-tight mb-1 group-hover:text-[#8B233C] transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="hidden sm:block text-[11px] text-neutral-600 line-clamp-2 leading-relaxed mb-2 font-sans font-normal">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-1">
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-1.5 mb-2 sm:mb-2.5">
            {product.isPromo && product.promoPrice ? (
              <>
                <span className="text-[9px] sm:text-xs text-neutral-400 line-through font-sans">
                  {product.price}
                </span>
                <span className="text-xs sm:text-base font-extrabold text-[#8B233C] tracking-tight">
                  {product.promoPrice}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-base font-extrabold text-[#8B233C] tracking-tight">
                {product.price}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.id}`}
            className="w-full inline-flex items-center justify-center sm:justify-between py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-lg bg-[#8B233C] hover:bg-[#A32A47] text-white text-[10px] sm:text-[11px] font-sans font-bold tracking-wide transition-all shadow-sm group/btn active:scale-[0.98]"
          >
            <span>{buttonText}</span>
            <ArrowRight size={12} className="hidden sm:inline text-white transition-transform group-hover/btn:translate-x-1 ml-1" />
          </Link>
        </div>
      </div>
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: CategoryCarouselRow (Rolagem horizontal fluida para categorias configuradas como carrossel)
// ─────────────────────────────────────────────────────────────────────────────
const CategoryCarouselRow = ({ 
  products, 
  buttonText = "Personalizar" 
}: { 
  products: Product[]; 
  buttonText?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleCaptureClick = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Setas discretas no desktop */}
      {products.length > 3 && (
        <div className="hidden sm:flex items-center gap-1.5 absolute -top-12 right-0 z-10">
          <button
            onClick={() => scroll("left")}
            aria-label="Rolar para esquerda"
            className="h-8 w-8 rounded-full bg-white border border-[#EADFCF] text-neutral-700 hover:text-[#8B233C] hover:border-[#8B233C] hover:bg-[#FAF7F2] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Rolar para direita"
            className="h-8 w-8 rounded-full bg-white border border-[#EADFCF] text-neutral-700 hover:text-[#8B233C] hover:border-[#8B233C] hover:bg-[#FAF7F2] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Trilho de Rolagem Horizontal */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        onClickCapture={handleCaptureClick}
        className="flex items-stretch gap-3.5 sm:gap-5 overflow-x-auto scrollbar-hide py-2 px-1 snap-x snap-mandatory touch-pan-x cursor-grab active:cursor-grabbing select-none"
        style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="w-[210px] min-[380px]:w-[230px] sm:w-[250px] lg:w-[260px] shrink-0 snap-start flex"
          >
            <div className="w-full flex flex-col">
              <VirtualStoreProductCard product={product} buttonText={buttonText} />
            </div>
          </div>
        ))}
      </div>

      {/* Dica de rolagem sutil no smartphone */}
      <div className="sm:hidden mt-2 flex items-center justify-end gap-1 text-[10px] text-neutral-400 font-medium">
        <span>Arraste para ver mais</span>
        <ArrowRight size={11} className="text-[#8B233C]" />
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────
export default function Index() {
  const { totalItems, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // Busca e Filtros do Catálogo
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Categoria ativa do Catálogo Completo
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");

  // Ordenação do catálogo
  const [catalogSort, setCatalogSort] = useState<"featured" | "low" | "high">("featured");

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Referência e controle de rolagem horizontal da vitrine de Destaques
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingFeatured, setIsDraggingFeatured] = useState(false);
  const [hasMovedFeatured, setHasMovedFeatured] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const scrollFeatured = (direction: "left" | "right") => {
    if (featuredScrollRef.current) {
      const scrollAmount = featuredScrollRef.current.clientWidth * 0.75;
      featuredScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleFeaturedMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!featuredScrollRef.current) return;
    setIsDraggingFeatured(true);
    setHasMovedFeatured(false);
    startXRef.current = e.pageX - featuredScrollRef.current.offsetLeft;
    scrollLeftRef.current = featuredScrollRef.current.scrollLeft;
  };

  const handleFeaturedMouseLeaveOrUp = () => {
    setIsDraggingFeatured(false);
  };

  const handleFeaturedMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingFeatured || !featuredScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - featuredScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 4) {
      setHasMovedFeatured(true);
    }
    featuredScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleFeaturedCaptureClick = (e: React.MouseEvent) => {
    if (hasMovedFeatured) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Metadados editoriais de boutique para categorias da loja (preserva personalização de cada seção)
  const getCategoryEditorialInfo = (cat: { slug?: string; name?: string; description?: string | null }) => {
    const slug = (cat.slug || "").toLowerCase();
    const name = (cat.name || "").toLowerCase();

    if (slug.includes("cesta") || name.includes("cesta")) {
      return {
        eyebrow: "AFETO & CELEBRAÇÃO",
        defaultSubtitle: "Cestas artesanais preparadas com carinho em cada detalhe para surpreender e emocionar.",
      };
    }
    if (slug.includes("quadro-a4") || slug.includes("quadros-a4") || slug.includes("quadros-casal") || slug.includes("quadros-aniversario") || name.includes("quadros a4") || name.includes("quadro a4")) {
      return {
        eyebrow: "MEMÓRIAS ETERNAS",
        defaultSubtitle: "Quadros afetivos em tamanho A4 para eternizar histórias, datas e sentimentos inesquecíveis.",
      };
    }
    if (slug.includes("10x15") || name.includes("10x15")) {
      return {
        eyebrow: "REGISTROS ESPECIAIS",
        defaultSubtitle: "Mini quadros delicados e acolhedores, perfeitos para decorar e presentear com ternura.",
      };
    }
    if (slug.includes("quadro") || name.includes("quadro")) {
      return {
        eyebrow: "MEMÓRIAS ETERNAS",
        defaultSubtitle: "Quadros personalizados com fotos, frases e datas marcantes para eternizar seu amor.",
      };
    }
    if (slug.includes("placa") || name.includes("placa")) {
      return {
        eyebrow: "DESIGN & EMOÇÃO",
        defaultSubtitle: "Placas acrílicas contemporâneas com música, fotos e mensagens personalizadas de alto padrão.",
      };
    }
    if (slug.includes("combo") || name.includes("combo")) {
      return {
        eyebrow: "EXPERIÊNCIAS COMPLETAS",
        defaultSubtitle: "Combinações harmônicas pensadas para um presente completo, marcante e inesquecível.",
      };
    }
    if (slug.includes("kit") || name.includes("kit")) {
      return {
        eyebrow: "SURPRESAS ARTESANAIS",
        defaultSubtitle: "Kits temáticos com curadoria exclusiva de mimos e lembranças afetivas.",
      };
    }
    if (slug.includes("bebe") || slug.includes("mae") || name.includes("mamãe") || name.includes("bebê") || name.includes("bebe") || name.includes("mãe")) {
      return {
        eyebrow: "DELICADEZA & TERNURA",
        defaultSubtitle: "Presentes suaves e carinhosos criados para celebrar a vida, a maternidade e os primeiros momentos.",
      };
    }
    if (slug.includes("produto") || name.includes("produto")) {
      return {
        eyebrow: "MIMOS & DETALHES",
        defaultSubtitle: "Caixas, cubos de fotos, polaroids e acessórios artesanais para complementar qualquer surpresa.",
      };
    }
    return {
      eyebrow: "COLEÇÃO EXCLUSIVA",
      defaultSubtitle: "Presentes personalizados com design autoral e acabamento artesanal de alto padrão.",
    };
  };
  const { data: catalogData, isLoading } = useQuery({
    queryKey: ['public-catalog'],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return { products: [], categories: [] };
      }

      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(id, name, slug, active)')
          .eq('active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true })
      ]);

      const activeCategories = catRes.data || [];
      const activeCategoryIds = new Set(activeCategories.map(c => c.id));

      // REGRA: Quando uma categoria for ocultada, seus produtos não devem aparecer no catálogo público
      const validProducts = (prodRes.data || []).filter(p => {
        if (p.category_id && !activeCategoryIds.has(p.category_id)) {
          return false;
        }
        return true;
      });

      return {
        products: validProducts.map(mapProductFromDB),
        categories: activeCategories
      };
    },
    staleTime: 1000 * 20, // 20 segundos
    refetchOnWindowFocus: true,
  });

  const products = catalogData?.products || [];
  const categoriesList = catalogData?.categories || [];

  // Produtos em destaque exclusivos (is_featured === true), preservando ordem cadastrada
  const featuredProducts = useMemo(() => {
    return products.filter(p => p.isFeatured);
  }, [products]);

  // Produtos da Coleção de Natal (Dinâmicos via Supabase)
  // Regra de ordenação obrigatória:
  // 1. Produto com MAIS PEDIDO (isBestSeller === true) sempre primeiro
  // 2. Demais produtos conforme displayOrder (ou sortOrder)
  // 3. Em caso de empate, critério estável por nome
  const christmasProducts = useMemo(() => {
    // Busca produtos associados à coleção de natal (via collection === 'natal' ou categorySlug/name contendo 'natal')
    let prods = products.filter(p => 
      p.collection === 'natal' ||
      p.categorySlug?.toLowerCase().includes('natal') ||
      p.categoryName?.toLowerCase().includes('natal')
    );

    // Se ainda não houver produtos com tag de natal no banco, oferece os 3 produtos nativos do catálogo natalino
    if (prods.length === 0) {
      prods = [
        {
          id: 'natal-amanhecer',
          name: 'Cesta Café Amanhecer',
          price: 'R$ 290,00',
          image: '/natal/cesta_amanhecer.jpg',
          gallery: ['/natal/cesta_amanhecer.jpg'],
          shortDescription: 'Caixote Madeira Pinus, Mini Arranjo de Astromélias Naturais, Varal de Fotos Polaroid com Imã, waffle, geleia e delícias artesanais.',
          detailedDescription: 'Caixote Madeira Pinus, Mini Arranjo de Astromélias Naturais, Varal de Fotos Polaroid com Imã, waffle, geleia e delícias artesanais.',
          specifications: ['Caixote Madeira Pinus', 'Mini Arranjo de Astromélias Naturais', 'Varal de Fotos Polaroid com Imã'],
          observations: 'Serve 1 pessoa.',
          isBestSeller: true,
          displayOrder: 1,
          collection: 'natal'
        },
        {
          id: 'natal-mini-pinus',
          name: 'Mini Café Pinus',
          price: 'R$ 190,00',
          image: '/natal/mini_cafe_pinus.jpg',
          gallery: ['/natal/mini_cafe_pinus.jpg'],
          shortDescription: 'Um café da manhã sofisticado e equilibrado, ideal para começar o dia com sabor, biscoito artesanal decorado e elegância.',
          detailedDescription: 'Um café da manhã sofisticado e equilibrado, ideal para começar o dia com sabor, biscoito artesanal decorado e elegância.',
          specifications: ['Caixote Pinus', 'Biscoito Decorado', 'Suco e Delícias'],
          observations: 'Serve 1 pessoa.',
          isBestSeller: false,
          displayOrder: 2,
          collection: 'natal'
        },
        {
          id: 'natal-amor-detalhe',
          name: 'Cesta Café Amor em Detalhe',
          price: 'R$ 235,00',
          image: '/natal/cesta_amor_detalhe.jpg',
          gallery: ['/natal/cesta_amor_detalhe.jpg'],
          shortDescription: 'Composição nobre em formato de coração com croissant, suco de uva integral, frutas frescas, pães de queijo e doces finos.',
          detailedDescription: 'Composição nobre em formato de coração com croissant, suco de uva integral, frutas frescas, pães de queijo e doces finos.',
          specifications: ['Formato Coração', 'Croissant', 'Suco Integral'],
          observations: 'Serve 1 pessoa.',
          isBestSeller: false,
          displayOrder: 3,
          collection: 'natal'
        }
      ];
    }

    return [...prods].sort((a, b) => {
      // 1. Produto com MAIS PEDIDO ativado primeiro
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;

      // 2. Demais produtos conforme displayOrder (ou sortOrder)
      const orderA = a.displayOrder ?? a.sortOrder ?? 999;
      const orderB = b.displayOrder ?? b.sortOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;

      // 3. Em caso de empate, critério estável por nome
      return a.name.localeCompare(b.name);
    });
  }, [products]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HIERARQUIA DE CATEGORIAS E SUBCATEGORIAS (VIRTUAL STORE)
  // 1. Categorias Principais no menu superior: Cestas, Mamães e Bebês, Placas Acrílicas,
  //    Quadros (ou Quadros A4/10x15), Kits, Combos Promocionais, etc.
  // 2. Subcategorias internas de Cestas (Café da Manhã, Aniversário, Masculina):
  //    NUNCA aparecem como botões no menu superior; aparecem exclusivamente dentro
  //    da vitrine principal Cestas em sequência vertical pela rolagem da página.
  // ─────────────────────────────────────────────────────────────────────────────

  // Identifica se uma categoria é uma subseção interna de Cestas
  const isCestaSubcategory = (cat: { slug?: string; name?: string }) => {
    const slug = (cat.slug || "").toLowerCase();
    const name = (cat.name || "").toLowerCase();
    // Subseções de cestas
    return slug.startsWith("cesta-") || (name.startsWith("cesta ") && slug !== "cestas");
  };

  // Categorias principais ativas para a barra de navegação superior e menu lateral
  const activeMainCategoriesWithProducts = useMemo(() => {
    const active = categoriesList.filter(cat => {
      // Exclui subcategorias de cestas do menu superior
      if (isCestaSubcategory(cat)) return false;

      return products.some(p => 
        (p.categoryId && String(p.categoryId) === String(cat.id)) ||
        (p.categorySlug && cat.slug && p.categorySlug.toLowerCase() === cat.slug.toLowerCase())
      );
    });

    // Verifica se existem produtos em qualquer subcategoria de cestas para exibir a pílula "Cestas"
    const hasAnyCestaProduct = products.some(p => {
      const slug = (p.categorySlug || "").toLowerCase();
      const name = (p.categoryName || "").toLowerCase();
      return slug.includes("cesta") || name.includes("cesta");
    });

    const pills: { id: string; name: string; slug: string; sort_order: number }[] = [];

    // Se houver cestas, adiciona a categoria principal "Cestas" como primeira opção
    if (hasAnyCestaProduct) {
      pills.push({
        id: "main-cestas",
        name: "Cestas",
        slug: "cestas",
        sort_order: 1
      });
    }

    // Adiciona as outras categorias principais ordenadas
    const others = [...active].sort((a, b) => {
      const isACombo = (a.slug || "").toLowerCase().includes("combo");
      const isBCombo = (b.slug || "").toLowerCase().includes("combo");
      if (isACombo && !isBCombo) return -1;
      if (!isACombo && isBCombo) return 1;

      const orderA = a.sort_order ?? 999;
      const orderB = b.sort_order ?? 999;
      if (orderA !== orderB) return orderA - orderB;

      return a.name.localeCompare(b.name);
    });

    pills.push(...others);
    return pills;
  }, [categoriesList, products]);

  // Vitrines organizadas do Catálogo:
  // - Seção principal "Cestas" agrega e organiza verticalmente suas subseções (Café da Manhã, Aniversário, Masculina, etc.)
  // - Em seguida, Combos Promocionais (3 por linha)
  // - Em seguida, demais categorias principais
  // - "Outros Presentes" / Todos no final
  const catalogStructure = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();

    // Filtra produtos conforme texto de busca
    const filterBySearch = (prods: Product[]) => {
      if (!cleanQuery) return prods;
      return prods.filter(p =>
        p.name.toLowerCase().includes(cleanQuery) ||
        p.shortDescription?.toLowerCase().includes(cleanQuery) ||
        p.detailedDescription?.toLowerCase().includes(cleanQuery)
      );
    };

    // Aplica ordenação selecionada aos produtos
    const sortProducts = (prods: Product[]) => {
      if (catalogSort === "featured") {
        return [...prods].sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        });
      } else if (catalogSort === "low") {
        return [...prods].sort((a, b) => {
          const pA = parseFloat(a.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
          const pB = parseFloat(b.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
          return pA - pB;
        });
      } else if (catalogSort === "high") {
        return [...prods].sort((a, b) => {
          const pA = parseFloat(a.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
          const pB = parseFloat(b.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
          return pB - pA;
        });
      }
      return prods;
    };

    // 1. Bloco Especial Cestas (Subcategorias internas de Cestas)
    const cestaCategories = categoriesList
      .filter(c => isCestaSubcategory(c) || c.slug === "cestas")
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

    const cestaSubsections = cestaCategories.map(cat => {
      const prods = products.filter(p => {
        if (p.categoryId && String(p.categoryId) === String(cat.id)) return true;
        if (p.categorySlug && cat.slug && p.categorySlug.toLowerCase() === cat.slug.toLowerCase()) return true;
        return false;
      });
      return {
        category: cat,
        products: sortProducts(filterBySearch(prods))
      };
    }).filter(s => s.products.length > 0);

    // 2. Demais Categorias Principais (não-cestas)
    const otherCategories = categoriesList
      .filter(c => !isCestaSubcategory(c) && c.slug !== "cestas")
      .sort((a, b) => {
        const isACombo = (a.slug || "").toLowerCase().includes("combo");
        const isBCombo = (b.slug || "").toLowerCase().includes("combo");
        if (isACombo && !isBCombo) return -1;
        if (!isACombo && isBCombo) return 1;
        return (a.sort_order ?? 999) - (b.sort_order ?? 999);
      });

    const otherSections = otherCategories.map(cat => {
      const prods = products.filter(p => {
        if (p.categoryId && String(p.categoryId) === String(cat.id)) return true;
        if (p.categorySlug && cat.slug && p.categorySlug.toLowerCase() === cat.slug.toLowerCase()) return true;
        return false;
      });
      return {
        category: cat,
        products: sortProducts(filterBySearch(prods))
      };
    }).filter(s => s.products.length > 0);

    // Se o usuário selecionou uma categoria específica no topo:
    if (activeCategorySlug === "cestas") {
      return {
        isCestasOnly: true,
        cestaSubsections,
        otherSections: []
      };
    } else if (activeCategorySlug !== "all") {
      const selected = otherSections.filter(s => s.category.slug === activeCategorySlug);
      return {
        isCestasOnly: false,
        cestaSubsections: [],
        otherSections: selected
      };
    }

    // Modo "all" (Exibe Cestas com suas subseções verticais primeiro, depois as outras categorias)
    return {
      isCestasOnly: false,
      cestaSubsections,
      otherSections
    };
  }, [products, categoriesList, activeCategorySlug, catalogSort, searchQuery]);

  // Total de produtos visíveis nas vitrines do catálogo
  const totalCatalogVisibleProducts = useMemo(() => {
    const fromCestas = catalogStructure.cestaSubsections.reduce((acc, curr) => acc + curr.products.length, 0);
    const fromOthers = catalogStructure.otherSections.reduce((acc, curr) => acc + curr.products.length, 0);
    return fromCestas + fromOthers;
  }, [catalogStructure]);

  // Função para rolagem suave
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    let element = document.getElementById(id);
    if (!element && id === "corporativo") element = document.getElementById("empresas");
    if (!element && id === "empresas") element = document.getElementById("corporativo");
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - offset),
        behavior: "smooth"
      });
    }
  };

  // Direcionamento inteligente para a área natalina no catálogo (sem criar categorias fictícias)
  const handleExploreChristmas = () => {
    const natalCat = categoriesList.find(c => 
      c.slug?.toLowerCase().includes("natal") || 
      c.name?.toLowerCase().includes("natal")
    );
    if (natalCat) {
      setActiveCategorySlug(natalCat.slug);
    } else {
      setActiveCategorySlug("all");
    }
    scrollTo("categorias");
  };

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-[#1F1A17] font-sans selection:bg-[#8B233C] selection:text-white relative">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* NEVE NATALINA GLOBAL (FLUTUA POR TODO O SITE DURANTE A ROLAGEM)     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <GlobalSnowEffect />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HEADER (ÁREA EXCLUSIVA DE CABEÇALHO & APRESENTAÇÃO INICIAL)      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="relative z-[5] bg-[#FBF7EE] select-none">
        
        {/* 1.1 Ticker Slim no Topo (Cor de Natal: Vinho Nobre Escuro) */}
        <div 
          role="region"
          aria-label="Aviso institucional"
          className="relative bg-[#1F060E] border-b border-[#D6BC85]/30 py-1.5 sm:py-2 overflow-hidden w-full shadow-inner"
        >
          <div className="relative z-20 animate-ticker-marquee flex items-center whitespace-nowrap">
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
        <nav className="relative bg-[#FBF7EE]/95 backdrop-blur-md border-b border-[#EADFCF] px-4 sm:px-8 py-3 sm:py-3.5 shadow-xs">
          <div className="relative z-20 max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Esquerda: Hambúrguer para Menu Lateral & Links de Navegação */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir Menu de Coleções"
                className="p-2 -ml-2 text-neutral-800 hover:text-[#8B233C] hover:bg-[#F2ECE1] rounded-lg transition-colors focus:outline-none"
              >
                <MenuIcon size={22} strokeWidth={1.75} />
              </button>
              
              <button 
                onClick={() => scrollTo("categorias")}
                className="hidden lg:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:text-[#8B233C] hover:bg-[#F2ECE1] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <span>Catálogo</span>
                <span className="text-[10px]">⌄</span>
              </button>

              <button 
                onClick={() => scrollTo("corporativo")}
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:text-[#8B233C] hover:bg-[#F2ECE1] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Briefcase size={13} className="text-[#8B233C] shrink-0" />
                <span>Corporativo</span>
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

            {/* 4. Botão de Conversão em Vinho Aveludado (Inspirado na Referência) + WhatsApp + Corporativo */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start justify-start gap-2.5 sm:gap-3 pt-2 w-full sm:w-auto">
              <button 
                onClick={() => scrollTo("destaques")}
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

              {/* Botão Corporativo — Posicionado diretamente abaixo do WhatsApp no mobile */}
              <button
                onClick={() => scrollTo("corporativo")}
                className="self-start px-5 py-3 sm:py-4 rounded-xl bg-black/40 hover:bg-black/60 border border-[#dfc285]/70 hover:border-[#dfc285] text-[#dfc285] hover:text-white text-xs font-semibold tracking-[0.14em] uppercase inline-flex items-center justify-start gap-2.5 backdrop-blur-md transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Briefcase size={15} className="text-[#dfc285] shrink-0" />
                <span>Corporativo</span>
              </button>
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
                  onClick={() => scrollTo("destaques")}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 hover:text-[#8B233C] transition-colors"
                >
                  ⭐ Produtos em Destaque
                </button>

                <button
                  onClick={() => {
                    setActiveCategorySlug("all");
                    scrollTo("categorias");
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 hover:text-[#8B233C] transition-colors"
                >
                  🎁 Catálogo Completo
                </button>

                {/* NOVO: Botão Corporativo no Menu Mobile */}
                <button
                  onClick={() => scrollTo("corporativo")}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-[#8B233C] bg-[#8B233C]/5 hover:bg-[#8B233C]/10 border border-[#8B233C]/20 transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase size={15} className="text-[#8B233C] shrink-0" />
                    <span>Corporativo</span>
                  </span>
                  <span className="text-[9.5px] font-semibold text-[#8B233C] bg-white px-2 py-0.5 rounded-full border border-[#8B233C]/20 uppercase tracking-widest">
                    Empresas
                  </span>
                </button>

                <div className="pt-3 pb-1 px-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8B233C]">
                    Categorias
                  </span>
                </div>

                {activeMainCategoriesWithProducts.map((cat) => (
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
                  onClick={() => scrollTo("corporativo")}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 hover:text-[#8B233C] transition-colors mt-2 border-t border-neutral-200 flex items-center gap-2"
                >
                  <Briefcase size={15} className="text-[#8B233C] shrink-0" />
                  <span>Para Empresas & Equipes</span>
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

                {/* Botão Corporativo também posicionado abaixo do WhatsApp no menu lateral */}
                <button
                  onClick={() => scrollTo("corporativo")}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#8B233C]/10 hover:bg-[#8B233C]/20 border border-[#8B233C]/30 text-[#8B233C] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Briefcase size={15} className="text-[#8B233C] shrink-0" />
                  <span>Atendimento Corporativo</span>
                </button>
                
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
        {/* 3. VITRINE DE PRODUTOS EM DESTAQUE COM ROLAGEM HORIZONTAL           */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {featuredProducts.length > 0 && (
          <section id="destaques" className="bg-[#F5EFE6] border-b border-[#EADFCF] py-12 sm:py-16 px-4 sm:px-8 scroll-mt-20 select-none">
            <span id="destaque-natal" className="sr-only">Destaques</span>
            <div className="max-w-7xl mx-auto">
              
              {/* Cabeçalho Padronizado da Seção de Destaques */}
              <BoutiqueSectionHeader
                eyebrow="CURADORIA EXCLUSIVA"
                title="Produtos em Destaque"
                subtitle="Presentes selecionados a dedo pela nossa equipe para emocionar e surpreender em ocasiões especiais."
                className="mb-6 sm:mb-8"
                actions={
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => scrollFeatured("left")}
                      aria-label="Rolar destaques para esquerda"
                      className="h-10 w-10 rounded-full bg-white border border-[#EADFCF] text-neutral-700 hover:text-[#8B233C] hover:border-[#8B233C] hover:bg-[#FAF7F2] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => scrollFeatured("right")}
                      aria-label="Rolar destaques para direita"
                      className="h-10 w-10 rounded-full bg-white border border-[#EADFCF] text-neutral-700 hover:text-[#8B233C] hover:border-[#8B233C] hover:bg-[#FAF7F2] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                }
              />

              {/* Vitrine de Rolagem Horizontal (Arrastar com dedo no celular, drag com mouse no PC) */}
              <div
                ref={featuredScrollRef}
                onMouseDown={handleFeaturedMouseDown}
                onMouseLeave={handleFeaturedMouseLeaveOrUp}
                onMouseUp={handleFeaturedMouseLeaveOrUp}
                onMouseMove={handleFeaturedMouseMove}
                onClickCapture={handleFeaturedCaptureClick}
                className="flex items-stretch gap-3.5 sm:gap-5 overflow-x-auto scrollbar-hide py-2 px-1 snap-x snap-mandatory touch-pan-x cursor-grab active:cursor-grabbing select-none"
                style={{ scrollBehavior: isDraggingFeatured ? "auto" : "smooth" }}
              >
                {featuredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="w-[230px] min-[380px]:w-[250px] sm:w-[270px] lg:w-[280px] shrink-0 snap-start flex"
                  >
                    <div className="w-full flex flex-col">
                      <VirtualStoreProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Dica de rolagem sutil no celular */}
              <div className="sm:hidden mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-medium">
                <span>Deslize para ver mais destaques</span>
                <ArrowRight size={12} className="text-[#8B233C]" />
              </div>

            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 4. COLEÇÃO DE NATAL (INSPIRAÇÃO REFERÊNCIA SUBLIME DA BOUTIQUE)    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section 
          id="especial-natal" 
          aria-label="Coleção de Natal"
          className="relative bg-[#FAF6F0] border-b border-[#EADFCF] py-12 sm:py-16 px-4 sm:px-6 overflow-hidden scroll-mt-20"
        >
          {/* Efeitos de iluminação sutil e acolhedora natalina */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B233C]/8 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D6BC85]/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-80 bg-white/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            
            {/* Título Oficial: Padrão Tipográfico NATIVO da Virtual Store (Poppins 800 + eyebrow-vs) */}
            <div className="mb-8 sm:mb-10 text-center max-w-xl mx-auto px-2">
              <span className="eyebrow-vs block mb-1.5 text-[#8B233C] flex items-center justify-center gap-1.5">
                <Sparkles size={14} className="text-[#8B233C]" />
                <span>EDIÇÃO LIMITADA</span>
                <Sparkles size={14} className="text-[#8B233C]" />
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 uppercase tracking-tight font-sans">
                Coleção de Natal
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-normal leading-relaxed max-w-md mx-auto">
                Cada produto foi desenvolvido com carinho e dedicação para tornar seu Natal ainda mais especial.
              </p>
            </div>

            {/* Cards da Coleção Natalina (Dinâmicos via Supabase, Ordenação por MAIS PEDIDO e display_order) */}
            <div className="flex flex-col gap-3.5 sm:gap-4">
              {christmasProducts.map((product) => {
                const displayImage = product.image || (product.gallery && product.gallery.length > 0 ? product.gallery[0] : null);

                return (
                  <article 
                    key={product.id}
                    className="group relative z-20 bg-white rounded-2xl sm:rounded-3xl border border-[#EADFCF] p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all flex items-stretch justify-between gap-3 sm:gap-5 hover:border-[#D6BC85]/80"
                  >
                    {/* LADO ESQUERDO: Conteúdo textual, detalhes e preço */}
                    <div className="flex-1 flex flex-col justify-between pr-1 sm:pr-2">
                      <div>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-sans font-bold text-sm sm:text-base text-neutral-900 group-hover:text-[#8B233C] transition-colors leading-snug">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Tag de capacidade / detalhes sutis */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] font-medium mt-1.5 w-fit">
                          <span className="text-[12px]">👤</span>
                          <span>{product.observations || 'Serve 1 pessoa'}</span>
                        </div>

                        {/* Descrição breve */}
                        {product.shortDescription && (
                          <p className="text-[11px] sm:text-xs text-neutral-600 line-clamp-2 sm:line-clamp-3 mt-2 leading-relaxed font-sans">
                            {product.shortDescription}
                          </p>
                        )}
                      </div>

                      {/* Preço e Botão Único com Fluxo Oficial da Loja */}
                      <div className="pt-3 mt-auto">
                        <div className="flex items-baseline gap-1.5">
                          {product.isPromo && product.promoPrice ? (
                            <>
                              <span className="text-xs text-neutral-400 line-through font-sans">
                                {product.price}
                              </span>
                              <span className="text-base sm:text-lg font-extrabold text-[#8B233C] tracking-tight">
                                {product.promoPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-base sm:text-lg font-extrabold text-[#8B233C] tracking-tight">
                              {product.price}
                            </span>
                          )}
                          <span className="text-[11px] text-neutral-500 font-medium">no Pix</span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-neutral-400 font-sans">
                          ou até 5x no cartão
                        </p>

                        {/* Botão Oficial Único (Personalizar -> Direciona para detalhes do produto) */}
                        <div className="pt-2.5">
                          <Link
                            to={`/product/${product.id}`}
                            className="inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-[#8B233C] hover:bg-[#A32A47] text-white text-xs font-bold font-sans tracking-wide shadow-sm hover:shadow transition-all active:scale-[0.98] w-fit"
                          >
                            <span>Personalizar</span>
                            <ArrowRight size={13} className="text-white transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* LADO DIREITO: Imagem com Selo Dinâmico MAIS PEDIDO */}
                    <Link
                      to={`/product/${product.id}`}
                      className="w-[125px] min-[400px]:w-[140px] sm:w-[160px] aspect-square shrink-0 rounded-xl sm:rounded-2xl overflow-hidden relative shadow-inner bg-[#FAF7F2] border border-[#EADFCF]/80 block"
                    >
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={`${product.name} - Coleção de Natal Virtual Store`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Gift size={32} />
                        </div>
                      )}

                      {/* Selo Exclusivo MAIS PEDIDO — Somente no produto selecionado via Supabase */}
                      {product.isBestSeller && (
                        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
                          <div className="absolute top-4 right-[-34px] w-36 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider py-0.5 text-center transform rotate-45 shadow-sm">
                            Mais pedido
                          </div>
                        </div>
                      )}
                    </Link>
                  </article>
                );
              })}
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 5. CATÁLOGO COMPLETO POR CATEGORIAS (FUNDO BEGE SUAVE)             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="categorias" className="bg-[#F5EFE6] border-b border-[#EADFCF] py-14 sm:py-20 lg:py-24 px-3 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            
            {/* 5.1 Abertura do Catálogo — Identidade Oficial Virtual Store */}
            <div className="mb-10 sm:mb-12 text-center max-w-2xl mx-auto px-4 select-none">
              
              {/* Identificação Elegante: ESCOLHAS ESPECIAIS com linha ornamental minimalista */}
              <div className="inline-flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-3.5">
                <span className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#8B233C]/60" />
                <span className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-xs font-extrabold tracking-[0.26em] uppercase text-[#8B233C]">
                  <Sparkles size={13} className="text-[#8B233C] shrink-0" />
                  <span>ESCOLHAS ESPECIAIS</span>
                  <Sparkles size={13} className="text-[#8B233C] shrink-0" />
                </span>
                <span className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#8B233C]/60" />
              </div>

              {/* Título Principal Imponente de Boutique */}
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-neutral-900 uppercase tracking-tight leading-[1.08] mb-3 font-sans">
                Catálogo Completo
              </h2>

              {/* Detalhe ornamental sutil abaixo do título */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="h-px w-8 sm:w-12 bg-[#D6BC85]/60" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6BC85]" />
                <span className="h-px w-8 sm:w-12 bg-[#D6BC85]/60" />
              </div>

              {/* Subtítulo acolhedor */}
              <p className="text-[13.5px] sm:text-[15px] text-[#4A3E38] font-normal leading-relaxed tracking-[0.015em] max-w-lg mx-auto">
                Explore nosso catálogo e descubra opções personalizadas, criativas e feitas com muito carinho para surpreender quem você ama.
              </p>
            </div>

            {/* 4.2 Navegação Horizontal por Categorias Principais (Cestas, Mamães e Bebês, Placas, Quadros, Kits, Combos, etc., com Todos no final) */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-1 mb-8 w-full">
              {activeMainCategoriesWithProducts.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    activeCategorySlug === cat.slug
                      ? "bg-[#8B233C] text-white border-[#8B233C] shadow-md scale-[1.02]"
                      : "bg-white text-neutral-700 hover:bg-neutral-50 border-[#EADFCF]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}

              {/* Todos os Produtos colocado elegantemente na última posição do seletor */}
              <button
                onClick={() => setActiveCategorySlug("all")}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  activeCategorySlug === "all"
                    ? "bg-[#8B233C] text-white border-[#8B233C] shadow-md scale-[1.02]"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 border-[#EADFCF]"
                }`}
              >
                Todos os Produtos ({products.length})
              </button>
            </div>

            {/* 4.3 Barra de Busca, Controle & Ordenação */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#EADFCF] pb-4 mb-8 sm:mb-10 text-xs text-neutral-700 px-1">
              {/* Campo de Busca Rápida no Catálogo */}
              <div className="relative w-full md:w-80">
                <input
                  type="search"
                  placeholder="Buscar presentes no catálogo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#EADFCF] rounded-full py-2.5 pl-4 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8B233C] shadow-xs"
                />
                <Search size={16} className="absolute right-3.5 top-3 text-neutral-400 pointer-events-none" />
              </div>

              {/* Informação de Quantidade e Ordenação */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
                <div className="flex items-center gap-1.5">
                  <span>
                    Exibindo <strong className="text-neutral-900 font-bold">{totalCatalogVisibleProducts}</strong> presentes
                    {activeCategorySlug !== "all" && (
                      <> na categoria <strong className="text-[#8B233C] font-bold">
                        {activeMainCategoriesWithProducts.find(c => c.slug === activeCategorySlug)?.name || 
                         (activeCategorySlug === "cestas" ? "Cestas" : activeCategorySlug)}
                      </strong></>
                    )}
                  </span>
                  {(activeCategorySlug !== "all" || searchQuery) && (
                    <button
                      onClick={() => {
                        setActiveCategorySlug("all");
                        setSearchQuery("");
                      }}
                      className="text-[#8B233C] underline hover:text-[#A32A47] font-semibold ml-1 cursor-pointer"
                    >
                      (Ver todos)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="catalog-sort" className="text-neutral-600 font-medium">Ordenar por:</label>
                  <select
                    id="catalog-sort"
                    value={catalogSort}
                    onChange={(e) => setCatalogSort(e.target.value as any)}
                    className="bg-white border border-[#EADFCF] text-neutral-900 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B233C] cursor-pointer"
                  >
                    <option value="featured">Recomendados</option>
                    <option value="low">Menor preço</option>
                    <option value="high">Maior preço</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 8.4 Vitrines Organizadas por Categoria — Identidade Oficial Virtual Store */}
            <div className="space-y-14 sm:space-y-20">
              
              {/* 1. SEÇÃO PRINCIPAL: CESTAS (Visual integrado e padronizado com suporte a carrossel e grid) */}
              {catalogStructure.cestaSubsections.length > 0 && (
                <div id="section-cestas" className="space-y-6">
                  
                  {/* Cabeçalho Padronizado da Seção Cestas */}
                  <BoutiqueSectionHeader
                    eyebrow="COLEÇÃO PRINCIPAL"
                    title="Cestas"
                    subtitle="Cestas artesanais preparadas com carinho em cada detalhe para surpreender e emocionar."
                  />

                  {/* Renderização harmoniosa: Suporta Carrossel e Grid com espaçamento equilibrado de boutique */}
                  {(() => {
                    const hasAnyCarousel = catalogStructure.cestaSubsections.some(
                      (s) => (s.category as any).layout_type === "carousel"
                    );

                    if (hasAnyCarousel) {
                      return (
                        <div className="space-y-6">
                          {catalogStructure.cestaSubsections.map((subsection) => {
                            const isCarousel = (subsection.category as any).layout_type === "carousel";

                            return isCarousel ? (
                              <CategoryCarouselRow 
                                key={subsection.category.id}
                                products={subsection.products} 
                                buttonText="Personalizar"
                              />
                            ) : (
                              <div key={subsection.category.id} className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
                                {subsection.products.map((product) => (
                                  <VirtualStoreProductCard 
                                    key={product.id} 
                                    product={product} 
                                    buttonText="Personalizar"
                                  />
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    // Quando todas as subseções são grid: unifica o fluxo em um grid contínuo
                    // eliminando buracos de linhas incompletas e vácuos de espaçamento desnecessários
                    const seenIds = new Set<string>();
                    const allCestaProducts: Product[] = [];
                    for (const sub of catalogStructure.cestaSubsections) {
                      for (const prod of sub.products) {
                        if (!seenIds.has(prod.id)) {
                          seenIds.add(prod.id);
                          allCestaProducts.push(prod);
                        }
                      }
                    }

                    return (
                      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
                        {allCestaProducts.map((product) => (
                          <VirtualStoreProductCard 
                            key={product.id} 
                            product={product} 
                            buttonText="Personalizar"
                          />
                        ))}
                      </div>
                    );
                  })()}

                </div>
              )}

              {/* 2. DEMAIS CATEGORIAS PRINCIPAIS (Padronização uniforme em 3 produtos por linha como Cestas) */}
              {catalogStructure.otherSections.map((section) => {
                const editorialInfo = getCategoryEditorialInfo(section.category);
                const subtitle = section.category.description || editorialInfo.defaultSubtitle;
                const countBadge = `${section.products.length} ${section.products.length === 1 ? 'presente disponível' : 'presentes disponíveis'}`;

                return (
                  <div key={section.category.id} id={`section-${section.category.slug}`} className="space-y-6">
                    
                    {/* Cabeçalho Padronizado de Categoria da Boutique */}
                    <BoutiqueSectionHeader
                      eyebrow={editorialInfo.eyebrow}
                      title={section.category.name}
                      subtitle={subtitle}
                      countBadge={countBadge}
                    />

                    {/* Grid Padronizado de 3 Produtos por Linha (Seguindo o padrão visual e dimensionamento de Cestas) */}
                    <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-6">
                      {section.products.map((product) => (
                        <VirtualStoreProductCard 
                          key={product.id} 
                          product={product} 
                          buttonText="Personalizar"
                        />
                      ))}
                    </div>

                  </div>
                );
              })}

              {/* Estado Vazio (caso nenhum produto seja retornado na categoria ou na busca) */}
              {totalCatalogVisibleProducts === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#EADFCF] p-8 shadow-sm max-w-lg mx-auto">
                  <Gift size={40} className="mx-auto text-neutral-300 mb-3" />
                  <p className="font-semibold text-neutral-900 mb-1">
                    {searchQuery ? `Nenhum presente encontrado para "${searchQuery}"` : "Nenhum presente disponível nesta categoria"}
                  </p>
                  <p className="text-xs text-neutral-500 mb-4">
                    {searchQuery ? "Tente buscar por outro termo ou explore as outras categorias ativas." : "Explore as outras categorias ativas da nossa boutique artesanal."}
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategorySlug("all");
                      setSearchQuery("");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#8B233C] hover:bg-[#A32A47] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Ver todas as categorias
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>


        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 10. SEÇÃO CORPORATIVA                                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section 
          id="corporativo" 
          className="bg-[#F5EFE6] border-b border-[#EADFCF] py-16 sm:py-24 px-6 sm:px-12 scroll-mt-24"
        >
          {/* Âncora retrocompatível para id="empresas" */}
          <span id="empresas" className="sr-only" aria-hidden="true" />
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
              <li><button onClick={() => scrollTo("destaques")} className="hover:text-[#D6BC85] cursor-pointer">Produtos em Destaque</button></li>
              <li><button onClick={() => scrollTo("categorias")} className="hover:text-[#D6BC85] cursor-pointer">Catálogo Completo</button></li>
              <li><button onClick={() => scrollTo("corporativo")} className="hover:text-[#D6BC85] cursor-pointer">Corporativo & Empresas</button></li>
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
          onClick={() => scrollTo("destaques")}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-600 py-1 cursor-pointer hover:text-[#8B233C]"
        >
          <Sparkles size={17} strokeWidth={1.8} />
          <span>Destaques</span>
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
