import React, { useEffect, useRef, useState } from "react";
import { Snowflake } from "lucide-react";

interface Flake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  swaySpeed: number;
  swayOffset: number;
}

export function SnowEffect() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Verifica preferência de movimento reduzido
  const prefersReducedMotion = typeof window !== "undefined" 
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Estado da neve (com persistência no localStorage)
  const [isSnowing, setIsSnowing] = useState<boolean>(() => {
    if (prefersReducedMotion) return false;
    const saved = localStorage.getItem("vs_snow_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const toggleSnow = () => {
    setIsSnowing((prev) => {
      const next = !prev;
      localStorage.setItem("vs_snow_enabled", String(next));
      window.dispatchEvent(new CustomEvent("vs-snow-changed", { detail: next }));
      return next;
    });
  };

  useEffect(() => {
    const handleExternalToggle = () => toggleSnow();
    const handleSnowChanged = (e: any) => {
      if (typeof e.detail === "boolean") {
        setIsSnowing(e.detail);
      }
    };

    window.addEventListener("vs-toggle-snow", handleExternalToggle);
    window.addEventListener("vs-snow-changed", handleSnowChanged);

    return () => {
      window.removeEventListener("vs-toggle-snow", handleExternalToggle);
      window.removeEventListener("vs-snow-changed", handleSnowChanged);
    };
  }, []);

  useEffect(() => {
    if (!isSnowing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Quantidade de flocos otimizada (leve para celulares)
    const flakeCount = width < 768 ? 32 : 55;
    const flakes: Flake[] = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8, // Flocos delicados entre 0.8px e 3px
        speedY: Math.random() * 1.1 + 0.5, // Queda suave
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.55 + 0.35, // Transparência suave
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.01;

      for (let i = 0; i < flakeCount; i++) {
        const flake = flakes[i];
        
        // Movimento senoidal de oscilação suave lateral
        flake.y += flake.speedY;
        flake.x += Math.sin(angle + flake.swayOffset) * 0.5 + flake.speedX;

        // Se sair da tela, ressurge no topo
        if (flake.y > height + 5) {
          flake.y = -5;
          flake.x = Math.random() * width;
        }
        if (flake.x > width + 5) {
          flake.x = -5;
        } else if (flake.x < -5) {
          flake.x = width + 5;
        }

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSnowing]);

  return (
    <>
      {/* Canvas da Neve (invisível para cliques, não bloqueia nenhuma interação) */}
      {isSnowing && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[35] w-full h-full"
        />
      )}

      {/* Botão de Controle Flutuante Discreto e Elegante (Mobile & Desktop) */}
      <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 select-none">
        <button
          onClick={toggleSnow}
          title={isSnowing ? "Pausar efeito de neve natalina" : "Ativar efeito de neve natalina"}
          aria-label={isSnowing ? "Pausar neve natalina" : "Ativar neve natalina"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all shadow-md backdrop-blur-md border ${
            isSnowing
              ? "bg-white/90 text-neutral-800 border-neutral-200/90 hover:bg-white"
              : "bg-neutral-900/90 text-white/80 border-neutral-700/80 hover:bg-neutral-900"
          }`}
        >
          <Snowflake
            size={13}
            className={`transition-transform duration-700 ${
              isSnowing ? "text-sky-500 animate-spin" : "text-neutral-400"
            }`}
            style={{ animationDuration: "8s" }}
          />
          <span className="hidden sm:inline">
            {isSnowing ? "Neve Ativa" : "Neve Pausada"}
          </span>
          <span className="sm:hidden">
            {isSnowing ? "Neve" : "Pausada"}
          </span>
        </button>
      </div>
    </>
  );
}

// Botão adicional opcional para o Cabeçalho
export function SnowHeaderButton() {
  const [isSnowing, setIsSnowing] = useState<boolean>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("vs_snow_enabled") : null;
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    const handleSnowChanged = (e: any) => {
      if (typeof e.detail === "boolean") {
        setIsSnowing(e.detail);
      }
    };
    window.addEventListener("vs-snow-changed", handleSnowChanged);
    return () => window.removeEventListener("vs-snow-changed", handleSnowChanged);
  }, []);

  const handleToggle = () => {
    window.dispatchEvent(new CustomEvent("vs-toggle-snow"));
  };

  return (
    <button
      onClick={handleToggle}
      title={isSnowing ? "Pausar neve de Natal" : "Ativar neve de Natal"}
      aria-label={isSnowing ? "Pausar neve" : "Ativar neve"}
      className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none flex items-center justify-center"
    >
      <Snowflake 
        size={19} 
        strokeWidth={1.8} 
        className={isSnowing ? "text-sky-500 animate-spin" : "text-neutral-400"}
        style={{ animationDuration: "8s" }}
      />
    </button>
  );
}
