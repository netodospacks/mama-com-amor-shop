import { products, kits } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-8">
        
        {/* Banner/Hero area optional */}
        <div className="bg-gradient-to-r from-store-pink to-store-dark rounded-2xl p-6 text-white shadow-soft relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-display font-bold mb-2">Presentes com Amor</h2>
            <p className="text-sm opacity-90">Personalize do seu jeito e surpreenda quem você ama! ✨</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <div className="absolute right-8 -top-8 w-16 h-16 bg-white opacity-10 rounded-full blur-md"></div>
        </div>

        {/* Kits Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-store-dark font-display flex items-center gap-2">
              🎁 Kits Especiais
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
