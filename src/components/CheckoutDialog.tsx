import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PaymentMethodSelector, PaymentMethod } from "@/components/PaymentMethodSelector";

const WHATSAPP = "5583993032780";

export const CheckoutDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { items, total, clear, setOpen } = useCart();
  const [name, setName] = useState("");
  const [bairro, setBairro] = useState("");
  const [pagamento, setPagamento] = useState<PaymentMethod | "">("");
  const [paymentError, setPaymentError] = useState(false);
  const [obs, setObs] = useState("");
  const [retirada, setRetirada] = useState("Praça Jose Pereira da Silva - Santa Rita");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bairro) {
      toast.error("Preencha nome e bairro");
      return;
    }
    if (!pagamento) {
      setPaymentError(true);
      toast.error("Por favor, selecione a forma de pagamento (PIX ou CARTÃO).");
      return;
    }
    const list = items.map((i) => `• ${i.name} (x${i.quantity}) - R$ ${(i.price * i.quantity).toFixed(2)}`).join("\n");
    const msg = `Olá, quero fazer um pedido:\n\nNome: ${name}\nBairro: ${bairro}\nForma de pagamento: ${pagamento}\n\nProdutos:\n${list}\n\nRetirada: ${retirada}\n${obs ? `Observações: ${obs}\n` : ""}\nTotal: R$ ${total.toFixed(2)}`;
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    clear();
    onClose();
    setOpen(false);
    toast.success("Pedido enviado!", { description: "Continue no WhatsApp." });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Finalizar Pedido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium block mb-1.5">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary border-0 outline-none focus:ring-2 focus:ring-primary" placeholder="Seu nome" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Bairro</label>
            <input value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary border-0 outline-none focus:ring-2 focus:ring-primary" placeholder="Seu bairro" />
          </div>
          <div>
            <PaymentMethodSelector 
              value={pagamento} 
              onChange={(method) => {
                setPagamento(method);
                setPaymentError(false);
              }}
              error={paymentError}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Local de retirada</label>
            <div className="space-y-2">
              {["Praça Jose Pereira da Silva - Santa Rita", "Manaíra Shopping - João Pessoa PB"].map((r) => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${retirada === r ? "bg-primary-soft border-2 border-primary" : "bg-secondary border-2 border-transparent"}`}>
                  <input type="radio" checked={retirada === r} onChange={() => setRetirada(r)} className="accent-primary" />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Observações (opcional)</label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl bg-secondary border-0 outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="flex items-baseline justify-between pt-2 border-t">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-2xl font-bold text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>
          <button 
            type="submit" 
            className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:ring-offset-2"
          >
            <WhatsAppIcon size={20} className="text-white shrink-0" />
            <span>Enviar pedido pelo WhatsApp</span>
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
