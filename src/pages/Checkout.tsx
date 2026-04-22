import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "@/components/LocationPicker";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { toast } from "sonner";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    cidade: "Santa Rita",
    pagamento: "PIX",
    tipoEntrega: "Retirada",
    linkMaps: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (link: string) => {
    setFormData(prev => ({ ...prev, linkMaps: link }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.endereco) {
      toast.error("Por favor, preencha seu nome e endereço.");
      return;
    }

    if (formData.tipoEntrega === "Delivery" && !formData.linkMaps) {
      toast.error("Por favor, informe sua localização para a entrega.");
      return;
    }

    const whatsappLink = generateWhatsAppLink(formData, items, totalPrice);
    
    // Clear cart and redirect
    window.open(whatsappLink, "_blank");
    clearCart();
    navigate("/");
    toast.success("Pedido enviado! 🎉");
  };

  if (items.length === 0) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 p-4 flex items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-store-light text-store-dark hover:bg-rose-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold ml-4 text-gray-800">Finalizar Pedido</h1>
      </div>

      <main className="container max-w-lg mx-auto pt-20 px-4">
        
        <div className="bg-store-pink/10 border border-store-pink/20 rounded-2xl p-4 mb-6 text-center">
          <p className="font-bold text-store-dark text-sm">🎁 Seu presente está quase pronto!</p>
          <p className="text-xs text-gray-600 mt-1">Falta só um passo pra surpreender alguém especial ✨</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 border-b pb-2">Seus Dados</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome completo</label>
              <Input 
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Como devemos te chamar?"
                className="bg-gray-50 rounded-xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Endereço completo</label>
              <Input 
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Rua, número, bairro..."
                className="bg-gray-50 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cidade</label>
                <select 
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-store-pink/50"
                >
                  <option value="Santa Rita">Santa Rita</option>
                  <option value="João Pessoa">João Pessoa</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pagamento</label>
                <select 
                  name="pagamento"
                  value={formData.pagamento}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-store-pink/50"
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 border-b pb-2">Entrega</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de Entrega</label>
              <select 
                name="tipoEntrega"
                value={formData.tipoEntrega}
                onChange={handleChange}
                className="w-full h-10 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-store-pink/50"
              >
                <option value="Retirada">Retirada (Grátis)</option>
                <option value="Delivery">Delivery (Taxa a combinar)</option>
              </select>
            </div>

            {formData.tipoEntrega === "Delivery" && (
              <LocationPicker onLocationChange={handleLocationChange} />
            )}
          </div>
        </form>

      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="container max-w-lg mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="font-medium text-gray-600">Total do pedido:</span>
            <span className="font-bold text-lg text-store-pink">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
          </div>
          <Button 
            onClick={handleSubmit}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white h-14 rounded-xl font-bold shadow-soft text-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Finalizar pelo WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
