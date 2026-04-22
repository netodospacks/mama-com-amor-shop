import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "@/components/LocationPicker";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { toast } from "sonner";

const BAIRROS_POR_CIDADE: Record<string, string[]> = {
  "Santa Rita": [
    "Tibiri", "Marcos Moura", "Várzea Nova", "Alto das Populares", 
    "Centro", "Jardim Planalto", "Popular", "Livramento"
  ],
  "Bayeux": [
    "Centro", "Imaculada", "SESI", "Sesi Industrial", 
    "Alto da Boa Vista", "Mário Andreazza", "São Bento", "Jardim Aeroporto"
  ],
  "João Pessoa": [
    "Mangabeira", "Valentina", "Bancários", "Geisel", "Cristo", 
    "Torre", "Tambaú", "Manaíra", "Bessa", "Jaguaribe", 
    "Cruz das Armas", "Altiplano"
  ]
};

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: "",
    cidade: "Santa Rita",
    bairro: "Tibiri",
    tipoEntrega: "Retirada",
    linkMaps: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "cidade") {
      setFormData(prev => ({
        ...prev,
        cidade: value,
        bairro: BAIRROS_POR_CIDADE[value][0] // Auto-select first bairro
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationChange = (link: string) => {
    setFormData(prev => ({ ...prev, linkMaps: link }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome) {
      toast.error("Por favor, preencha seu nome.");
      return;
    }

    if (formData.tipoEntrega === "Delivery" && !formData.linkMaps) {
      toast.error("Por favor, informe sua localização exata para a entrega.");
      return;
    }

    const whatsappLink = generateWhatsAppLink(formData, items, totalPrice);
    
    window.open(whatsappLink, "_blank");
    clearCart();
    navigate("/");
    toast.success("Pedido gerado! Conclua o envio no WhatsApp. 🎉");
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
          <p className="font-bold text-store-dark text-[15px]">💖 Rapidinho! Só precisamos dessas infos pra garantir sua entrega certinha</p>
          <p className="text-xs text-gray-600 mt-2">Dica: Me manda o número da casa e forma de pagamento lá no WhatsApp 😊</p>
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
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cidade</label>
                <select 
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-store-pink/50"
                >
                  {Object.keys(BAIRROS_POR_CIDADE).map(cidade => (
                    <option key={cidade} value={cidade}>{cidade}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bairro</label>
                <select 
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-store-pink/50"
                >
                  {BAIRROS_POR_CIDADE[formData.cidade]?.map(bairro => (
                    <option key={bairro} value={bairro}>{bairro}</option>
                  ))}
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
