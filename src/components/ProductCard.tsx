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
      className="bg-white rounded-2xl shadow-sm border border-store-light overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-md transition-all active:scale-95"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {product.isBestSeller && (
          <div className="absolute top-2 left-2 bg-store-dark text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            ⭐ Mais Vendido
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-store-dark font-bold text-sm mb-3 mt-auto">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
        <Button 
          onClick={handleAdd}
          className="w-full bg-store-pink hover:bg-store-dark text-white rounded-xl h-8 text-xs font-medium"
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
