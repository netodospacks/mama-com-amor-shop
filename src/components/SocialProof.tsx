import { useEffect, useState } from "react";
import { Eye, Flame } from "lucide-react";

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const SocialProof = () => {
  const [viewers, setViewers] = useState(rand(8, 25));
  const [orders, setOrders] = useState(rand(15, 60));

  useEffect(() => {
    const t = setInterval(() => {
      setViewers(rand(8, 30));
    }, 5000);
    const t2 = setInterval(() => setOrders((o) => o + rand(0, 1)), 12000);
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);

  return (
    <section className="container py-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-primary-soft rounded-2xl p-3 sm:p-4">
          <div className="p-2 bg-background rounded-full"><Eye className="h-4 w-4 text-primary" /></div>
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-foreground">{viewers} pessoas</p>
            <p className="text-muted-foreground">vendo agora</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gold-soft rounded-2xl p-3 sm:p-4">
          <div className="p-2 bg-background rounded-full"><Flame className="h-4 w-4 text-gold" /></div>
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-foreground">{orders} pedidos</p>
            <p className="text-muted-foreground">feitos hoje</p>
          </div>
        </div>
      </div>
    </section>
  );
};
