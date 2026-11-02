interface VSBrandMarkProps {
  variant?: "horizontal" | "stacked" | "icon-only";
  size?: "sm" | "md" | "lg";
  className?: string;
  subtitle?: string;
  colorTheme?: "default" | "light" | "dark" | "burgundy";
}

export function VSBrandMark({
  variant = "stacked",
  size = "md",
  className = "",
  subtitle = "PRESENTES PERSONALIZADOS",
  colorTheme = "default",
}: VSBrandMarkProps) {
  const logoSizes = {
    sm: "h-6.5 sm:h-7.5 md:h-8.5 w-auto max-h-[32px]",
    md: "h-8 sm:h-9 md:h-10 w-auto max-h-[40px]",
    lg: "h-11 sm:h-12 md:h-14 w-auto max-h-[56px]",
  };

  const titleSizes = {
    sm: "text-[11px] sm:text-xs md:text-sm tracking-[0.14em] sm:tracking-[0.16em]",
    md: "text-xs sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.18em]",
    lg: "text-base sm:text-lg md:text-xl tracking-[0.18em] sm:tracking-[0.2em]",
  };

  const subtitleSizes = {
    sm: "text-[7.5px] sm:text-[8.5px] md:text-[9.5px] tracking-[0.16em] sm:tracking-[0.2em]",
    md: "text-[8.5px] sm:text-[9.5px] md:text-[10.5px] tracking-[0.18em] sm:tracking-[0.22em]",
    lg: "text-[10px] sm:text-[11px] md:text-xs tracking-[0.2em] sm:tracking-[0.24em]",
  };

  const titleColor = colorTheme === "light" 
    ? "text-white" 
    : "text-neutral-900 dark:text-white";
  const subtitleColor = colorTheme === "light"
    ? "text-[#EADFCF]"
    : "text-neutral-600 dark:text-neutral-400";

  const logoSrc = colorTheme === "light"
    ? "/vs_logo_white.png"
    : colorTheme === "burgundy"
    ? "/vs_logo_burgundy.png"
    : "/vs_logo.png";

  const displaySubtitle = subtitle ? subtitle.toUpperCase() : "PRESENTES PERSONALIZADOS";

  if (variant === "icon-only") {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img 
          src={logoSrc} 
          alt="Virtual Store Logo" 
          className={`${logoSizes[size]} object-contain shrink-0`} 
        />
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={`flex items-center gap-2.5 text-left select-none ${className}`}>
        <img 
          src={logoSrc} 
          alt="Virtual Store Logo" 
          className={`${logoSizes[size]} object-contain shrink-0`} 
        />
        <div className="flex flex-col justify-center leading-tight">
          <span className={`font-extrabold uppercase font-sans whitespace-nowrap ${titleColor} ${titleSizes[size]}`}>
            VIRTUAL STORE
          </span>
          <span className={`font-semibold uppercase whitespace-nowrap mt-0.5 ${subtitleColor} ${subtitleSizes[size]}`}>
            {displaySubtitle}
          </span>
        </div>
      </div>
    );
  }

  // Variant "stacked" (marca centralizada com monograma acima)
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <img 
        src={logoSrc} 
        alt="Virtual Store Logo" 
        className={`${logoSizes[size]} object-contain shrink-0 mb-1.5`} 
      />
      <span className={`font-extrabold tracking-[0.18em] uppercase leading-tight font-sans whitespace-nowrap ${titleColor} ${titleSizes[size]}`}>
        VIRTUAL STORE
      </span>
      <span className={`font-semibold uppercase mt-0.5 leading-tight whitespace-nowrap ${subtitleColor} ${subtitleSizes[size]}`}>
        {displaySubtitle}
      </span>
    </div>
  );
}
