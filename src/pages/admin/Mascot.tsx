import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircleHeart } from 'lucide-react';

const MESSAGES = {
  0: [ // Domingo
    "{greeting}, meu amor! ❤️ Hoje é {day}. Aproveite para descansar um pouquinho e recarregar as energias!",
    "{greeting}, meu amor! 💕 {day} também é dia de ter ideias novas para a nossa loja. Que seu dia seja maravilhoso!"
  ],
  1: [ // Segunda
    "{greeting}, meu amor! ❤️ Hoje é {day}! Que seja um dia produtivo e cheio de pedidos para a nossa loja. 🚀",
    "{greeting}, meu amor! 💕 {day}, dia de começar com tudo! Vamos fazer a Virtual Store crescer ainda mais essa semana."
  ],
  2: [ // Terça
    "{greeting}, meu amor! ❤️ Hoje é {day}. Espero que seu dia esteja sendo produtivo. Vamos continuar cuidando do nosso catálogo! 💕",
    "{greeting}, meu amor! 🚀 {day} brilhante! Que hoje nossa loja fique ainda mais linda e organizada."
  ],
  3: [ // Quarta
    "{greeting}, meu amor! ❤️ {day}, chegamos no meio da semana. Que a sua dedicação traga resultados incríveis para a Virtual Store.",
    "{greeting}, meu amor! 💕 Já é {day}! Continue fazendo esse trabalho impecável na nossa lojinha."
  ],
  4: [ // Quinta
    "{greeting}, meu amor! ❤️ Hoje é {day}! Quase sexta, mas ainda dá tempo de bombar nas vendas da Virtual Store. 🚀",
    "{greeting}, meu amor! 🌸 {day} abençoada! Que hoje seu dia seja leve, produtivo e cheio de coisas boas!"
  ],
  5: [ // Sexta
    "{greeting}, meu amor! ❤️ Sextou! Que hoje seja um dia maravilhoso, de muitas vendas e alegria na nossa Virtual Store. 🎉",
    "{greeting}, meu amor! 💕 Hoje é {day}. Mais um dia para cuidar com carinho de cada detalhe da loja!"
  ],
  6: [ // Sábado
    "{greeting}, meu amor! ❤️ Hoje é {day}! Dia de fechar a semana com chave de ouro na Virtual Store. Você é incrível!",
    "{greeting}, meu amor! 🌟 Sábado abençoado! Seja trabalhando ou descansando, estou sempre orgulhoso de você e da nossa loja."
  ]
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getDayName() {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date());
}

export function Mascot() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dayIndex = new Date().getDay() as keyof typeof MESSAGES;
    const greeting = getGreeting();
    let dayName = getDayName();
    
    // Capitalize first letter of dayName if it's the first word in the sentence (though usually we say "Hoje é segunda-feira")
    // If the message starts with {day}, we'd want it capitalized, but our template has {greeting} first.
    
    const possibleMessages = MESSAGES[dayIndex];
    // Pick one message based on the day of the month to alternate predictably but not be completely random every render
    const messageIndex = new Date().getDate() % possibleMessages.length;
    let selectedMessage = possibleMessages[messageIndex];
    
    selectedMessage = selectedMessage
      .replace('{greeting}', greeting)
      .replace('{day}', dayName);
      
    setMessage(selectedMessage);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-4 bg-white dark:bg-neutral-800 rounded-2xl rounded-br-sm shadow-xl p-4 max-w-[280px] sm:max-w-[320px] border border-neutral-100 dark:border-neutral-700 pointer-events-auto relative"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
            >
              <X size={14} />
            </button>
            <p className="text-sm text-neutral-700 dark:text-neutral-200 pr-4 leading-relaxed font-medium">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg flex items-center justify-center text-3xl pointer-events-auto relative focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
        style={{ cursor: 'pointer' }}
      >
        🤖
        {!isOpen && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            <MessageCircleHeart size={12} />
          </span>
        )}
      </motion.button>
    </div>
  );
}
