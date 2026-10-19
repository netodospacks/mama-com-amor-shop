import { motion, AnimatePresence } from "framer-motion";
import { Instagram, MoreHorizontal, X, ChevronRight, Menu, Gift, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { CATEGORIES, Product } from "@/data/catalog";

const CATEGORY_PILLS = [
  { label: "Cestas", id: "cestas" },
  { label: "Quadros A4", id: "quadros-a4" },
  { label: "Quadros 10x15", id: "quadros-10x15" },
  { label: "Quadros e Placas", id: "quadros" },
  { label: "Kits", id: "kits" },
  { label: "Mamães / Bebês", id: "mamaes-bebes" },
  { label: "Produtos", id: "produtos" },
  { label: "Combos Promocionais", id: "combos" },
];

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
          {/* Placeholder image */}
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
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-rose-600 text-white text-[8px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-sm backdrop-blur-md bg-rose-600/90 uppercase tracking-wider z-10">
              Novidade
            </div>
          )}
        </div>
        
        <div className="px-0.5 mt-auto">
          <h3 className="text-[10px] sm:text-[12px] md:text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate mb-0.5 sm:mb-1 transition-colors group-hover:text-black dark:group-hover:text-white">
            {product.name}
          </h3>
          <p className="text-[10px] sm:text-[12px] md:text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
            {product.price}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

const MENU_ITEMS = [
  { label: "Cestas", id: "cestas" },
  { label: "Quadros A4", id: "quadros-a4" },
  { label: "Quadros 10x15", id: "quadros-10x15" },
  { label: "Quadros e Placas", id: "quadros" },
  { label: "Kits", id: "kits" },
  { label: "Mamães / Bebês", id: "mamaes-bebes" },
  { label: "Produtos", id: "produtos" },
  { label: "Combos Promocionais", id: "combos" },
];

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("cestas");
  const pillsContainerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    setActiveCategory(id);
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const offset = window.innerWidth < 768 ? 65 : 75;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = CATEGORY_PILLS.length - 1; i >= 0; i--) {
        const item = CATEGORY_PILLS[i];
        const el = document.getElementById(item.id);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveCategory(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pillsContainerRef.current) {
      const activeButton = pillsContainerRef.current.querySelector<HTMLButtonElement>(`[data-pill-id="${activeCategory}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 selection:text-black">
      
      {/* Menu Lateral (Compartilhado) */}
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
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full text-left px-6 py-4 text-sm font-medium tracking-widest uppercase text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition-all border-b border-neutral-50 dark:border-neutral-900"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="px-6 py-5 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* CABEÇALHO E HERO PRINCIPAL LUXURY (MODELO VISUAL)          */}
      {/* ========================================================== */}
      <section className="relative w-full overflow-hidden bg-[#0A0A0A]">
        {/* Fundo fotográfico original da loja (termina exatamente após Santa Rita / Região) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <img
            src="/hero-bg.jpg"
            alt="Virtual Store Presentes Personalizados"
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay escuro elegante para máxima legibilidade dos textos e detalhes dourados */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/95" />
          {/* Transição suave para a seção dos cards de categorias que fica fora da imagem */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        </div>

        {/* Barra Superior: Menu (3 linhas) + Marca Central + Instagram */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 pt-3.5 pb-2 flex items-center justify-between">
          {/* Menu de três linhas no canto superior esquerdo */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir Menu"
            className="p-2 text-white/90 hover:text-white active:scale-90 transition-transform -ml-1 rounded-full focus:outline-none"
          >
            <Menu size={22} strokeWidth={1.8} />
          </button>

          {/* Marca VIRTUAL STORE centralizada com ícone de presente */}
          <div className="flex flex-col items-center justify-center text-center">
            <Gift size={20} strokeWidth={1.5} className="text-[#E5C378] mb-0.5 drop-shadow-[0_2px_8px_rgba(229,195,120,0.35)]" />
            <span className="text-[13px] sm:text-sm font-semibold tracking-[0.28em] text-white uppercase leading-none font-sans drop-shadow-sm">
              VIRTUAL STORE
            </span>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className="h-[1px] w-3.5 bg-[#E5C378]/70" />
              <span className="text-[8px] sm:text-[8.5px] font-light tracking-[0.24em] text-[#E5C378] uppercase">
                PRESENTES PERSONALIZADOS
              </span>
              <span className="h-[1px] w-3.5 bg-[#E5C378]/70" />
            </div>
          </div>

          {/* Ícone do Instagram no canto superior direito */}
          <a
            href="https://instagram.com/larissagouveiaaa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da loja"
            className="p-2 text-white/90 hover:text-white active:scale-90 transition-transform -mr-1 rounded-full focus:outline-none"
          >
            <Instagram size={20} strokeWidth={1.8} />
          </a>
        </div>

        {/* Apresentação da Marca (A imagem termina exatamente após estas informações) */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 sm:pt-10 pb-10 sm:pb-14 flex flex-col items-center text-center">
          {/* CATÁLOGO EXCLUSIVO */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-[1px] w-4 bg-[#E5C378]/60" />
            <span className="text-[9.5px] sm:text-[10.5px] tracking-[0.35em] text-[#E5C378] font-light uppercase">
              CATÁLOGO EXCLUSIVO
            </span>
            <span className="h-[1px] w-4 bg-[#E5C378]/60" />
          </div>

          {/* Transforme sentimentos em presentes inesquecíveis */}
          <h1 className="font-serif text-[22px] sm:text-[28px] md:text-[32px] font-normal text-white tracking-wide leading-snug max-w-md mx-auto mb-3.5 drop-shadow-md">
            Transforme sentimentos em presentes inesquecíveis
          </h1>

          {/* Santa Rita, João Pessoa e Região */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-[#E5C378]/25 shadow-sm">
            <MapPin size={12} className="text-[#E5C378] shrink-0" />
            <span className="text-[10.5px] sm:text-xs font-light text-neutral-200 tracking-wider">
              Santa Rita, João Pessoa e Região
            </span>
          </div>

          {/* Botão Falar no WhatsApp */}
          <a
            href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#1ebd5b] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_25px_rgba(37,211,102,0.6)] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
          >
            <WhatsAppIcon size={18} className="text-white shrink-0" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </section>

      {/* 2. Barra de Categorias Horizontal Deslizante (Pills / Chips) */}
      <nav 
        aria-label="Navegação por categorias"
        className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-y border-[#E5C378]/25 py-2.5 sm:py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        <div className="relative max-w-6xl mx-auto px-2 sm:px-4">
          {/* Sombras suaves nas laterais para indicar rolagem fluida */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />

          {/* Lista com rolagem horizontal suave */}
          <div 
            ref={pillsContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-4 sm:px-2 scroll-smooth"
          >
            {CATEGORY_PILLS.map((pill) => {
              const isActive = activeCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  data-pill-id={pill.id}
                  onClick={() => scrollToSection(pill.id)}
                  className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-200 border whitespace-nowrap active:scale-95 flex items-center gap-1.5 focus:outline-none ${
                    isActive
                      ? "bg-[#E5C378] text-[#0A0A0A] border-[#E5C378] shadow-[0_2px_12px_rgba(229,195,120,0.45)] font-semibold"
                      : "bg-[#141414] text-neutral-300 hover:text-white border-[#E5C378]/25 hover:border-[#E5C378]/60 hover:bg-[#1c1c1c]"
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] shrink-0" />
                  )}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>


      <main className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 md:px-8 pt-4 pb-20 md:py-32 space-y-14 md:space-y-40">
        
        {/* Section: Cestas */}
        <section id="cestas" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Cestas</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Cestas personalizadas com muito carinho</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.CESTAS.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Quadros A4 */}
        <section id="quadros-a4" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Quadros A4</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Elegância em formato clássico</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.QUADROS_A4.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Quadros 10x15 */}
        <section id="quadros-10x15" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Quadros 10x15</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Pequenos detalhes que encantam o ambiente</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.QUADROS_10x15.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Quadros e Placas */}
        <section id="quadros" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Quadros e Placas</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Decoração sofisticada para todos os espaços</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.QUADROS_PLACAS.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Kits */}
        <section id="kits" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Kits</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Composições exclusivas criadas por especialistas</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.KITS.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Mamães / Bebês */}
        <section id="mamaes-bebes" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Mamães / Bebês</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Presentes especiais para mamãe e bebê</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.MAMAES_BEBES.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Produtos */}
        <section id="produtos" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Produtos</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Coleção principal com curadoria especial</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.PRODUTOS.map(product => (
              <div key={product.id} className="scale-[1.02] sm:scale-100">
                <MiniCard product={product} />
              </div>
            ))}
          </div>
        </section>

        {/* Section: Combos Promocionais */}
        <section id="combos" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2 text-neutral-900 dark:text-white">Combos Promocionais</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Ofertas imperdíveis por tempo limitado</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.COMBOS.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

      </main>

      <footer className="w-full border-t border-black/5 dark:border-white/5 py-16 px-4 flex flex-col items-center justify-center text-center mt-20 bg-white/30 dark:bg-black/30">
        <span className="text-sm font-semibold tracking-[0.3em] mb-4 uppercase">Eternizando Momentos</span>
        <p className="text-xs text-neutral-400 max-w-sm font-light leading-relaxed">
          A excelência em produtos premium, pensados para os clientes mais exigentes.
        </p>
        <a
          href="https://wa.me/5583993032780?text=Ol%C3%A1%2C%20gostaria%20de%20um%20atendimento%20pelo%20WhatsApp!"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
        >
          <WhatsAppIcon size={18} className="text-white shrink-0" />
          <span>Atendimento WhatsApp</span>
        </a>
        <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 w-full max-w-xs text-[10px] text-neutral-400">
          © {new Date().getFullYear()} Eternizando Momentos. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
