// app/context/wishlist-context.tsx
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
  getUserWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from "@/lib/api";

type WishlistItem = {
  productId: string;
  addedAt: string;
};

type WishlistContextType = {
  wishlist: WishlistItem[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  clearWishlist: () => void;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

// Helper functions for localStorage (for guest users)
const getStoredWishlist = (): WishlistItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("burger-pizza-wishlist");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading wishlist from storage:", error);
    return [];
  }
};

const saveWishlistToStorage = (wishlist: WishlistItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("burger-pizza-wishlist", JSON.stringify(wishlist));
  } catch (error) {
    console.error("Error saving wishlist to storage:", error);
  }
};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist data based on user authentication
  useEffect(() => {
    const loadWishlist = async () => {
      if (user?.token) {
        // Load from database for authenticated users
        try {
          setLoading(true);
          const userWishlist = await getUserWishlist(user.token);
          const wishlistItems = userWishlist.map((product: any) => ({
            productId: typeof product === "object" ? product._id : product,
            addedAt: new Date().toISOString(),
          }));
          setWishlist(wishlistItems);
        } catch (error) {
          console.error("Error loading user wishlist:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Load from localStorage for guest users
        setWishlist(getStoredWishlist());
      }
      setIsHydrated(true);
    };

    loadWishlist();
  }, [user]);

  // Save to localStorage for guest users
  useEffect(() => {
    if (isHydrated && !user) {
      saveWishlistToStorage(wishlist);
    }
  }, [wishlist, isHydrated, user]);

  const addToWishlist = async (productId: string) => {
    if (user?.token) {
      // Add to database for authenticated users
      try {
        setLoading(true);
        const updatedWishlist = await apiAddToWishlist(productId, user.token);
        const wishlistItems = updatedWishlist.map((product: any) => ({
          productId: product._id,
          addedAt: new Date().toISOString(),
        }));
        setWishlist(wishlistItems);
      } catch (error) {
        console.error("Error adding to wishlist:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Add to localStorage for guest users
      setWishlist((prev) => {
        const exists = prev.find((item) => item.productId === productId);
        if (exists) return prev;
        return [...prev, { productId, addedAt: new Date().toISOString() }];
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (user?.token) {
      // Remove from database for authenticated users
      try {
        setLoading(true);
        const updatedWishlist = await apiRemoveFromWishlist(
          productId,
          user.token
        );
        const wishlistItems = updatedWishlist.map((product: any) => ({
          productId: product._id,
          addedAt: new Date().toISOString(),
        }));
        setWishlist(wishlistItems);
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Remove from localStorage for guest users
      setWishlist((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
        clearWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
