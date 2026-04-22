import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 p-4 flex items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-store-light text-store-dark hover:bg-rose-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold ml-4 text-gray-800">Seu Carrinho</h1>
      </div>

      <main className="container max-w-lg mx-auto pt-20 px-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-store-light rounded-full flex items-center justify-center mb-6 text-store-pink">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-8">Parece que você ainda não escolheu nenhum presente fofo.</p>
            <Button 
              onClick={() => navigate("/")}
              className="bg-store-pink hover:bg-store-dark text-white rounded-xl h-12 px-8"
            >
              Voltar para a loja
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <img 
                  src={item.product.image} 
                  alt={item.product.name} 
                  className="w-20 h-20 object-cover rounded-xl bg-gray-50"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-2 pr-2">
                      {item.product.name}
                    </h3>
                    <button 
                      onClick={() => removeItem(item.product.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-store-pink font-bold">
                      R$ {item.product.price.toFixed(2).replace('.', ',')}
                    </p>
                    
                    <div className="flex items-center gap-3 bg-store-light rounded-full px-3 py-1">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-store-dark hover:opacity-70 disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-store-dark hover:opacity-70"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-8 bg-white p-5 rounded-2xl shadow-sm border border-store-light">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg text-gray-900 border-t border-gray-100 pt-3 mt-2">
                <span>Total</span>
                <span className="text-store-pink">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
          <div className="container max-w-lg mx-auto">
            <Button 
              onClick={() => navigate("/checkout")}
              className="w-full bg-store-pink hover:bg-store-dark text-white h-14 rounded-xl font-bold shadow-soft text-lg"
            >
              Ir para Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
