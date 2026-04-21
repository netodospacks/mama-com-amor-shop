import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { CheckoutDialog } from "./CheckoutDialog";

export const CartDrawer = () => {
  const { items, isOpen, setOpen, inc, dec, remove, total } = useCart();
  const [checkout, setCheckout] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="font-display text-2xl">Seu Carrinho</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <div className="p-6 bg-primary-soft rounded-full">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <p className="font-medium">Seu carrinho está vazio</p>
              <p className="text-sm text-muted-foreground">Adicione produtos especiais para a mamãe.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map((i) => (
                  <div key={i.id} className="flex gap-3 p-3 bg-secondary/50 rounded-2xl">
                    <img src={i.image} alt={i.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1 flex flex-col">
                      <p className="font-medium text-sm line-clamp-2">{i.name}</p>
                      <p className="text-primary font-bold text-sm mt-1">R$ {i.price.toFixed(2)}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-background rounded-full p-1">
                          <button onClick={() => dec(i.id)} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{i.quantity}</span>
                          <button onClick={() => inc(i.id)} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => remove(i.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t bg-background space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <button
                  onClick={() => setCheckout(true)}
                  className="w-full py-4 gradient-premium text-primary-foreground font-semibold rounded-full shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  Finalizar pedido
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog open={checkout} onClose={() => setCheckout(false)} />
    </>
  );
};
