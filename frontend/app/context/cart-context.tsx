// app/context/cart-context.tsx
"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "./user-context";
import {
  getUserCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  updateCartQuantity as apiUpdateCartQuantity,
} from "@/lib/api";

type CartItem = {
  productId: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper functions for localStorage (for guest users)
const getStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("burger-pizza-cart");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading cart from storage:", error);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("burger-pizza-cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to storage:", error);
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart data based on user authentication
  useEffect(() => {
    const loadCart = async () => {
      if (user?.token) {
        // Load from database for authenticated users
        try {
          setLoading(true);
          const userCart = await getUserCart(user.token);
          const cartItems = userCart.items.map((item: any) => ({
            productId:
              typeof item.product === "object"
                ? item.product._id
                : item.product,
            quantity: item.quantity,
          }));
          setCart(cartItems);
        } catch (error) {
          console.error("Error loading user cart:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Load from localStorage for guest users
        setCart(getStoredCart());
      }
      setIsHydrated(true);
    };

    loadCart();
  }, [user]);

  // Save to localStorage for guest users
  useEffect(() => {
    if (isHydrated && !user) {
      saveCartToStorage(cart);
    }
  }, [cart, isHydrated, user]);

  const addToCart = async (productId: string) => {
    if (user?.token) {
      // Add to database for authenticated users
      try {
        setLoading(true);
        const updatedCart = await apiAddToCart(productId, 1, user.token);
        const cartItems = updatedCart.items.map((item: any) => ({
          productId: item.product._id,
          quantity: item.quantity,
        }));
        setCart(cartItems);
      } catch (error) {
        console.error("Error adding to cart:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Add to localStorage for guest users
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          return prev.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prev, { productId, quantity: 1 }];
        }
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user?.token) {
      // Remove from database for authenticated users
      try {
        setLoading(true);
        const updatedCart = await apiRemoveFromCart(productId, user.token);
        const cartItems = updatedCart.items.map((item: any) => ({
          productId: item.product._id,
          quantity: item.quantity,
        }));
        setCart(cartItems);
      } catch (error) {
        console.error("Error removing from cart:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Remove from localStorage for guest users
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user?.token) {
      // Update in database for authenticated users
      try {
        setLoading(true);
        const updatedCart = await apiUpdateCartQuantity(
          productId,
          quantity,
          user.token
        );
        const cartItems = updatedCart.items.map((item: any) => ({
          productId: item.product._id,
          quantity: item.quantity,
        }));
        setCart(cartItems);
      } catch (error) {
        console.error("Error updating cart quantity:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Update in localStorage for guest users
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        loading,
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
