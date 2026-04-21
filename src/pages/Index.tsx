import { useState } from "react";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchOverlay } from "@/components/SearchOverlay";
import { CartDrawer } from "@/components/CartDrawer";
import { SocialProof } from "@/components/SocialProof";

const Index = () => {
  const [search, setSearch] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Header onSearch={() => setSearch(true)} />
        <main>
          <HeroBanner />
          <SocialProof />
          <ProductGrid />
          <footer className="container py-10 text-center text-sm text-muted-foreground">
            <p className="font-display text-lg text-primary mb-2">Mães & Flores 💖</p>
            <p>Pedidos via WhatsApp • Retirada em Santa Rita ou Manaíra Shopping</p>
          </footer>
        </main>
        <SearchOverlay open={search} onClose={() => setSearch(false)} />
        <CartDrawer />
      </div>
    </CartProvider>
  );
};

export default Index;
