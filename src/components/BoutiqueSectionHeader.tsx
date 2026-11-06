import React from "react";
import { Sparkles, LucideIcon } from "lucide-react";

export interface BoutiqueSectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  countBadge?: string | null;
  icon?: LucideIcon;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  actions?: React.ReactNode;
}

/**
 * Padrão Visual Premium de Título para seções e categorias da Virtual Store.
 * Inspirado na elegância, hierarquia, tipografia e detalhes de boutique da seção natalina.
 */
export function BoutiqueSectionHeader({
  eyebrow = "COLEÇÃO EXCLUSIVA",
  title,
  subtitle,
  countBadge,
  icon: Icon = Sparkles,
  align = "left",
  className = "",
  titleClassName = "",
  actions,
}: BoutiqueSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`relative select-none pb-4 sm:pb-5 border-b border-[#EADFCF]/80 transition-all ${
        isCenter ? "text-center max-w-2xl mx-auto" : "flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4"
      } ${className}`}
    >
      <div className={`min-w-0 ${isCenter ? "flex flex-col items-center" : "flex-1"}`}>
        {/* 1. Eyebrow com Ícone Decorativo Delicado */}
        {eyebrow && (
          <span
            className={`eyebrow-vs inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold tracking-[0.22em] text-[#8B233C] uppercase mb-1.5 ${
              isCenter ? "justify-center" : "justify-start"
            }`}
          >
            {Icon && <Icon size={12} className="text-[#8B233C] shrink-0" />}
            <span>{eyebrow}</span>
            {isCenter && Icon && <Icon size={12} className="text-[#8B233C] shrink-0" />}
          </span>
        )}

        {/* 2. Título Principal em Tipografia Imponente e Nobre */}
        <div className={`flex items-baseline gap-2.5 flex-wrap ${isCenter ? "justify-center" : "justify-start"}`}>
          <h3
            className={`font-sans font-extrabold text-2xl sm:text-3xl lg:text-[34px] text-neutral-900 tracking-tight uppercase leading-tight ${titleClassName}`}
          >
            {title}
          </h3>

          {/* Badge sutil de quantidade (opcional) */}
          {countBadge && (
            <span className="text-[11px] font-medium text-neutral-400 normal-case tracking-normal">
              • {countBadge}
            </span>
          )}
        </div>

        {/* 3. Subtítulo Editorial Acolhedor com Excelente Legibilidade */}
        {subtitle && (
          <p
            className={`text-xs sm:text-[13px] text-neutral-600 font-normal leading-relaxed mt-1.5 ${
              isCenter ? "max-w-md mx-auto" : "max-w-xl"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* 4. Ações Adicionais (como setas de navegação desktop) */}
      {actions && !isCenter && (
        <div className="shrink-0 flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
