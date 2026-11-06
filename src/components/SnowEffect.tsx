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
    const saved = typeof window !== "undefined" ? localStorage.getItem("vs_snow_enabled") : null;
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
    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.clientWidth : window.innerWidth);
    let height = (canvas.height = parent ? parent.clientHeight : 700);

    const handleResize = () => {
      if (!canvas) return;
      const p = canvas.parentElement;
      width = canvas.width = p ? p.clientWidth : window.innerWidth;
      height = canvas.height = p ? p.clientHeight : 700;
    };

    window.addEventListener("resize", handleResize);

    // Quantidade de flocos equilibrada para a área do header
    const flakeCount = width < 768 ? 26 : 46;
    const flakes: Flake[] = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8, // Flocos delicados entre 0.8px e 3px
        speedY: Math.random() * 0.9 + 0.45, // Queda suave
        speedX: (Math.random() - 0.5) * 0.35,
        opacity: Math.random() * 0.5 + 0.3, // Transparência suave
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
        flake.x += Math.sin(angle + flake.swayOffset) * 0.45 + flake.speedX;

        // Se sair da área do header, ressurge no topo do header
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

  if (!isSnowing) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
}

// Botão integrado ao Header Natalino (Sem position fixed, rola naturalmente com a seção do header)
export function SnowToggleBadge({ className = "" }: { className?: string }) {
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
      type="button"
      title={isSnowing ? "Pausar neve natalina" : "Ativar neve natalina"}
      aria-label={isSnowing ? "Pausar neve natalina" : "Ativar neve natalina"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all backdrop-blur-md border shadow-sm cursor-pointer select-none ${
        isSnowing
          ? "bg-white/15 text-white border-white/25 hover:bg-white/25"
          : "bg-black/60 text-neutral-300 border-white/15 hover:bg-black/80"
      } ${className}`}
    >
      <Snowflake
        size={12}
        className={`transition-transform duration-700 shrink-0 ${
          isSnowing ? "text-sky-300 animate-spin" : "text-neutral-400"
        }`}
        style={{ animationDuration: "8s" }}
      />
      <span>{isSnowing ? "Neve Ativa" : "Ativar Neve"}</span>
    </button>
  );
}
