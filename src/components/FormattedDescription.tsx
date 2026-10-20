import React from "react";
import { parseProductDescription } from "@/lib/descriptionFormatter";

interface FormattedDescriptionProps {
  text?: string | null;
  className?: string;
  showBulletSymbol?: boolean;
}

/**
 * Componente que renderiza descrições de produtos formatando
 * itens em lista com quebras de linha preservadas, sem duplicar marcadores,
 * e mantendo suporte a parágrafos, emojis e acentos.
 */
export const FormattedDescription: React.FC<FormattedDescriptionProps> = ({
  text,
  className = "",
  showBulletSymbol = true,
}) => {
  const blocks = parseProductDescription(text);

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 leading-relaxed text-neutral-600 dark:text-neutral-300 font-light ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === "list") {
          return (
            <ul key={bIdx} className="space-y-2 my-2 list-none p-0">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2 text-sm md:text-base">
                  {showBulletSymbol && (
                    <span
                      aria-hidden="true"
                      className="text-neutral-800 dark:text-neutral-200 font-semibold select-none shrink-0 text-sm leading-relaxed"
                    >
                      -
                    </span>
                  )}
                  <span className="flex-1 break-words">{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bIdx} className="leading-relaxed break-words text-sm md:text-base">
            {block.text}
          </p>
        );
      })}
    </div>
  );
};

export default FormattedDescription;
