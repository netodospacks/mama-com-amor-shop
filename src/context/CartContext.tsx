import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { Product } from "@/types/product";
import { Subproduct } from "@/types/subproduct";
import { getEffectivePrice } from "@/lib/mapper";
import { PaymentMethod } from "@/components/PaymentMethodSelector";
import { toast } from "sonner";

export interface CartItem {
  id: string; // Identificador único da linha do carrinho
  product: Product;
  quantity: number;
  selectedAddons: Subproduct[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedAddons?: Subproduct[]) => void;
  removeItem: (identifier: string) => void;
  updateQuantity: (identifier: string, quantity: number) => void;
  toggleAddon: (cartItemId: string, addon: Subproduct) => void;
  removeAddon: (cartItemId: string, addonId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalPriceFormatted: string;
  subtotalProducts: number;
  subtotalProductsFormatted: string;
  subtotalAddons: number;
  subtotalAddonsFormatted: string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  formaPagamento: PaymentMethod | "";
  setFormaPagamento: (method: PaymentMethod | "") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "mama_shop_cart_items_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Inicializa a partir do localStorage para preservar os dados ao atualizar a página
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            id: item.id || `item-${item.product?.id || Math.random()}-${Date.now()}`,
            product: item.product,
            quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
            selectedAddons: Array.isArray(item.selectedAddons) ? item.selectedAddons : [],
          }));
        }
      }
    } catch (e) {
      console.warn("Erro ao ler carrinho do localStorage:", e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<PaymentMethod | "">("");

  // Persistir alterações no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Erro ao salvar carrinho no localStorage:", e);
    }
  }, [items]);

  const areAddonsEqual = (a: Subproduct[], b: Subproduct[]) => {
    if (a.length !== b.length) return false;
    const idsA = a.map((x) => x.id).sort();
    const idsB = b.map((x) => x.id).sort();
    return idsA.every((id, idx) => id === idsB[idx]);
  };

  const addItem = (product: Product, quantity = 1, selectedAddons: Subproduct[] = []) => {
    setItems((currentItems) => {
      // Procura item existente com mesmo produto E mesmos adicionais selecionados
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id && areAddonsEqual(item.selectedAddons, selectedAddons)
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const newItem: CartItem = {
        id: `item-${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product,
        quantity,
        selectedAddons: [...selectedAddons],
      };

      return [...currentItems, newItem];
    });

    // Animação de feedback
    toast.success(`${product.name} adicionado ao carrinho!`, {
      style: { background: "#000", color: "#fff", border: "none" },
      position: "top-center",
    });
  };

  // Suporta identificação tanto por cartItemId quanto por productId (retrocompatibilidade)
  const removeItem = (identifier: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== identifier && item.product.id !== identifier)
    );
  };

  const updateQuantity = (identifier: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(identifier);
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === identifier || item.product.id === identifier
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Alterna a seleção de um adicional para um item específico do carrinho
  const toggleAddon = (cartItemId: string, addon: Subproduct) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === cartItemId || item.product.id === cartItemId) {
          const exists = item.selectedAddons.some((a) => a.id === addon.id);
          const newAddons = exists
            ? item.selectedAddons.filter((a) => a.id !== addon.id)
            : [...item.selectedAddons, addon];
          return { ...item, selectedAddons: newAddons };
        }
        return item;
      })
    );
  };

  // Remove um adicional de um item específico do carrinho sem afetar o produto principal
  const removeAddon = (cartItemId: string, addonId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === cartItemId || item.product.id === cartItemId) {
          return {
            ...item,
            selectedAddons: item.selectedAddons.filter((a) => a.id !== addonId),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  // Subtotal apenas dos produtos principais
  const subtotalProducts = useMemo(
    () => items.reduce((total, item) => total + getEffectivePrice(item.product) * item.quantity, 0),
    [items]
  );

  // Subtotal apenas dos adicionais
  const subtotalAddons = useMemo(
    () =>
      items.reduce((total, item) => {
        const addonsCost = item.selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
        return total + addonsCost * item.quantity;
      }, 0),
    [items]
  );

  // Total geral: (preço efetivo do produto + soma dos adicionais) * quantidade
  const totalPrice = useMemo(() => subtotalProducts + subtotalAddons, [subtotalProducts, subtotalAddons]);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const totalPriceFormatted = formatBRL(totalPrice);
  const subtotalProductsFormatted = formatBRL(subtotalProducts);
  const subtotalAddonsFormatted = formatBRL(subtotalAddons);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        toggleAddon,
        removeAddon,
        clearCart,
        totalItems,
        totalPrice,
        totalPriceFormatted,
        subtotalProducts,
        subtotalProductsFormatted,
        subtotalAddons,
        subtotalAddonsFormatted,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        formaPagamento,
        setFormaPagamento,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
