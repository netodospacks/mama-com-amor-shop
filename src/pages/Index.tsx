import { products, kits } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-8">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-rose-50/50 to-transparent py-8 sm:py-12 rounded-3xl mb-8 flex flex-col items-center text-center px-4 border border-rose-50/80">
          <p className="text-store-pink font-semibold tracking-[0.2em] text-[10px] sm:text-xs mb-3 uppercase">
            Especial Dia das Mães
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display leading-[1.1] tracking-tight max-w-[280px] sm:max-w-md">
            O PRESENTE PERFEITO PARA SURPREENDER SUA MÃE
          </h2>
          <p className="mt-4 text-gray-500 font-medium text-xs sm:text-sm max-w-[250px] sm:max-w-xs leading-relaxed">
            PRODUTOS 100% PERSONALIZADOS DO SEU JEITINHO
          </p>
        </section>
        <section>
          <div className="flex flex-col mb-4">
            <h2 className="text-xl font-bold text-store-dark font-display flex items-center gap-2 mb-1">
              🎁 Kits Especiais
            </h2>
            <p className="text-sm font-medium text-store-pink bg-store-pink/10 px-3 py-1.5 rounded-lg self-start">
              🎁 Os favoritos de quem compra pra presentear 💖
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {kits.map((kit) => (
              <ProductCard key={kit.id} product={kit} />
            ))}
          </div>
        </section>

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-8">
            <h2 className="text-xl font-bold text-store-dark font-display flex items-center gap-2">
              🛍️ Catálogo
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Index;
