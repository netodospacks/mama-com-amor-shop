export type DescriptionBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

/**
 * Trata quebras de linha Windows (\r\n) e Unix (\n),
 * formata listas com hífen / marcadores sem duplicar marcadores,
 * e converte com segurança descrições antigas em linha única com separador " - ".
 */
export function parseProductDescription(rawText: string | undefined | null): DescriptionBlock[] {
  if (!rawText || typeof rawText !== "string") {
    return [];
  }

  // 1. Normalizar quebras de linha (\r\n e \r -> \n)
  const normalized = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  const rawLines = normalized.split("\n");
  const blocks: DescriptionBlock[] = [];
  let currentListItems: string[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push({ type: "list", items: [...currentListItems] });
      currentListItems = [];
    }
  };

  for (const rawLine of rawLines) {
    const line = rawLine.trim();

    // Linha vazia marca separação de parágrafo/bloco
    if (!line) {
      flushList();
      continue;
    }

    // Verifica se a linha começa com marcador de lista (hífen, travessão ou bullet)
    const leadingBulletMatch = line.match(/^[-–—•*]\s*(.+)$/);
    const inlineSeparators = line.split(/\s+[-–—•*]\s+/);

    if (leadingBulletMatch && inlineSeparators.length > 1) {
      // Exemplo: "- Caneca personalizada - Nome na caneca - Embalagem para presente"
      for (const part of inlineSeparators) {
        const clean = part.replace(/^[-–—•*]\s*/, "").trim();
        if (clean) {
          currentListItems.push(clean);
        }
      }
    } else if (!leadingBulletMatch && inlineSeparators.length >= 3) {
      // Exemplo sem hífen inicial, mas com 3+ itens separados por " - "
      for (const part of inlineSeparators) {
        const clean = part.trim();
        if (clean) {
          currentListItems.push(clean);
        }
      }
    } else if (leadingBulletMatch) {
      // Item de lista normal em linha própria: "- Caneca personalizada"
      const clean = leadingBulletMatch[1].trim();
      if (clean) {
        currentListItems.push(clean);
      }
    } else {
      // Parágrafo de texto normal
      flushList();
      blocks.push({ type: "paragraph", text: line });
    }
  }

  flushList();
  return blocks;
}
