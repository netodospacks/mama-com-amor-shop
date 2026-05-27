import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { X, MapPin } from "lucide-react";

const CIDADES = ["Santa Rita", "Bayeux", "João Pessoa"] as const;
type Cidade = typeof CIDADES[number];

const BAIRROS: Record<Cidade, string[]> = {
  "Santa Rita": [
    "Tibiri", "Alto das Populares", "Marcos Moura", "Lerolândia", "Centro", "Municípios", "Heitel Santiago", "Várzea Nova"
  ],
  "Bayeux": [
    "Imaculada", "Centro", "Jardim Aeroporto", "Rio do Meio", "SESI", "Alto da Boa Vista", "Brasília", "Tambaí"
  ],
  "João Pessoa": [
    "Manaíra", "Bessa", "Bancários", "Mangabeira", "Tambaú", "Cabo Branco", "Altiplano", "Castelo Branco", "Torre", "Cristo Redentor", "Geisel"
  ]
};

export function CheckoutStage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, totalPriceFormatted, clearCart } = useCart();
  
  const [nome, setNome] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cidade, setCidade] = useState<Cidade>("Santa Rita");
  const [bairro, setBairro] = useState(BAIRROS["Santa Rita"][0]);

  // Reset bairro when cidade changes
  useEffect(() => {
    setBairro(BAIRROS[cidade][0]);
  }, [cidade]);

  const handleSendOrder = () => {
    if (!nome || !rua || !numero || !bairro) {
      alert("Por favor, preencha todos os campos obrigatórios (Nome, Rua, Número e Bairro).");
      return;
    }

    let message = "Olá, gostaria de fazer este pedido:\n\n";
    
    message += "*PRODUTOS:*\n\n";
    items.forEach(item => {
      message += `*${item.product.name}*\n`;
      message += `Quantidade: ${item.quantity}\n\n`;
    });
    
    message += `*Total: ${totalPriceFormatted}*\n\n`;
    
    message += "*DADOS DO CLIENTE:*\n";
    message += `Nome: ${nome}\n`;
    message += `Rua: ${rua}\n`;
    message += `Número: ${numero}\n`;
    if (complemento) message += `Complemento: ${complemento}\n`;
    message += `Cidade: ${cidade}\n`;
    message += `Bairro: ${bairro}\n\n`;
    message += "_Taxa de entrega a combinar._";

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "5583993032780"; // WhatsApp da loja
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
    
    // Opcional: limpar carrinho após enviar
    // clearCart();
    // onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white dark:bg-[#0A0A0A] rounded-t-3xl shadow-2xl z-[120] flex flex-col sm:max-w-xl sm:mx-auto sm:bottom-4 sm:rounded-3xl border border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <h2 className="text-sm font-medium tracking-widest uppercase flex items-center gap-2">
                <MapPin size={18} />
                Dados de Entrega
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulário */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Nome Completo</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Cidade</label>
                <div className="relative">
                  <select 
                    value={cidade}
                    onChange={e => setCidade(e.target.value as Cidade)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-black dark:focus:border-white transition-colors appearance-none"
                  >
                    {CIDADES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Bairro</label>
                <div className="relative">
                  <select 
                    value={bairro}
                    onChange={e => setBairro(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-black dark:focus:border-white transition-colors appearance-none"
                  >
                    {BAIRROS[cidade].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Rua</label>
                <input 
                  type="text" 
                  value={rua}
                  onChange={e => setRua(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                  placeholder="Nome da sua rua"
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/3 space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Número</label>
                  <input 
                    type="text" 
                    value={numero}
                    onChange={e => setNumero(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                    placeholder="Ex: 123"
                  />
                </div>
                <div className="w-2/3 space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Complemento <span className="opacity-50">(opcional)</span></label>
                  <input 
                    type="text" 
                    value={complemento}
                    onChange={e => setComplemento(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
                    placeholder="Apto, Bloco, etc"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex flex-col items-center justify-center">
                 <span className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-400">Taxa de entrega a combinar</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0A0A0A] shrink-0 rounded-b-3xl">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendOrder}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-xs sm:text-sm font-medium tracking-[0.15em] uppercase shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Enviar Pedido
              </motion.button>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
