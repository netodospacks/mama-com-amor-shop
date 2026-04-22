import { MapPin, CreditCard, Gift, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="bg-store-light py-4 px-4 shadow-sm sticky top-0 z-50">
      <div className="container max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-store-dark font-display">Virtual Store</h1>
            <p className="text-store-pink text-sm">@virtualstore_3</p>
          </div>
          <Link to="/cart" className="relative p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
            <ShoppingCart className="w-6 h-6 text-store-dark" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-store-pink text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        <div className="space-y-2 text-sm text-gray-700 bg-white p-3 rounded-xl shadow-sm border border-store-light">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-store-pink" />
            <span>Retirada em Santa Rita e João Pessoa</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-store-pink" />
            <span>Aceitamos todas as formas de pagamento</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-store-pink" />
            <span className="font-medium text-store-dark">Fechando pelo WhatsApp ganha 10% de desconto 🎉</span>
          </div>
        </div>
      </div>
    </header>
  );
}
