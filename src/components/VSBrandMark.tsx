interface VSBrandMarkProps {
  variant?: "horizontal" | "stacked" | "icon-only";
  size?: "sm" | "md" | "lg";
  className?: string;
  subtitle?: string;
  badgeStyle?: "solid-black" | "transparent-dark" | "transparent-white";
}

export function VSBrandMark({
  variant = "horizontal",
  size = "md",
  className = "",
  subtitle = "Presentes Personalizados",
  badgeStyle = "solid-black",
}: VSBrandMarkProps) {
  const iconSizes = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 sm:w-11 sm:h-11 rounded-xl",
    lg: "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl",
  };

  const titleSizes = {
    sm: "text-xs tracking-[0.2em]",
    md: "text-sm sm:text-base tracking-[0.22em]",
    lg: "text-lg sm:text-xl tracking-[0.26em]",
  };

  const subtitleSizes = {
    sm: "text-[8px] tracking-[0.25em]",
    md: "text-[9px] sm:text-[10px] tracking-[0.26em]",
    lg: "text-[11px] sm:text-xs tracking-[0.28em]",
  };

  // Imagem do logotipo oficial extraída dos ativos do projeto
  const logoSrc = badgeStyle === "transparent-white"
    ? "/vs_logo_white.png"
    : badgeStyle === "transparent-dark"
    ? "/vs_logo_dark.png"
    : "/vs_logo.png";

  const IconGraphic = (
    <div
      className={`relative overflow-hidden flex items-center justify-center shrink-0 select-none shadow-sm ${
        badgeStyle === "solid-black" 
          ? "bg-black border border-neutral-800" 
          : "bg-transparent"
      } ${iconSizes[size]}`}
    >
      <img
        src={logoSrc}
        alt="Virtual Store Logo"
        className="w-full h-full object-contain p-1"
        loading="eager"
        decoding="sync"
      />
    </div>
  );

  if (variant === "icon-only") {
    return <div className={`inline-flex items-center ${className}`}>{IconGraphic}</div>;
  }

  if (variant === "horizontal") {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
        {IconGraphic}
        <div className="flex flex-col text-left">
          <span className={`font-extrabold uppercase text-neutral-900 dark:text-white font-sans leading-none ${titleSizes[size]}`}>
            VIRTUAL STORE
          </span>
          {subtitle && (
            <span className={`font-semibold uppercase text-neutral-400 dark:text-neutral-400 mt-1 leading-none ${subtitleSizes[size]}`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant "stacked" (centralizado)
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className="mb-2">
        {IconGraphic}
      </div>
      <span className={`font-extrabold uppercase text-neutral-900 dark:text-white font-sans leading-none ${titleSizes[size]}`}>
        VIRTUAL STORE
      </span>
      {subtitle && (
        <span className={`font-semibold uppercase text-neutral-400 dark:text-neutral-400 mt-1 leading-none ${subtitleSizes[size]}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
