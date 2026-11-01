import { Gift } from "lucide-react";

interface VSBrandMarkProps {
  variant?: "horizontal" | "stacked" | "icon-only";
  size?: "sm" | "md" | "lg";
  className?: string;
  subtitle?: string;
}

export function VSBrandMark({
  variant = "stacked",
  size = "md",
  className = "",
  subtitle = "Presentes Personalizados",
}: VSBrandMarkProps) {
  // Ícone com o monograma VS estilizado com a alça da sacola de presentes
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const titleSizes = {
    sm: "text-xs tracking-[0.2em]",
    md: "text-sm sm:text-base tracking-[0.24em]",
    lg: "text-lg sm:text-xl tracking-[0.28em]",
  };

  const subtitleSizes = {
    sm: "text-[8px] tracking-[0.25em]",
    md: "text-[9px] sm:text-[10px] tracking-[0.28em]",
    lg: "text-[11px] sm:text-xs tracking-[0.3em]",
  };

  const IconGraphic = (
    <div
      className={`relative rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm border border-neutral-800 ${iconSizes[size]}`}
    >
      {/* Alça da sacola no topo */}
      <div className="absolute -top-1.5 w-3.5 h-2.5 border-t-2 border-x-2 border-white rounded-t-full pointer-events-none opacity-90" />
      
      {/* Monograma VS */}
      <span className="font-extrabold font-sans text-white select-none tracking-tighter text-[13px] sm:text-[15px] pt-0.5">
        VS
      </span>
      
      {/* Ponto delicado dourado / rose */}
      <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#d4af37]" />
    </div>
  );

  if (variant === "icon-only") {
    return <div className={`inline-flex items-center ${className}`}>{IconGraphic}</div>;
  }

  if (variant === "horizontal") {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {IconGraphic}
        <div className="flex flex-col text-left">
          <span className={`font-extrabold uppercase text-neutral-900 dark:text-white font-sans leading-none ${titleSizes[size]}`}>
            VIRTUAL STORE
          </span>
          {subtitle && (
            <span className={`font-medium uppercase text-neutral-400 dark:text-neutral-500 mt-1 leading-none ${subtitleSizes[size]}`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant "stacked" (centralizado elegante)
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {IconGraphic}
        <span className={`font-extrabold uppercase text-neutral-900 dark:text-white font-sans leading-none ${titleSizes[size]}`}>
          VIRTUAL STORE
        </span>
      </div>
      {subtitle && (
        <span className={`font-semibold uppercase text-neutral-400 dark:text-neutral-500 leading-none ${subtitleSizes[size]}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
