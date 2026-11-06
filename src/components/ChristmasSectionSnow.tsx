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
  type: "snow" | "gold" | "star";
  rotation: number;
  rotationSpeed: number;
}

export function ChristmasSectionSnow({ className = "" }: { className?: string }) {
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
    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.clientWidth : window.innerWidth);
    let height = (canvas.height = parent ? parent.clientHeight : 600);

    const handleResize = () => {
      if (!canvas) return;
      const p = canvas.parentElement;
      width = canvas.width = p ? p.clientWidth : window.innerWidth;
      height = canvas.height = p ? p.clientHeight : 600;
    };

    window.addEventListener("resize", handleResize);

    // Contagem adaptada por tamanho de tela
    const count = width < 768 ? 32 : 55;
    const flakes: Flake[] = [];

    for (let i = 0; i < count; i++) {
      const isGold = Math.random() < 0.28;
      const isStar = !isGold && Math.random() < 0.15;
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isStar ? Math.random() * 2.2 + 1.8 : Math.random() * 2.5 + 0.8,
        speedY: Math.random() * 0.75 + 0.35,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.55 + 0.35,
        swaySpeed: Math.random() * 0.02 + 0.008,
        swayOffset: Math.random() * Math.PI * 2,
        type: isGold ? "gold" : isStar ? "star" : "snow",
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
      });
    }

    let angle = 0;

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.012;

      for (let i = 0; i < count; i++) {
        const flake = flakes[i];

        // Movimento vertical suave com oscilação horizontal
        flake.y += flake.speedY;
        flake.x += Math.sin(angle + flake.swayOffset) * 0.55 + flake.speedX;
        flake.rotation += flake.rotationSpeed;

        // Se sair da tela, recicla no topo
        if (flake.y > height + 8) {
          flake.y = -8;
          flake.x = Math.random() * width;
        }
        if (flake.x > width + 8) {
          flake.x = -8;
        } else if (flake.x < -8) {
          flake.x = width + 8;
        }

        if (flake.type === "gold") {
          // Partícula dourada champagne / festiva
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(214, 188, 133, ${flake.opacity * 0.85})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = "rgba(214, 188, 133, 0.4)";
          ctx.fill();
        } else if (flake.type === "star") {
          // Estrela delicada de 4 pontas
          ctx.save();
          ctx.translate(flake.x, flake.y);
          ctx.rotate(flake.rotation);
          drawStar(0, 0, 4, flake.radius * 1.5, flake.radius * 0.4, `rgba(255, 255, 255, ${flake.opacity * 0.9})`);
          ctx.restore();
        } else {
          // Floco de neve suave (visível sobre o fundo creme)
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.95})`;
          // Sombra sutil para destacar floco branco no fundo claro
          ctx.shadowBlur = 3;
          ctx.shadowColor = "rgba(180, 150, 120, 0.35)";
          ctx.fill();
        }
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
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
    />
  );
}
