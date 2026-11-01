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
  const iconSizes = {
    sm: 14,
    md: 17,
    lg: 22,
  };

  const titleSizes = {
    sm: "text-xs tracking-[0.2em]",
    md: "text-sm sm:text-base tracking-[0.22em]",
    lg: "text-lg sm:text-xl tracking-[0.26em]",
  };

  const subtitleSizes = {
    sm: "text-[8px] tracking-[0.24em]",
    md: "text-[8.5px] sm:text-[9.5px] tracking-[0.26em]",
    lg: "text-[10px] sm:text-[11px] tracking-[0.28em]",
  };

  if (variant === "icon-only") {
    return (
      <div className={`inline-flex items-center text-neutral-900 dark:text-white ${className}`}>
        <Gift size={iconSizes[size]} strokeWidth={1.75} />
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={`flex items-center gap-2 text-left select-none ${className}`}>
        <Gift size={iconSizes[size]} strokeWidth={1.8} className="text-neutral-900 dark:text-white shrink-0" />
        <div className="flex flex-col leading-none">
          <span className={`font-bold uppercase text-neutral-900 dark:text-white font-sans ${titleSizes[size]}`}>
            VIRTUAL STORE
          </span>
          {subtitle && (
            <span className={`font-normal uppercase text-neutral-400 dark:text-neutral-500 mt-0.5 ${subtitleSizes[size]}`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant "stacked" (marca centralizada idêntica à original)
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Gift size={iconSizes[size]} strokeWidth={1.75} className="text-neutral-900 dark:text-white shrink-0" />
        <span className={`font-bold tracking-[0.22em] text-neutral-900 dark:text-white uppercase leading-tight font-sans ${titleSizes[size]}`}>
          VIRTUAL STORE
        </span>
      </div>
      {subtitle && (
        <span className={`font-normal tracking-[0.26em] text-neutral-400 dark:text-neutral-500 uppercase leading-none ${subtitleSizes[size]}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
