import { motion, AnimatePresence } from "framer-motion";
import { Instagram, MoreHorizontal, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { CATEGORIES, Product } from "@/data/catalog";

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
  { label: "Dia dos Pais", id: "dia-dos-pais" },
  { label: "Produtos", id: "produtos" },
  { label: "Quadros A4", id: "quadros-a4" },
  { label: "Quadros 10x15", id: "quadros-10x15" },
  { label: "Quadros e Placas", id: "quadros" },
  { label: "Kits", id: "kits" },
  { label: "Combos Promocionais", id: "combos" },
];

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 selection:text-black">
      
      {/* Header Premium */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => setMenuOpen(true)}
          className="p-1.5 text-neutral-800 dark:text-neutral-200 hover:opacity-60 transition-opacity"
        >
          <MoreHorizontal size={22} strokeWidth={1.5} />
        </button>
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-neutral-900 dark:text-white uppercase ml-3">
          Virtual Store
        </span>
        <a
          href="https://instagram.com/larissagouveiaaa"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-neutral-800 dark:text-neutral-200 hover:opacity-60 transition-opacity"
        >
          <Instagram size={20} strokeWidth={1.5} />
        </a>
      </header>

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
              <div className="px-6 py-5 border-t border-neutral-100 dark:border-neutral-800">
                <a
                  href="https://instagram.com/larissagouveiaaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Instagram size={18} strokeWidth={1.5} />
                  <span className="tracking-wider">@larissagouveiaaa</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section com Vídeo */}
      <section className="relative w-full h-screen min-h-[600px] flex flex-col items-center justify-center overflow-hidden bg-black">
        {/* Background Image */}
        <img
          src="/dia-dos-pais-bg.jpg"
          alt="Dia dos Pais"
          className="absolute inset-0 w-full h-full object-cover opacity-75"
        />
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full h-full pt-20 pb-10">
          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-[9px] sm:text-[11px] uppercase font-light text-white/80 tracking-[0.45em] mb-5"
          >
            Catálogo Exclusivo
          </motion.span>

          {/* Título principal */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-extralight text-white tracking-[0.2em] mb-4 uppercase leading-tight"
          >
            Eternizando
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl sm:text-3xl md:text-4xl font-thin text-white/70 tracking-[0.35em] uppercase mb-8"
          >
            Momentos
          </motion.h2>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ duration: 1.2, delay: 0.35, ease: "easeOut" }}
            className="text-xs sm:text-sm font-light text-white/70 tracking-wider max-w-xs sm:max-w-sm mb-12 leading-relaxed"
          >
            Presentes personalizados feitos com carinho e exclusividade para quem você ama.
          </motion.p>

          {/* Botões verticais em cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col w-full max-w-[260px] sm:max-w-xs gap-2.5"
          >
            {[
              { label: "Dia dos Pais", id: "dia-dos-pais", desc: "Presentes inesquecíveis para o seu herói" },
              { label: "Quadros", id: "quadros-a4", desc: "A4, 10x15 e placas decorativas" },
              { label: "Kits", id: "kits", desc: "Composições exclusivas" },
              { label: "Produtos", id: "produtos", desc: "Itens avulsos personalizados" },
              { label: "Combos Promocionais", id: "combos", desc: "Ofertas imperdíveis" },
            ].map((btn, i) => (
              <motion.button
                key={btn.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.55 + i * 0.08, ease: "easeOut" }}
                onClick={() => scrollToSection(btn.id)}
                className="group flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/8 backdrop-blur-md border border-white/15 text-white hover:bg-white hover:text-black transition-all duration-300 hover:border-white hover:shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase leading-none mb-0.5">{btn.label}</span>
                  <span className="text-[9px] sm:text-[10px] font-light tracking-wide opacity-60 group-hover:opacity-50 leading-none">{btn.desc}</span>
                </div>
                <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      <main className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 md:px-8 py-20 sm:py-32 space-y-24 sm:space-y-40">
        
        {/* Section: Coleção Dia dos Pais */}
        <section id="dia-dos-pais" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Coleção Dia dos Pais</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Presentes inesquecíveis para o seu herói</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.DIA_DOS_PAIS.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>
        
        {/* Section: Produtos (3 items top, 3 items bottom, grid-cols-3) */}
        <section id="produtos" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Produtos</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Coleção principal com curadoria especial</p>
          </div>
          {/* Grid para Produtos */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.PRODUTOS.map(product => (
              <div key={product.id} className="scale-[1.02] sm:scale-100">
                <MiniCard product={product} />
              </div>
            ))}
          </div>
        </section>

        {/* Section: Quadros A4 (5 cols mobile, 4 tablet, 5 desktop) */}
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

        {/* Section: Kits (4 cols everywhere) */}
        <section id="kits" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Kits</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Composições exclusivas criadas por especialistas</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.KITS.map(product => <MiniCard key={product.id} product={product} />)}
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
        <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 w-full max-w-xs text-[10px] text-neutral-400">
          © {new Date().getFullYear()} Eternizando Momentos. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
