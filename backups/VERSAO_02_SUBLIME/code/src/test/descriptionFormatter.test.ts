import { describe, it, expect } from "vitest";
import { parseProductDescription } from "../lib/descriptionFormatter";

describe("descriptionFormatter", () => {
  it("trata quebras de linha Unix (\n)", () => {
    const input = "- Caneca personalizada\n- Nome na caneca\n- Embalagem para presente\n- Ideal para presentear";
    const blocks = parseProductDescription(input);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("list");
    if (blocks[0].type === "list") {
      expect(blocks[0].items).toEqual([
        "Caneca personalizada",
        "Nome na caneca",
        "Embalagem para presente",
        "Ideal para presentear",
      ]);
    }
  });

  it("trata quebras de linha Windows (\r\n)", () => {
    const input = "- Caneca personalizada\r\n- Nome na caneca\r\n- Embalagem para presente\r\n- Ideal para presentear";
    const blocks = parseProductDescription(input);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("list");
    if (blocks[0].type === "list") {
      expect(blocks[0].items).toHaveLength(4);
      expect(blocks[0].items[0]).toBe("Caneca personalizada");
      expect(blocks[0].items[3]).toBe("Ideal para presentear");
    }
  });

  it("converte descrição antiga em linha única com separador ' - '", () => {
    const input = "- Caneca personalizada - Nome na caneca - Embalagem para presente - Ideal para presentear";
    const blocks = parseProductDescription(input);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("list");
    if (blocks[0].type === "list") {
      expect(blocks[0].items).toEqual([
        "Caneca personalizada",
        "Nome na caneca",
        "Embalagem para presente",
        "Ideal para presentear",
      ]);
    }
  });

  it("não divide palavras com hífen legítimo como 'cor-de-rosa' ou 'guarda-chuva'", () => {
    const input = "- Caneca cor-de-rosa\n- Guarda-chuva estampado personalizado";
    const blocks = parseProductDescription(input);

    expect(blocks).toHaveLength(1);
    if (blocks[0].type === "list") {
      expect(blocks[0].items).toEqual([
        "Caneca cor-de-rosa",
        "Guarda-chuva estampado personalizado",
      ]);
    }
  });

  it("preserva acentos, emojis e pontuações", () => {
    const input = "🎁 Presente especial para Mamãe!\n- 1 caneca com gravação única ✨\n- Café & Chá premium (100% artesanal!)";
    const blocks = parseProductDescription(input);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      type: "paragraph",
      text: "🎁 Presente especial para Mamãe!",
    });
    if (blocks[1].type === "list") {
      expect(blocks[1].items).toEqual([
        "1 caneca com gravação única ✨",
        "Café & Chá premium (100% artesanal!)",
      ]);
    }
  });

  it("não duplica marcadores quando o texto já possui '-' no início", () => {
    const input = "- Item sem duplicar";
    const blocks = parseProductDescription(input);

    if (blocks[0].type === "list") {
      expect(blocks[0].items[0]).toBe("Item sem duplicar");
    }
  });

  it("lida com texto vazio ou nulo sem lançar erros", () => {
    expect(parseProductDescription("")).toEqual([]);
    expect(parseProductDescription(null)).toEqual([]);
    expect(parseProductDescription(undefined)).toEqual([]);
  });
});
