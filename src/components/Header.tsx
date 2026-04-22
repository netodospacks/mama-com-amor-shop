import { MapPin, CreditCard, Gift, ShoppingCart, Truck, Heart, Flame } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="bg-store-light py-4 px-4 shadow-sm sticky top-0 z-50">
      <div className="container max-w-lg mx-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-store-dark font-display flex items-center gap-2">
              Virtual Store 🎁
            </h1>
            <p className="text-store-pink text-sm mb-3">@virtualstore_3</p>
            
            <div className="space-y-1 mb-4">
              <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-store-pink fill-store-pink" />
                O presente perfeito pra surpreender quem você ama
              </p>
              <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                Produtos personalizados que encantam na hora
              </p>
            </div>
          </div>
          
          <Link to="/cart" className="relative p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow shrink-0 mt-1">
            <ShoppingCart className="w-6 h-6 text-store-dark" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-store-pink text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm text-gray-700 bg-white p-3.5 rounded-xl shadow-sm border border-store-light">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-store-pink shrink-0" />
            <span>Retirada em Santa Rita e João Pessoa</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-store-pink shrink-0" />
            <span>Entrega rápida disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-store-pink shrink-0" />
            <span>Pagamento facilitado</span>
          </div>
          <div className="flex items-center gap-2 bg-store-pink/10 p-2 -mx-1.5 rounded-lg">
            <Gift className="w-4 h-4 text-store-dark shrink-0" />
            <span className="font-bold text-store-dark">Garanta 10% de desconto no WhatsApp (por tempo limitado) 🎉</span>
          </div>
        </div>
      </div>
    </header>
  );
}
