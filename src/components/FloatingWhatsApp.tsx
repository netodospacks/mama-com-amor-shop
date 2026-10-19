import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const WHATSAPP_NUMBER = "5583993032780";
const DEFAULT_MESSAGE = encodeURIComponent("Olá! Gostaria de tirar uma dúvida sobre os produtos da Virtual Store.");

export function FloatingWhatsApp() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`;

  return (
    <motion.aside
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      aria-label="Atendimento via WhatsApp"
      className="fixed bottom-6 left-5 sm:left-6 z-[80] flex items-center group pointer-events-auto"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_25px_rgba(18,140,126,0.6)] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366]/60 focus:ring-offset-2"
      >
        {/* Subtle breathing ripple */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
        
        {/* WhatsApp Icon */}
        <WhatsAppIcon size={28} className="text-white relative z-10 shrink-0" />
      </a>

      {/* Desktop hover badge */}
      <span className="hidden sm:inline-block ml-3 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-neutral-100 dark:border-neutral-800">
        Falar no WhatsApp
      </span>
    </motion.aside>
  );
}

export default FloatingWhatsApp;
