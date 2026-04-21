import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

const suggestions = ["Perfumes", "Kits presente", "Promoções", "Cuidados", "Maquiagem"];

export const SearchOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [q, setQ] = useState("");
  const { add } = useCart();

  useEffect(() => {
    if (!open) setQ("");
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const filtered = q
    ? products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background shadow-elegant animate-slide-down max-h-[90vh] overflow-hidden flex flex-col">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-secondary rounded-full px-5 py-4 shadow-soft">
              <Search className="h-5 w-5 text-primary" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="O que você está buscando hoje?"
                className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
              />
            </div>
            <button onClick={onClose} className="p-3 hover:bg-secondary rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!q && (
            <div className="mt-8">
              <p className="text-sm text-muted-foreground mb-3 font-medium">Sugestões para você</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    className="px-4 py-2 rounded-full bg-primary-soft text-primary font-medium text-sm hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && (
            <div className="mt-6 overflow-y-auto max-h-[60vh] -mx-2 px-2">
              {filtered.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Nenhum produto encontrado</p>
              ) : (
                <div className="grid gap-3">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { add(p); onClose(); }}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary transition-colors text-left"
                    >
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                      </div>
                      <p className="text-primary font-semibold">R$ {p.price.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
