import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const ProductGrid = () => {
  const { add } = useCart();

  return (
    <section className="container py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">Coleção Especial</h2>
          <p className="text-muted-foreground text-sm mt-1">Selecionados para encantar</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((p, i) => (
          <article
            key={p.id}
            className="group bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative aspect-square overflow-hidden gradient-rose">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                width={768}
                height={768}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {p.badge && (
                <span className="absolute top-3 left-3 bg-gold text-gold-foreground text-xs font-bold px-3 py-1 rounded-full shadow-gold">
                  {p.badge}
                </span>
              )}
            </div>
            <div className="p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-gold font-semibold">{p.category}</p>
              <h3 className="font-medium text-sm sm:text-base line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="font-display text-lg font-bold text-primary">
                  R$ {p.price.toFixed(2).replace(".", ",")}
                </span>
                <button
                  onClick={() => { add(p); toast.success("Adicionado!", { description: p.name }); }}
                  className="p-2.5 gradient-premium text-primary-foreground rounded-full shadow-soft hover:scale-110 active:scale-95 transition-transform"
                  aria-label="Adicionar"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
