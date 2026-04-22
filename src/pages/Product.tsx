import { useParams, useNavigate } from "react-router-dom";
import { allProducts } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ShoppingCart, Info } from "lucide-react";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const product = allProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">Produto não encontrado</h2>
        <Button onClick={() => navigate("/")}>Voltar para o Catálogo</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header com botão de voltar */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 p-4 flex items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-store-light text-store-dark hover:bg-rose-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold ml-4 text-gray-800 line-clamp-1">{product.name}</h1>
      </div>

      <main className="container max-w-lg mx-auto pt-20">
        <div className="bg-white rounded-b-3xl shadow-sm overflow-hidden mb-6">
          <div className="aspect-square w-full bg-gray-100">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            {product.isBestSeller && (
              <span className="inline-block bg-store-dark text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                ⭐ MAIS VENDIDO
              </span>
            )}
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">{product.name}</h2>
            <p className="text-3xl font-bold text-store-pink mb-4">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="bg-store-light rounded-2xl p-4 mb-6">
              <h3 className="font-bold text-sm text-store-dark flex items-center gap-2 mb-3">
                <Info className="w-4 h-4" />
                O que acompanha:
              </h3>
              <ul className="space-y-2">
                {product.includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Personalização:</strong> Após finalizar o pedido no WhatsApp, solicitaremos as fotos e informações para personalizar o seu produto! ✨
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Adding to Cart */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="container max-w-lg mx-auto flex gap-3">
          <Button 
            onClick={() => {
              addItem(product);
              navigate("/cart");
            }}
            className="flex-1 bg-store-pink hover:bg-store-dark text-white h-14 rounded-xl font-bold shadow-soft text-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </div>
  );
}
