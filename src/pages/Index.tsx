import { motion } from "framer-motion";
import { Instagram, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
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

export default function Index() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 selection:text-black">
      
      {/* Header Premium */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <button className="p-1.5 text-neutral-800 dark:text-neutral-200 hover:opacity-60 transition-opacity">
          <MoreHorizontal size={22} strokeWidth={1.5} />
        </button>
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-neutral-900 dark:text-white uppercase ml-3">
          Virtual Store
        </span>
        <a href="#" className="p-1.5 text-neutral-800 dark:text-neutral-200 hover:opacity-60 transition-opacity">
          <Instagram size={20} strokeWidth={1.5} />
        </a>
      </header>

      {/* Hero Section Cinematográfica */}
      <section className="relative w-full h-[70vh] sm:h-[80vh] min-h-[500px] flex flex-col items-center justify-center pt-16 overflow-hidden bg-black">
        {/* Background Image Placeholder */}
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 backdrop-blur-[2px]" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full h-full pb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-light text-white tracking-[0.2em] mb-12"
          >
            CATÁLOGO
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[280px] sm:max-w-xl"
          >
            <button 
              onClick={() => scrollToSection('quadros')}
              className="w-full py-3.5 px-6 rounded-full border border-white/40 text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase font-medium hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-md bg-white/5 hover:scale-[1.02]"
            >
              Quadros
            </button>
            <button 
              onClick={() => scrollToSection('kits')}
              className="w-full py-3.5 px-6 rounded-full border border-white/40 text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase font-medium hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-md bg-white/5 hover:scale-[1.02]"
            >
              Kits
            </button>
            <button 
              onClick={() => scrollToSection('combos')}
              className="w-full py-3.5 px-6 rounded-full border border-white/40 text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase font-medium hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-md bg-white/5 hover:scale-[1.02]"
            >
              Combos
            </button>
          </motion.div>
        </div>
      </section>

      <main className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 md:px-8 py-20 sm:py-32 space-y-24 sm:space-y-40">
        
        {/* Section: Coleção Dia dos Namorados */}
        <section id="dia-dos-namorados" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Coleção Dia dos Namorados</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Presentes inesquecíveis para quem você ama</p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.DIA_DOS_NAMORADOS.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>
        
        {/* Section: Produtos (3 items top, 3 items bottom, grid-cols-3) */}
        <section id="produtos" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Produtos</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Coleção principal com curadoria especial</p>
          </div>
          {/* Grid para Produtos */}
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6">
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
          <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.QUADROS_A4.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Quadros 10x15 */}
        <section id="quadros-10x15" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Quadros 10x15</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Pequenos detalhes que encantam o ambiente</p>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.QUADROS_10x15.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Quadros e Placas */}
        <section id="quadros" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Quadros e Placas</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Decoração sofisticada para todos os espaços</p>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.QUADROS_PLACAS.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Kits (4 cols everywhere) */}
        <section id="kits" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2">Kits</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Composições exclusivas criadas por especialistas</p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.KITS.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

        {/* Section: Combos Promocionais */}
        <section id="combos" className="w-full">
          <div className="mb-8 sm:mb-12 px-2 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase mb-2 text-neutral-900 dark:text-white">Combos Promocionais</h2>
            <p className="text-[11px] sm:text-sm text-neutral-500 font-light tracking-wide">Ofertas imperdíveis por tempo limitado</p>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-4 md:gap-6">
            {CATEGORIES.COMBOS.map(product => <MiniCard key={product.id} product={product} />)}
          </div>
        </section>

      </main>

      <footer className="w-full border-t border-black/5 dark:border-white/5 py-16 px-4 flex flex-col items-center justify-center text-center mt-20 bg-white/30 dark:bg-black/30">
        <span className="text-sm font-semibold tracking-[0.3em] mb-4 uppercase">Virtual Store</span>
        <p className="text-xs text-neutral-400 max-w-sm font-light leading-relaxed">
          A excelência em produtos premium, pensados para os clientes mais exigentes.
        </p>
        <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 w-full max-w-xs text-[10px] text-neutral-400">
          © {new Date().getFullYear()} Virtual Store. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
