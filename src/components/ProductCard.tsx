import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addItem(product);
  };

  return (
    <div 
      className={`bg-white rounded-xl overflow-hidden flex flex-col h-full cursor-pointer transition-all active:scale-95 ${
        product.isBestSeller 
          ? 'shadow-elegant border-2 border-store-pink relative z-10 scale-[1.03]' 
          : 'shadow-sm border border-store-light hover:shadow-md'
      }`}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {product.isBestSeller && (
          <div className="absolute top-1 left-1 right-1 flex justify-center">
            <span className="bg-store-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm text-center">
              🔥 Mais vendido
            </span>
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col flex-grow">
        <h3 className="text-[11px] font-semibold text-gray-800 leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        {product.isBestSeller && (
          <p className="text-[9px] text-store-pink font-bold mb-1 leading-tight">
            👉 Oferta que mais sai hoje
          </p>
        )}
        
        <p className="text-store-dark font-bold text-xs mb-2 mt-auto">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
        <Button 
          onClick={handleAdd}
          className="w-full bg-store-pink hover:bg-store-dark text-white rounded-lg h-7 text-[10px] font-medium px-0"
        >
          <ShoppingCart className="w-3 h-3 sm:mr-1" />
          <span className="hidden sm:inline">Adicionar</span>
          <span className="sm:hidden ml-1">Add</span>
        </Button>
      </div>
    </div>
  );
}
