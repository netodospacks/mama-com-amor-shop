import { ShoppingCart, CreditCard, Banknote, Wallet, Smartphone, Instagram } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { VSBrandMark } from "@/components/VSBrandMark";

export function Header() {
  const { totalItems } = useCart();

  return (
    <div className="sticky top-0 z-50 flex flex-col">
      {/* Animated Offer Bar */}
      <div className="bg-store-pink text-white text-center py-2 px-4 shadow-sm overflow-hidden">
        <p className="text-[11px] sm:text-xs font-bold tracking-wider uppercase animate-pulse">
          🎉 Garanta 10% de desconto no WhatsApp (Por tempo limitado)
        </p>
      </div>

      {/* Main Header */}
      <header className="bg-white py-3 px-4 shadow-sm border-b border-gray-100">
        <div className="container max-w-lg mx-auto flex justify-between items-center">
          <Link to="/">
            <VSBrandMark size="sm" variant="horizontal" subtitle="PRESENTES PERSONALIZADOS" />
          </Link>
          
          <div className="flex items-center gap-2 shrink-0">
            <a 
              href="https://instagram.com/virtualstore_3" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram @virtualstore_3"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors shrink-0"
            >
              <Instagram className="w-5 h-5 text-gray-800" />
            </a>

            <Link 
              to="/cart" 
              aria-label="Sacola de Compras"
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors shrink-0"
            >
              <ShoppingCart className="w-5 h-5 text-gray-800" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-store-pink text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Payment Methods Bar */}
      <div className="bg-gray-50 py-2 border-b border-gray-100">
        <div className="container max-w-lg mx-auto flex justify-center items-center gap-3 text-[10px] text-gray-500 font-medium">
          <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Crédito</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Débito</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Pix</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Banknote className="w-3 h-3" /> Espécie</span>
        </div>
      </div>
    </div>
  );
}
