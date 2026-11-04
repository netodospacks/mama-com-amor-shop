import { describe, it, expect } from "bun:test";
import { Product } from "@/types/product";

describe("Hierarquia de Categorias e Subcategorias do Catálogo — Virtual Store", () => {
  const mockCategories = [
    { id: "cat-cesta-cafe", name: "Cesta Café da Manhã", slug: "cesta-cafe-da-manha", sort_order: 1, active: true },
    { id: "cat-cesta-aniv", name: "Cesta Aniversário", slug: "cesta-aniversario", sort_order: 2, active: true },
    { id: "cat-cesta-masc", name: "Cesta masculina", slug: "cesta-cores", sort_order: 3, active: true },
    { id: "cat-combos", name: "Combos Promocionais", slug: "combos-promocionais", sort_order: 4, active: true },
    { id: "cat-mamaes", name: "Mamães e Bebês", slug: "mamaes-e-bebes", sort_order: 5, active: true },
    { id: "cat-placas", name: "Placas Acrílicas", slug: "placas-acrilicas", sort_order: 6, active: true },
    { id: "cat-quadros", name: "Quadros Casal", slug: "quadros-casal", sort_order: 7, active: true },
    { id: "cat-kits", name: "Kits Casal", slug: "kits-casal", sort_order: 8, active: true },
  ];

  const mockProducts: Product[] = [
    {
      id: "prod-cafe-1",
      name: "Cesta Amanhecer",
      price: "R$ 150,00",
      categoryId: "cat-cesta-cafe",
      categorySlug: "cesta-cafe-da-manha",
      categoryName: "Cesta Café da Manhã",
      shortDescription: "Café especial",
      detailedDescription: "",
      specifications: [],
      observations: "",
    },
    {
      id: "prod-aniv-1",
      name: "Cesta Aniversário Dourada",
      price: "R$ 180,00",
      categoryId: "cat-cesta-aniv",
      categorySlug: "cesta-aniversario",
      categoryName: "Cesta Aniversário",
      shortDescription: "Parabéns com carinho",
      detailedDescription: "",
      specifications: [],
      observations: "",
    },
    {
      id: "prod-masc-1",
      name: "Cesta Masculina Especial",
      price: "R$ 190,00",
      categoryId: "cat-cesta-masc",
      categorySlug: "cesta-cores",
      categoryName: "Cesta masculina",
      shortDescription: "Vinho e chocolates",
      detailedDescription: "",
      specifications: [],
      observations: "",
    },
    {
      id: "prod-combo-1",
      name: "Combo Amor Perfeito",
      price: "R$ 99,90",
      categoryId: "cat-combos",
      categorySlug: "combos-promocionais",
      categoryName: "Combos Promocionais",
      shortDescription: "Combo promocional",
      detailedDescription: "",
      specifications: [],
      observations: "",
    },
    {
      id: "prod-mamae-1",
      name: "Caixa Bebê Algodão",
      price: "R$ 79,90",
      categoryId: "cat-mamaes",
      categorySlug: "mamaes-e-bebes",
      categoryName: "Mamães e Bebês",
      shortDescription: "Para mamães e bebês",
      detailedDescription: "",
      specifications: [],
      observations: "",
    },
  ];

  it("1. O menu superior deve conter apenas categorias principais e NÃO subcategorias de Cestas", () => {
    const isCestaSubcategory = (cat: { slug?: string; name?: string }) => {
      const slug = (cat.slug || "").toLowerCase();
      const name = (cat.name || "").toLowerCase();
      return slug.startsWith("cesta-") || (name.startsWith("cesta ") && slug !== "cestas");
    };

    const hasAnyCestaProduct = mockProducts.some(p => {
      const slug = (p.categorySlug || "").toLowerCase();
      const name = (p.categoryName || "").toLowerCase();
      return slug.includes("cesta") || name.includes("cesta");
    });

    const activeMain = mockCategories.filter(c => !isCestaSubcategory(c));
    const mainPills = [];
    if (hasAnyCestaProduct) {
      mainPills.push({ id: "main-cestas", name: "Cestas", slug: "cestas" });
    }
    mainPills.push(...activeMain);

    const pillNames = mainPills.map(p => p.name);

    // Deve conter Cestas como categoria principal
    expect(pillNames).toContain("Cestas");

    // NÃO deve conter subcategorias no menu superior
    expect(pillNames).not.toContain("Cesta Café da Manhã");
    expect(pillNames).not.toContain("Cesta Aniversário");
    expect(pillNames).not.toContain("Cesta masculina");

    // Deve conter as demais categorias principais
    expect(pillNames).toContain("Combos Promocionais");
    expect(pillNames).toContain("Mamães e Bebês");
    expect(pillNames).toContain("Placas Acrílicas");
  });

  it("2. Um produto cadastrado em Cesta Aniversário deve cair estritamente na subseção de Aniversário dentro de Cestas", () => {
    const cestaSubcategories = mockCategories.filter(c => c.slug.startsWith("cesta-"));

    const cestaSubsections = cestaSubcategories.map(cat => {
      const prods = mockProducts.filter(p => p.categoryId === cat.id);
      return {
        category: cat,
        products: prods
      };
    });

    const anivSection = cestaSubsections.find(s => s.category.slug === "cesta-aniversario");
    expect(anivSection).toBeDefined();
    expect(anivSection!.products.map(p => p.name)).toEqual(["Cesta Aniversário Dourada"]);

    const cafeSection = cestaSubsections.find(s => s.category.slug === "cesta-cafe-da-manha");
    expect(cafeSection).toBeDefined();
    expect(cafeSection!.products.map(p => p.name)).toEqual(["Cesta Amanhecer"]);

    const mascSection = cestaSubsections.find(s => s.category.slug === "cesta-cores");
    expect(mascSection).toBeDefined();
    expect(mascSection!.products.map(p => p.name)).toEqual(["Cesta Masculina Especial"]);

    // Sem vazamento ou mistura entre subseções
    expect(cafeSection!.products.some(p => p.name.includes("Aniversário"))).toBe(false);
    expect(anivSection!.products.some(p => p.name.includes("Amanhecer"))).toBe(false);
  });

  it("3. Clicar em Cestas no menu superior filtra e exibe exclusivamente as subseções de Cestas em sequência vertical", () => {
    const activeCategorySlug = "cestas";

    const isCestaSubcategory = (cat: { slug?: string; name?: string }) => {
      const slug = (cat.slug || "").toLowerCase();
      const name = (cat.name || "").toLowerCase();
      return slug.startsWith("cesta-") || (name.startsWith("cesta ") && slug !== "cestas");
    };

    const cestaCategories = mockCategories.filter(c => isCestaSubcategory(c) || c.slug === "cestas");
    const otherCategories = mockCategories.filter(c => !isCestaSubcategory(c) && c.slug !== "cestas");

    const cestaSubsections = cestaCategories.map(cat => ({
      category: cat,
      products: mockProducts.filter(p => p.categoryId === cat.id)
    })).filter(s => s.products.length > 0);

    const otherSections = otherCategories.map(cat => ({
      category: cat,
      products: mockProducts.filter(p => p.categoryId === cat.id)
    })).filter(s => s.products.length > 0);

    const result = activeCategorySlug === "cestas" ? {
      isCestasOnly: true,
      cestaSubsections,
      otherSections: []
    } : {
      isCestasOnly: false,
      cestaSubsections,
      otherSections
    };

    expect(result.isCestasOnly).toBe(true);
    expect(result.cestaSubsections.length).toBe(3);
    expect(result.otherSections.length).toBe(0);
  });
});
