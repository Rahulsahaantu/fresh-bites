"use client";

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { CartItem } from "./types";

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------
interface CartState {
  items: CartItem[];
  isHydrated: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { foodId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.foodId === action.payload.foodId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.foodId === action.payload.foodId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.foodId !== action.payload),
      };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.foodId !== action.payload.foodId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.foodId === action.payload.foodId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "HYDRATE":
      return { ...state, items: action.payload, isHydrated: true };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "fresh-bites-cart";
const DELIVERY_FEE = 2.99;
const FREE_DELIVERY_THRESHOLD = 30;

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isHydrated: false,
  });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }
    dispatch({ type: "HYDRATE", payload: [] });
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (state.isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, state.isHydrated]);

  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE) : 0;
  const total = subtotal + deliveryFee;

  const value: CartContextType = {
    items: state.items,
    addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
    removeItem: (foodId) => dispatch({ type: "REMOVE_ITEM", payload: foodId }),
    updateQuantity: (foodId, quantity) =>
      dispatch({ type: "UPDATE_QUANTITY", payload: { foodId, quantity } }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
    itemCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    deliveryFee,
    total,
    isHydrated: state.isHydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
