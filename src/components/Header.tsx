import { Search, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const Header = ({ onSearch }: { onSearch: () => void }) => {
  const { count, setOpen } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-display text-xl font-semibold tracking-tight">Mães & Flores</span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="relative p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center animate-bounce-subtle">
                {count}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onSearch}
          className="w-full flex items-center gap-3 bg-secondary hover:bg-primary-soft transition-colors rounded-full px-5 py-3.5 shadow-soft text-left group"
        >
          <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-muted-foreground text-sm sm:text-base">O que você está buscando hoje?</span>
        </button>
      </div>
    </header>
  );
};
