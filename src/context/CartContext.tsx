import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "@/data/products";

export type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  cartKey: string; // unique key: productId + size + color
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, size?: string, color?: string, quantity?: number) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const defaultCartContext: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  setIsOpen: () => {},
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export const useCart = () => useContext(CartContext);

function makeCartKey(productId: string, size?: string, color?: string) {
  return `${productId}__${size || ""}__${color || ""}`;
}

const CART_STORAGE_KEY = "kpnp_cart_items";

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, size?: string, color?: string, quantity: number = 1) => {
    const cartKey = makeCartKey(product.id, size, color);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color, cartKey }];
    });
    toast.success(`${product.name} added to cart`);
    setIsOpen(true);
  };

  const removeItem = (cartKey: string) =>
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) return removeItem(cartKey);
    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
