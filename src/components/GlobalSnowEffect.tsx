import React, { useEffect, useRef } from "react";

interface Flake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  swaySpeed: number;
  swayOffset: number;
  type: "snow" | "gold" | "crystal";
}

export function GlobalSnowEffect() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respeita preferência de redução de movimento do sistema
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

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

    // Quantidade aumentada: efeito visual mais presente tanto no mobile quanto no desktop
    const count = width < 768 ? 75 : 130;
    const flakes: Flake[] = [];

    for (let i = 0; i < count; i++) {
      const isGold = Math.random() < 0.22;
      const isCrystal = !isGold && Math.random() < 0.18;
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isCrystal ? Math.random() * 2.5 + 1.4 : isGold ? Math.random() * 2.0 + 1.0 : Math.random() * 2.8 + 1.0,
        speedY: Math.random() * 0.8 + 0.4, // Queda serena e constante
        speedX: (Math.random() - 0.5) * 0.35,
        opacity: Math.random() * 0.5 + 0.45,
        swaySpeed: Math.random() * 0.015 + 0.008,
        swayOffset: Math.random() * Math.PI * 2,
        type: isGold ? "gold" : isCrystal ? "crystal" : "snow",
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.01;

      for (let i = 0; i < count; i++) {
        const flake = flakes[i];

        flake.y += flake.speedY;
        flake.x += Math.sin(angle + flake.swayOffset) * 0.5 + flake.speedX;

        // Ao ultrapassar a borda inferior da tela, renasce suavemente no topo
        if (flake.y > height + 8) {
          flake.y = -8;
          flake.x = Math.random() * width;
        }
        if (flake.x > width + 8) {
          flake.x = -8;
        } else if (flake.x < -8) {
          flake.x = width + 8;
        }

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);

        if (flake.type === "gold") {
          // Partícula dourada suave
          ctx.fillStyle = `rgba(216, 183, 122, ${flake.opacity * 0.85})`;
          ctx.shadowBlur = 3;
          ctx.shadowColor = "rgba(216, 183, 122, 0.4)";
        } else if (flake.type === "crystal") {
          // Floco cristalino brilhante com sombra adaptativa para legibilidade em fundos claros e escuros
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.95})`;
          ctx.shadowBlur = 3;
          ctx.shadowColor = "rgba(101, 29, 43, 0.35)";
        } else {
          // Floco de neve clássico suave
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.85})`;
          ctx.shadowBlur = 2;
          ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        }

        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] w-screen h-screen overflow-hidden"
    />
  );
}
