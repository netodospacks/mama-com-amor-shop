import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { X, MapPin, Sparkles, ShoppingBag, ShieldCheck } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { VSBrandMark } from "@/components/VSBrandMark";
import { CATEGORIES } from "@/data/catalog";
import { toast } from "sonner";

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

const CATEGORY_LABELS: Record<string, string> = {
  DIA_DOS_NAMORADOS: "Dia dos Namorados",
  PRODUTOS: "Produtos",
  QUADROS_A4: "Quadros A4",
  QUADROS_10x15: "Quadros 10x15",
  QUADROS_PLACAS: "Quadros e Placas",
  KITS: "Kits",
  COMBOS: "Combos Promocionais",
  MAES: "Dia das Mães",
};

function getCategoryForProduct(productId: string): string {
  for (const [key, products] of Object.entries(CATEGORIES)) {
    if (products.some((p) => p.id === productId)) {
      return CATEGORY_LABELS[key] ?? key;
    }
  }
  return "Outros";
}

export function CheckoutStage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, totalPriceFormatted, clearCart, formaPagamento, setFormaPagamento } = useCart();
  
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState<Cidade>("Santa Rita");
  const [bairro, setBairro] = useState(BAIRROS["Santa Rita"][0]);
  const [observacoes, setObservacoes] = useState("");
  const [paymentError, setPaymentError] = useState(false);

  // Reset bairro quando a cidade muda
  useEffect(() => {
    setBairro(BAIRROS[cidade][0]);
  }, [cidade]);

  const handleSendOrder = () => {
    if (!nome.trim()) {
      toast.error("Por favor, preencha seu Nome.");
      return;
    }

    if (!formaPagamento) {
      setPaymentError(true);
      toast.error("Por favor, selecione a forma de pagamento (PIX ou CARTÃO).");
      return;
    }

    let message = "*PEDIDO — VIRTUAL STORE* 🛍️\n\n";
    
    message += "*ITENS DO PEDIDO:*\n\n";
    items.forEach(item => {
      const categoria = item.product.categoryName || getCategoryForProduct(item.product.id);
      const isOnPromo = item.product.isPromo && item.product.promoPrice;
      const priceStr = isOnPromo
        ? `${item.product.promoPrice} (promoção, antes: ${item.product.price})`
        : item.product.price;
        
      message += `• ${item.quantity}x ${item.product.name} — ${priceStr}\n`;
      message += `  Categoria: ${categoria}\n`;
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        message += `  Adicionais:\n`;
        item.selectedAddons.forEach(addon => {
          const addonPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(addon.price);
          message += `  - ${addon.name} (+ ${addonPrice})\n`;
        });
      }
      message += `\n`;
    });
    
    message += `*Total: ${totalPriceFormatted}*\n`;
    message += `*Forma de pagamento:* ${formaPagamento}\n\n`;
    
    message += "*DADOS DO CLIENTE:*\n";
    message += `Nome: ${nome}\n`;
    message += `Cidade: ${cidade}\n`;
    message += `Bairro: ${bairro}\n`;
    if (observacoes) message += `Observações / Dedicatória: ${observacoes}\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "5583993032780";
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
    clearCart();
    onClose();
    toast.success("Pedido pronto! Conclua o envio no WhatsApp. 🎉");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Escuro com Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
          />

          {/* Modal Deslizante Sublime */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-h-[92vh] bg-white rounded-t-3xl shadow-2xl z-[120] flex flex-col sm:max-w-xl sm:mx-auto sm:bottom-4 sm:rounded-3xl border border-neutral-200"
          >
            {/* Header Boutique com Assinatura */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-2">
                <VSBrandMark size="sm" variant="horizontal" subtitle="Finalizar Pedido" />
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-black"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#faf8f6]">
              
              {/* Título Editorial */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c41535] flex items-center gap-1.5">
                  <Sparkles size={12} />
                  <span>Confira seu pedido</span>
                </span>
                <h2 className="font-serif text-2xl font-bold text-neutral-900">
                  Finalizar Pedido
                </h2>
              </div>

              {/* 1. Seus Dados */}
              <fieldset className="border border-neutral-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-3.5">
                <legend className="font-serif text-base font-semibold text-neutral-900 px-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-sans font-bold flex items-center justify-center">1</span>
                  <span>Seus Dados</span>
                </legend>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-600 font-semibold">
                    Nome Completo *
                  </label>
                  <input 
                    type="text" 
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full bg-[#faf8f6] border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neutral-900 focus:bg-white transition-all text-neutral-900"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-600 font-semibold">Cidade *</label>
                    <div className="relative">
                      <select 
                        value={cidade}
                        onChange={e => setCidade(e.target.value as Cidade)}
                        className="w-full bg-[#faf8f6] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-neutral-900 focus:bg-white transition-all appearance-none cursor-pointer text-neutral-900"
                      >
                        {CIDADES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">▼</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-600 font-semibold">Bairro *</label>
                    <div className="relative">
                      <select 
                        value={bairro}
                        onChange={e => setBairro(e.target.value)}
                        className="w-full bg-[#faf8f6] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-neutral-900 focus:bg-white transition-all appearance-none cursor-pointer text-neutral-900"
                      >
                        {BAIRROS[cidade].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">▼</span>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* 2. Dedicatória & Observações */}
              <fieldset className="border border-neutral-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-3">
                <legend className="font-serif text-base font-semibold text-neutral-900 px-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-sans font-bold flex items-center justify-center">2</span>
                  <span>Dedicatória / Observações</span>
                </legend>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-600 font-semibold">
                    Observações de personalização
                  </label>
                  <textarea 
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    rows={2}
                    className="w-full bg-[#faf8f6] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-neutral-900 focus:bg-white transition-all text-neutral-900 resize-none"
                    placeholder="Ex.: Gostaria de adicionar o nome Maria no cartão..."
                  />
                </div>
              </fieldset>

              {/* 3. Forma de Pagamento */}
              <fieldset className="border border-neutral-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-3">
                <legend className="font-serif text-base font-semibold text-neutral-900 px-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-sans font-bold flex items-center justify-center">3</span>
                  <span>Forma de Pagamento</span>
                </legend>

                <PaymentMethodSelector 
                  value={formaPagamento} 
                  onChange={(method) => {
                    setFormaPagamento(method);
                    setPaymentError(false);
                  }}
                  error={paymentError}
                />
              </fieldset>

              {/* Resumo Sublime */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Itens no Pedido:</span>
                  <span className="font-semibold text-neutral-900">
                    {items.reduce((acc, i) => acc + i.quantity, 0)} presente(s)
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Pagamento:</span>
                  <span className={`font-semibold ${formaPagamento ? "text-neutral-900" : "text-amber-600"}`}>
                    {formaPagamento || "Selecione acima"}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-neutral-100 text-sm">
                  <span className="font-semibold text-neutral-700 uppercase tracking-wider text-xs">Total</span>
                  <span className="text-xl font-bold font-serif text-neutral-900">{totalPriceFormatted}</span>
                </div>
              </div>

              {/* Aviso Artesanal */}
              <div className="rounded-xl bg-[#fdf2f4] border border-[#fecdd3] p-3 text-xs text-neutral-700 flex items-start gap-2.5">
                <Sparkles size={15} className="text-[#c41535] shrink-0 mt-0.5" />
                <span>
                  Feito por encomenda com carinho exclusivo. Enviamos prévia para aprovação no WhatsApp.
                </span>
              </div>
            </div>

            {/* Footer com Botão WhatsApp */}
            <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white shrink-0 rounded-b-3xl">
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendOrder}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
              >
                <WhatsAppIcon size={19} className="text-white shrink-0" />
                <span>Enviar Pedido pelo WhatsApp</span>
              </motion.button>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
