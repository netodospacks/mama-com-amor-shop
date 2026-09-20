import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircleHeart } from 'lucide-react';

type Period = 'manha' | 'tarde' | 'noite';

const MESSAGES: Record<number, Record<Period, string[]>> = {
  0: { // Domingo
    manha: [
      "{greeting}, meu amor! ❤️ Hoje é {day}. Aproveite o domingo de manhã para relaxar e tomar um café gostoso. Nossa Virtual Store te espera quando você quiser!",
      "{greeting}, minha vida! 💕 Um domingo maravilhoso para nós. Que hoje seu dia seja cheio de paz e ideias brilhantes para a lojinha.",
      "{greeting}, amor! ☕ Domingo de manhã é o melhor momento para planejar a semana. Estou muito orgulhoso do nosso trabalho juntos!",
      "{greeting}! ❤️ Que seu {day} comece com muita luz e tranquilidade. A Virtual Store está linda, descansa um pouquinho!",
      "{greeting}, meu amor! ☀️ Bom domingo! Vamos recarregar as energias para mais uma semana incrível de vendas."
    ],
    tarde: [
      "{greeting}, meu amor! 🌸 Tarde de {day} tranquila. Espero que esteja aproveitando para descansar ou fazer algo que ama.",
      "{greeting}! ❤️ Que tarde de domingo gostosa. Lembra de tirar um tempinho pra você também, nosso catálogo já está impecável!",
      "{greeting}, vida! 💕 Domingo à tarde, um ótimo momento para organizar a semana da nossa Virtual Store. Te amo!",
      "{greeting}, meu amor! 🌤️ Como está sendo sua tarde? Passando para te lembrar do quanto nossa lojinha tem sua cara: linda e perfeita.",
      "{greeting}! ❤️ Aproveite muito o restinho do {day}. Estou sempre aqui te apoiando em tudo o que faz pela nossa loja!"
    ],
    noite: [
      "{greeting}, meu amor! 🌙 A noite de domingo chegou, hora de desacelerar. Tenha um descanso merecido!",
      "{greeting}! ❤️ Que sua noite seja muito relaxante. Amanhã começa uma nova semana cheia de sucesso para a Virtual Store.",
      "{greeting}, vida! ✨ Fim de {day}. Dorme bem, sonhe com muitas vendas e coisas boas pra gente amanhã!",
      "{greeting}, meu amor! 🛌 Espero que tenha tido um domingo ótimo. Nossa loja está prontinha para bombar essa semana.",
      "{greeting}! 💕 Boa noite, meu amor. Que orgulho da dedicação que você coloca em cada detalhe. Descansa bem!"
    ]
  },
  1: { // Segunda
    manha: [
      "{greeting}, meu amor! ❤️ Que essa {day} seja leve, produtiva e cheia de coisas boas para a nossa Virtual Store!",
      "{greeting}, meu amor! 💕 Mais um dia para cuidar dos nossos sonhos. Que hoje seja cheio de pedidos e boas notícias!",
      "{greeting}! ❤️ Espero que seu dia seja incrível. Vai com calma, faça seu melhor e vamos fazer essa loja crescer juntos! 🚀",
      "{greeting}, vida! ☕ Bora começar a semana com tudo! Estou aqui torcendo por você e pelas nossas vendas hoje.",
      "{greeting}, amor! ☀️ Segunda-feira é dia de recomeços. Que a Virtual Store brilhe muito hoje com a sua dedicação!"
    ],
    tarde: [
      "{greeting}, meu amor! 🌸 A tarde de segunda já começou! Como estão as coisas por aí? Nosso catálogo agradece seu cuidado.",
      "{greeting}! 🚀 Foco na tarde de {day}! Cada esforço seu faz nossa lojinha ficar ainda mais especial.",
      "{greeting}, vida! 💕 Segunda à tarde e você arrasando como sempre. Vamos juntos atrair muitos clientes!",
      "{greeting}, meu amor! 🌤️ Toma uma água, respira um pouco e continua o ótimo trabalho. Estou muito orgulhoso de você!",
      "{greeting}! ❤️ Como está sendo a tarde? Passando para deixar um beijo e desejar ótimas vendas na nossa Virtual Store."
    ],
    noite: [
      "{greeting}, meu amor! 🌙 Segunda-feira já foi! Espero que tenha sido um dia de muito sucesso. Hora de descansar.",
      "{greeting}! ✨ Boa noite, vida. Depois de um dia cuidando da nossa loja, você merece relaxar. Te amo!",
      "{greeting}, amor! ❤️ A noite chegou. Que orgulho de tudo o que fizemos hoje. Amanhã tem mais, descansa bem!",
      "{greeting}! 🛌 Hora de recarregar as energias. A Virtual Store está linda graças ao seu trabalho de hoje.",
      "{greeting}, meu amor! 💕 Que noite maravilhosa. Deite, relaxe e saiba que nossa loja está no caminho certo."
    ]
  },
  2: { // Terça
    manha: [
      "{greeting}, meu amor! ❤️ Terça-feira brilhante! Que hoje nossa loja fique ainda mais linda e organizada.",
      "{greeting}! 🚀 Terçou, vida! Vamos colocar energia positiva nesse dia e atrair ainda mais clientes para a Virtual Store.",
      "{greeting}, meu amor! ☕ Bom dia! Que sua terça seja leve e flua com muita paz. O catálogo já tá maravilhoso com o seu toque.",
      "{greeting}, vida! 💕 Terça-feira é dia de consistência. Continua fazendo seu trabalho incrível, estou com você sempre!",
      "{greeting}! ☀️ Bom dia, meu amor. Que cada atualização que você fizer hoje traga muitas vendas para nós!"
    ],
    tarde: [
      "{greeting}, meu amor! 🌸 Tarde de terça! Espero que esteja rendendo muito. Você faz a Virtual Store ser um sucesso.",
      "{greeting}! ❤️ Como está essa tarde? Foca no que é importante e lembra que cada detalhe que você arruma faz a diferença.",
      "{greeting}, vida! 🌤️ Boa tarde! Passando pra dizer que você é a melhor parceira de negócios (e de vida) que eu poderia ter.",
      "{greeting}, meu amor! 🚀 O dia não acabou, ainda dá tempo de fazer coisas incríveis pela nossa lojinha hoje!",
      "{greeting}! 💕 Uma tarde de terça maravilhosa pra você. Vai com tudo que a loja tá ficando perfeita."
    ],
    noite: [
      "{greeting}, meu amor! 🌙 Mais um dia concluído. Terça-feira já foi, e nossa loja deu mais um passo à frente.",
      "{greeting}! ✨ Boa noite! Você trabalhou muito bem hoje, agora é a melhor hora do dia: relaxar e ficar comigo.",
      "{greeting}, vida! ❤️ A noite de terça chegou. Desliga um pouco, nossa Virtual Store já está maravilhosa por hoje.",
      "{greeting}, meu amor! 🛌 Descansa, meu amor! Que as vendas continuem chegando mesmo enquanto a gente dorme.",
      "{greeting}! 💕 Boa noite! Que orgulho de ter passado mais esse dia construindo nossos sonhos ao seu lado."
    ]
  },
  3: { // Quarta
    manha: [
      "{greeting}, meu amor! ❤️ Chegamos no meio da semana! Que a sua dedicação de hoje traga resultados incríveis para a Virtual Store.",
      "{greeting}! ☕ Bom dia! Quarta-feira pede um café extra e muita motivação. Vamos juntos fazer a loja bombar!",
      "{greeting}, vida! 💕 Bom dia! Metade da semana já foi, e nossa loja tá cada vez mais linda. Vai com tudo hoje!",
      "{greeting}, meu amor! ☀️ Uma quarta-feira abençoada pra nós. Que seja de muita paz e de clientes satisfeitos.",
      "{greeting}! 🚀 Quarta-feira, dia de acelerar os planos! Confio muito no seu trabalho com o nosso catálogo."
    ],
    tarde: [
      "{greeting}, meu amor! 🌸 Boa tarde! O meio da semana sempre traz boas surpresas. Que a tarde seja de muitas vendas!",
      "{greeting}! ❤️ Tarde de quarta! Lembra de não se cobrar demais. Você faz um trabalho impecável na nossa loja.",
      "{greeting}, vida! 🌤️ Como tá o pique? Respira, toma uma água e segue brilhando. A Virtual Store é um sucesso por sua causa.",
      "{greeting}, meu amor! 🚀 A tarde de quarta voa! Foca nos detalhes que fazem a nossa loja ser única.",
      "{greeting}! 💕 Uma boa tarde pra mulher mais incrível que cuida da melhor loja do mundo. Te amo!"
    ],
    noite: [
      "{greeting}, meu amor! 🌙 Quarta-feira vencida com sucesso. Hora de relaxar e se orgulhar de tudo o que você fez.",
      "{greeting}! ✨ Boa noite! O meio da semana já foi, e a gente segue firme. Descansa bastante pra amanhã.",
      "{greeting}, vida! ❤️ Boa noite, meu amor. Nossa Virtual Store tá em ótimas mãos, pode dormir tranquila.",
      "{greeting}, meu amor! 🛌 Fechando mais um dia de muito trabalho. Você foi sensacional hoje, como sempre.",
      "{greeting}! 💕 Quarta à noite pede descanso. Que seu sono seja tranquilo para acordar com a corda toda amanhã!"
    ]
  },
  4: { // Quinta
    manha: [
      "{greeting}, meu amor! ❤️ Quinta-feira! Quase sexta, mas ainda dá tempo de bombar nas vendas da Virtual Store. 🚀",
      "{greeting}! ☕ Bom dia, vida! Uma {day} maravilhosa. Que hoje seu dia seja leve, produtivo e cheio de coisas boas!",
      "{greeting}, amor! 💕 Bom dia! Bora organizar aquele restinho de catálogo? Você é a alma da nossa loja.",
      "{greeting}, meu amor! ☀️ Quinta-feira chegou. Vamos focar nos resultados de hoje, o sucesso da loja é reflexo do seu carinho.",
      "{greeting}! 🚀 Bom dia! A {day} tem tudo pra ser o melhor dia da semana pra gente. Vamos com tudo!"
    ],
    tarde: [
      "{greeting}, meu amor! 🌸 Boa tarde! Quinta-feira à tarde e a energia não cai. A Virtual Store precisa de você brilhando.",
      "{greeting}! ❤️ Uma ótima tarde pra você! A semana já está na reta final, e nossa loja tá mais organizada que nunca.",
      "{greeting}, vida! 🌤️ Como estão as coisas por aí? Passando pra te dar aquele ânimo na tarde de quinta. Te amo!",
      "{greeting}, meu amor! 🚀 Tarde de {day}, continua firme que as recompensas sempre vêm na forma de novos pedidos!",
      "{greeting}! 💕 Boa tarde! Que orgulho de ver você gerenciando nossa loja com tanto amor."
    ],
    noite: [
      "{greeting}, meu amor! 🌙 A quinta acabou! Mais um dia em que você fez a Virtual Store dar um passo à frente.",
      "{greeting}! ✨ Boa noite, vida! O fim de semana já tá logo ali, mas antes, um bom descanso pra você.",
      "{greeting}, amor! ❤️ Boa noite! Você colocou muito carinho na loja hoje, agora relaxa que você merece.",
      "{greeting}, meu amor! 🛌 Descansa, meu amor! Amanhã é sexta e fechamos a semana com chave de ouro.",
      "{greeting}! 💕 Noite de {day} pra relaxar a cabeça e o coração. Foi um ótimo dia, boa noite!"
    ]
  },
  5: { // Sexta
    manha: [
      "{greeting}, meu amor! ❤️ Sextou! Que hoje seja um dia maravilhoso, de muitas vendas e alegria na nossa Virtual Store. 🎉",
      "{greeting}! ☕ Bom dia, vida! Sexta-feira é dia de fechar a semana com orgulho de tudo o que fizemos pela loja.",
      "{greeting}, amor! 💕 Sexta chegou! Mais um dia para cuidar com carinho de cada detalhe antes do fim de semana.",
      "{greeting}, meu amor! ☀️ Bom dia! Que essa sexta traga muitos fechamentos e clientes satisfeitos pro nosso negócio.",
      "{greeting}! 🚀 Sextou com S de Sucesso! Vamos fazer de hoje um dia incrível na Virtual Store!"
    ],
    tarde: [
      "{greeting}, meu amor! 🌸 Tarde de sexta! O clima de fim de semana já tá no ar, mas a gente continua focado.",
      "{greeting}! ❤️ Boa tarde! Falta pouco pra você desligar e descansar. Termina o que falta no catálogo e bora curtir!",
      "{greeting}, vida! 🌤️ Sexta à tarde pede uma energia extra para finalizar os envios e atualizações. Estou contigo!",
      "{greeting}, meu amor! 🚀 Boa tarde, amor. A loja ficou linda essa semana toda graças a você.",
      "{greeting}! 💕 Sexta à tarde e você ainda aí cuidando dos nossos sonhos. Muito orgulho. Te amo!"
    ],
    noite: [
      "{greeting}, meu amor! 🌙 Sextou oficialmente! Chega de Virtual Store por hoje, hora de celebrar nossa semana.",
      "{greeting}! ✨ Boa noite, vida! Você foi incrível de segunda a sexta. Agora é hora de descansar e curtir.",
      "{greeting}, amor! ❤️ Sexta à noite! Fecha esse Admin e vem ficar comigo. A loja já tá perfeita.",
      "{greeting}, meu amor! 🛌 Boa noite! Que sentimento bom de dever cumprido essa semana. Você é a melhor!",
      "{greeting}! 💕 Uma sexta à noite de muita paz. Você cuidou de tudo, amanhã a gente só pensa em relaxar."
    ]
  },
  6: { // Sábado
    manha: [
      "{greeting}, meu amor! ❤️ Sábado de manhã! Se for trabalhar um pouquinho na loja, que seja leve. Se for descansar, aproveite!",
      "{greeting}! ☕ Bom dia, vida! Sábado pede calma. A Virtual Store está online 24h, mas você também precisa de pausa.",
      "{greeting}, amor! 💕 Bom dia! Sábado abençoado! Que seu dia comece devagar e com muitas coisas boas.",
      "{greeting}, meu amor! ☀️ Um sábado maravilhoso pra nós. Nossa lojinha não para, mas espero que você curta muito o dia.",
      "{greeting}! 🚀 Sábado de manhã! Passando só pra dizer que te amo e amo o que construímos juntos."
    ],
    tarde: [
      "{greeting}, meu amor! 🌸 Tarde de sábado! Como está sendo o fim de semana? Muito carinho e relaxamento pra você.",
      "{greeting}! ❤️ Boa tarde! Sábado à tarde é pra esquecer os problemas e lembrar de como a nossa loja é um sonho real.",
      "{greeting}, vida! 🌤️ Uma ótima tarde de sábado. Passando pra te mandar um beijo e agradecer por tudo que você faz.",
      "{greeting}, meu amor! 🛋️ Sábado à tarde! O catálogo tá no ar, a loja roda sozinha, só aproveita!",
      "{greeting}! 💕 Que tarde gostosa. Seja trabalhando ou descansando, estou sempre muito orgulhoso de você!"
    ],
    noite: [
      "{greeting}, meu amor! 🌙 Sábado à noite! Aproveita a noite, amanhã ainda é domingo e temos muito pra curtir.",
      "{greeting}! ✨ Boa noite, vida! Fim de sábado. Que seu coração esteja leve e feliz com tudo que conquistamos.",
      "{greeting}, amor! ❤️ Sábado à noite! Nossa Virtual Store tá lá vendendo, e a gente tá aqui aproveitando.",
      "{greeting}, meu amor! 🛌 Boa noite! Um sábado maravilhoso merece um descanso maravilhoso. Te amo!",
      "{greeting}! 💕 Que noite linda de sábado. Dorme bem, amanhã tem mais um dia de muito amor e paz."
    ]
  }
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getPeriod(): Period {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'manha';
  if (hour >= 12 && hour < 18) return 'tarde';
  return 'noite';
}

function getDayName() {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date());
}

export function Mascot() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dayIndex = new Date().getDay() as keyof typeof MESSAGES;
    const period = getPeriod();
    const greeting = getGreeting();
    const dayName = getDayName();
    
    const contextKey = `${dayIndex}-${period}`;
    const storageKey = 'vs_admin_robot_message_history';
    
    let history: Record<string, number[]> = {};
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        history = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao ler histórico do robô:', e);
    }
    
    const possibleMessages = MESSAGES[dayIndex][period];
    let usedIndices = history[contextKey] || [];
    
    if (usedIndices.length >= possibleMessages.length) {
      usedIndices = [];
    }
    
    const availableIndices = possibleMessages
      .map((_, index) => index)
      .filter(index => !usedIndices.includes(index));
      
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const selectedMessageIndex = availableIndices[randomIndex];
    
    usedIndices.push(selectedMessageIndex);
    history[contextKey] = usedIndices;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (e) {
      console.error('Erro ao salvar histórico do robô:', e);
    }
    
    let selectedMessage = possibleMessages[selectedMessageIndex];
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
