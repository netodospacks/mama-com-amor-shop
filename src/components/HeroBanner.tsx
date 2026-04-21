import { heroProduct } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Sparkles } from "lucide-react";

export const HeroBanner = () => {
  const { add } = useCart();
  return (
    <section className="container py-6 sm:py-10">
      <div className="relative overflow-hidden rounded-3xl gradient-hero shadow-elegant">
        <div className="grid sm:grid-cols-2 gap-6 items-center p-6 sm:p-10">
          <div className="order-2 sm:order-1 space-y-4">
            <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              💖 Produto mais pedido do Dia das Mães
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-foreground">
              {heroProduct.name}
            </h1>
            <p className="text-muted-foreground">{heroProduct.description}</p>
            <div className="flex items-baseline gap-3">
              <span className="text-sm text-muted-foreground line-through">R$ 249,90</span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-primary">
                R$ {heroProduct.price.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <button
              onClick={() => add(heroProduct)}
              className="w-full sm:w-auto px-8 py-4 gradient-premium text-primary-foreground font-semibold rounded-full shadow-elegant hover:scale-105 transition-transform duration-300"
            >
              Comprar agora
            </button>
          </div>
          <div className="order-1 sm:order-2 relative">
            <div className="absolute inset-0 gradient-gold opacity-20 blur-3xl rounded-full" />
            <img
              src={heroProduct.image}
              alt={heroProduct.name}
              width={1024}
              height={1024}
              className="relative w-full h-auto max-h-[400px] object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
