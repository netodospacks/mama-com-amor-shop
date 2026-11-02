import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Check, Sparkles, ShieldCheck, Heart } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelector, PaymentMethod } from "@/components/PaymentMethodSelector";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { formatSubproductPrice } from "@/lib/subproducts";
import { getEffectivePrice } from "@/lib/mapper";
import { VSBrandMark } from "@/components/VSBrandMark";
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
  const { 
    items, 
    totalPrice, 
    totalPriceFormatted, 
    subtotalProductsFormatted,
    subtotalAddonsFormatted,
    subtotalAddons,
    clearCart, 
    formaPagamento, 
    setFormaPagamento 
  } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: "",
    cidade: "Santa Rita",
    bairro: "Tibiri",
    destinatario: "",
    observacoes: "",
    formaPagamento: formaPagamento || ("" as PaymentMethod | ""),
  });
  const [paymentError, setPaymentError] = useState(false);

  // Sincroniza com contexto do carrinho
  useEffect(() => {
    if (formaPagamento && !formData.formaPagamento) {
      setFormData(prev => ({ ...prev, formaPagamento }));
    }
  }, [formaPagamento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "cidade") {
      setFormData(prev => ({
        ...prev,
        cidade: value,
        bairro: BAIRROS_POR_CIDADE[value]?.[0] || ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Por favor, preencha seu nome.");
      return;
    }

    if (!formData.formaPagamento) {
      setPaymentError(true);
      toast.error("Por favor, selecione a forma de pagamento (PIX ou CARTÃO).");
      return;
    }

    const whatsappLink = generateWhatsAppLink(formData, items, totalPrice);
    
    window.open(whatsappLink, "_blank");
    clearCart();
    navigate("/");
    toast.success("Pedido gerado! Conclua o envio no WhatsApp. 🎉");
  };

  // Estado: Sacola Vazia
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBF7EE] text-neutral-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 text-[#8B233C] shadow-md border border-[#EADFCF]">
          <ShoppingBag className="w-9 h-9" strokeWidth={1.5} />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#8B233C] font-semibold mb-2">
          Sua Sacola
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 mb-2">
          Sua sacola está vazia
        </h1>
        <p className="text-sm text-neutral-600 mb-8 max-w-sm leading-relaxed">
          Explore nosso catálogo exclusivo e adicione presentes personalizados antes de finalizar seu pedido.
        </p>
        <Link 
          to="/"
          className="px-8 py-3.5 rounded-full bg-[#8B233C] hover:bg-[#6F1E31] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02]"
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-neutral-900 pb-36 font-sans">
      
      {/* Top Header Boutique */}
      <header className="sticky top-0 z-40 bg-[#FBF7EE]/95 backdrop-blur-md border-b border-[#EADFCF] px-4 sm:px-8 py-3 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full text-neutral-900 hover:text-[#8B233C] hover:bg-neutral-100 transition-colors flex items-center gap-1.5 text-xs font-medium"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <Link to="/">
            <VSBrandMark size="sm" variant="horizontal" colorTheme="dark" subtitle="PRESENTES PERSONALIZADOS" />
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
            <ShieldCheck size={16} className="text-[#25D366]" />
            <span className="hidden sm:inline">Compra Segura</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-2xl mx-auto pt-8 sm:pt-12 px-4 sm:px-6 space-y-6">
        
        {/* Cabeçalho Editorial */}
        <div className="text-left space-y-2 border-b border-[#EADFCF] pb-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8B233C] font-bold flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#8B233C]" />
            <span>Confira seu pedido</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900">
            Finalizar Pedido
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
            Presentes finos feitos por encomenda com acabamento artesanal de boutique. Finalize seus dados e envie direto para o WhatsApp da loja.
          </p>
        </div>

        {/* Resumo Visual dos Presentes Selecionados */}
        <section className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#c41535]" />
              <span>Itens Selecionados ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </h2>
            <Link to="/cart" className="text-xs text-[#c41535] hover:underline font-medium">
              Editar itens
            </Link>
          </div>

          <div className="divide-y divide-neutral-100 space-y-3">
            {items.map((item) => {
              const effectivePrice = getEffectivePrice(item.product);
              const formatBRL = (val: number) => 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

              return (
                <div key={item.id || item.product.id} className="pt-3 first:pt-0 flex gap-3.5 items-center">
                  <div className="w-16 h-20 bg-neutral-100 rounded-xl overflow-hidden shrink-0 relative shadow-sm border border-neutral-100">
                    {item.product.image ? (
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-neutral-900 line-clamp-1">
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      Qtd: <strong className="text-neutral-800">{item.quantity}</strong> • {formatBRL(effectivePrice)}
                    </div>

                    {/* Adicionais / Mimos vinculados */}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {item.selectedAddons.map((addon) => (
                          <div key={addon.id} className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <span className="text-[#c41535]">+</span>
                            <span>{addon.name}</span>
                            <span className="text-neutral-400">({formatSubproductPrice(addon.price)})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-neutral-900">
                      {formatBRL(effectivePrice * item.quantity)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtotais e Discriminação */}
          <div className="pt-4 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
            {subtotalAddons > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Subtotal dos produtos</span>
                  <span>{subtotalProductsFormatted}</span>
                </div>
                <div className="flex justify-between text-[#c41535]">
                  <span>Mimos e adicionais</span>
                  <span>+{subtotalAddonsFormatted}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-neutral-100 text-sm font-semibold text-neutral-900">
              <span className="uppercase tracking-wider text-xs">Total dos Presentes</span>
              <span className="text-lg font-bold text-neutral-900">{totalPriceFormatted}</span>
            </div>
          </div>
        </section>

        {/* Formulário Estruturado em Blocos Sublime */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Seus Dados */}
          <fieldset className="border border-neutral-200/90 rounded-2xl p-5 sm:p-6 bg-white shadow-sm space-y-4">
            <legend className="font-serif text-lg font-semibold text-neutral-900 px-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-sans font-bold flex items-center justify-center">1</span>
              <span>Seus Dados</span>
            </legend>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Seu nome completo *
              </label>
              <input 
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex.: Maria Clara"
                className="w-full bg-[#faf8f6] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white transition-all"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Cidade *
                </label>
                <div className="relative">
                  <select 
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className="w-full bg-[#faf8f6] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {Object.keys(BAIRROS_POR_CIDADE).map(cidade => (
                      <option key={cidade} value={cidade}>{cidade}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">▼</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Bairro *
                </label>
                <div className="relative">
                  <select 
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    className="w-full bg-[#faf8f6] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {BAIRROS_POR_CIDADE[formData.cidade]?.map(bairro => (
                      <option key={bairro} value={bairro}>{bairro}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">▼</span>
                </div>
              </div>
            </div>
          </fieldset>

          {/* 2. Quem receberá o presente */}
          <fieldset className="border border-neutral-200/90 rounded-2xl p-5 sm:p-6 bg-white shadow-sm space-y-4">
            <legend className="font-serif text-lg font-semibold text-neutral-900 px-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-sans font-bold flex items-center justify-center">2</span>
              <span>Dedicatória ou Destinatário</span>
            </legend>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Nome de quem vai receber (opcional)
              </label>
              <input 
                name="destinatario"
                value={formData.destinatario}
                onChange={handleChange}
                placeholder="Ex.: Para meu amor, para mamãe, etc."
                className="w-full bg-[#faf8f6] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Observações de personalização ou dedicatória
              </label>
              <textarea 
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                placeholder="Ex.: Gostaria de adicionar a frase 'Com amor' no cartão..."
                className="w-full bg-[#faf8f6] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white transition-all resize-none"
              />
            </div>
          </fieldset>

          {/* 3. Forma de Pagamento */}
          <fieldset className="border border-neutral-200/90 rounded-2xl p-5 sm:p-6 bg-white shadow-sm space-y-4">
            <legend className="font-serif text-lg font-semibold text-neutral-900 px-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-sans font-bold flex items-center justify-center">3</span>
              <span>Forma de Pagamento</span>
            </legend>

            <PaymentMethodSelector 
              value={formData.formaPagamento} 
              onChange={(method) => {
                setFormData(prev => ({ ...prev, formaPagamento: method }));
                setFormaPagamento(method);
                setPaymentError(false);
              }}
              error={paymentError}
            />
          </fieldset>

          {/* Selo de Garantia e Confiança da Boutique */}
          <div className="rounded-2xl bg-[#fdf2f4] border border-[#fecdd3] p-4 sm:p-5 flex items-start gap-3.5 text-xs text-neutral-700 leading-relaxed">
            <Sparkles size={18} className="text-[#c41535] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-neutral-900 font-semibold block">
                Feito por encomenda com carinho exclusivo
              </strong>
              <span>
                Cada presente é personalizado artesanalmente. Após o envio do pedido no WhatsApp, enviamos a prévia para você aprovar antes da confecção final.
              </span>
            </div>
          </div>
        </form>

      </main>

      {/* Barra de Fechamento Fixa Inferior */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-40">
        <div className="max-w-2xl mx-auto flex flex-col gap-2.5">
          <div className="flex justify-between items-center px-1 text-xs text-neutral-500">
            <span>Pagamento selecionado:</span>
            <span className={`font-semibold ${formData.formaPagamento ? "text-neutral-900 font-bold" : "text-amber-600"}`}>
              {formData.formaPagamento || "Selecione a forma acima"}
            </span>
          </div>

          <div className="flex justify-between items-baseline px-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
              Total do pedido
            </span>
            <span className="text-2xl font-bold text-neutral-900 font-serif">
              {totalPriceFormatted}
            </span>
          </div>

          <Button 
            onClick={handleSubmit}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-14 rounded-full font-bold shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:ring-offset-2"
          >
            <WhatsAppIcon size={20} className="text-white shrink-0" />
            <span>Enviar Pedido para o WhatsApp</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
