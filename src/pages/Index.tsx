import { products, kits } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { InstagramSection } from "@/components/InstagramSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-8">
        
        {/* Top delicate phrase */}
        <div className="text-center mt-2 mb-6">
          <p className="font-cursive text-3xl sm:text-4xl text-store-pink">
            💖 feito pra emocionar quem você ama
          </p>
        </div>

        {/* Kits Section */}
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

        {/* Instagram CTA Section */}
        <InstagramSection />

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
