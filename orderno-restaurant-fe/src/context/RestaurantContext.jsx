import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { itemMenuAPI } from '../services';

const RestaurantContext = createContext(null);
const CART_STORAGE_KEY = 'ordeno_cart';

function parseAttributes(attr) {
  if (!attr) return {};
  if (typeof attr === 'object') return attr;
  try {
    return JSON.parse(attr);
  } catch {
    return {};
  }
}

export function normalizeDish(dish) {
  if (!dish) return null;
  const attrs = parseAttributes(dish.attributes);
  const activePrice =
    dish.discount_price != null ? Number(dish.discount_price) : Number(dish.original_price);

  return {
    id: Number(dish.id),
    name: dish.name,
    price: activePrice,
    originalPrice: Number(dish.original_price),
    discount_price: dish.discount_price != null ? Number(dish.discount_price) : null,
    discount_percent: dish.discount_percent,
    image: dish.image_url || dish.image,
    image_url: dish.image_url || dish.image,
    unit: attrs.unit || dish.unit || 'portion',
    category_name: dish.category_name,
    is_available: dish.is_available !== 0,
  };
}

function getStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const id = Number(item.id || item.dish?.id);
        const quantity = Math.max(1, Number(item.quantity) || 1);
        if (!id || isNaN(id)) return null;
        return {
          cartItemId:
            item.cartItemId || `cart-${id}-${Math.random().toString(36).slice(2, 7)}`,
          id,
          quantity,
          note: item.note || '',
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error('Failed to parse cart from localStorage:', err);
    return [];
  }
}

function saveStoredCart(items) {
  try {
    const minimal = items.map((item) => ({
      cartItemId: item.cartItemId,
      id: Number(item.dish?.id || item.id),
      quantity: Math.max(1, Number(item.quantity) || 1),
      note: item.note || '',
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(minimal));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
}

export function RestaurantProvider({ children }) {
  const [orderMode, setOrderMode] = useState('pre-order');
  const [preselectedSpaceId, setPreselectedSpaceId] = useState(null);
  const [latestBooking, setLatestBooking] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Raw cart items stored in localStorage [{ cartItemId, id, quantity, note }]
  const [storedCart, setStoredCart] = useState(() => getStoredCart());

  // In-memory hydrated cart items with live dish details:
  // [{ cartItemId, id, quantity, note, dish }]
  const [cartItems, setCartItems] = useState([]);

  // Dish cache ref for instant calculations before/after API hydration (stable ref prevents infinite render loops)
  const dishCacheRef = useRef({});

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  // Hydrate cart from Backend API (stable function identity)
  const hydrateCart = useCallback(async () => {
    const items = getStoredCart();
    setStoredCart(items);

    if (items.length === 0) {
      setCartItems([]);
      return [];
    }

    const uniqueIds = [
      ...new Set(
        items.map((it) => Number(it.id)).filter((id) => !isNaN(id) && id > 0)
      ),
    ];
    if (uniqueIds.length === 0) {
      setCartItems([]);
      return [];
    }

    try {
      const fetchedDishes = await itemMenuAPI.getBatchByIds(uniqueIds);
      const dishMap = new Map();
      fetchedDishes.forEach((d) => {
        const norm = normalizeDish(d);
        if (norm) {
          dishMap.set(Number(norm.id), norm);
          dishCacheRef.current[Number(norm.id)] = norm;
        }
      });

      const validStored = [];
      const hydrated = [];

      items.forEach((item) => {
        const dishId = Number(item.id);
        const dish = dishMap.get(dishId) || dishCacheRef.current[dishId];
        if (dish && dish.is_available) {
          validStored.push(item);
          hydrated.push({
            cartItemId: item.cartItemId,
            id: dishId,
            quantity: item.quantity,
            note: item.note || '',
            dish,
          });
        }
      });

      if (validStored.length !== items.length) {
        saveStoredCart(validStored);
        setStoredCart(validStored);
      }

      setCartItems(hydrated);
      return hydrated;
    } catch (err) {
      console.error('Failed to hydrate cart from API:', err);
      // Fallback: match whatever is in dishCacheRef
      const hydrated = items
        .map((item) => {
          const dish = dishCacheRef.current[Number(item.id)];
          if (!dish) return null;
          return {
            cartItemId: item.cartItemId,
            id: Number(item.id),
            quantity: item.quantity,
            note: item.note,
            dish,
          };
        })
        .filter(Boolean);
      setCartItems(hydrated);
      return hydrated;
    }
  }, []);

  const addToCart = useCallback(
    ({ dish, quantity = 1, note = '' }) => {
      const dishId = Number(dish.id);
      const normalized = normalizeDish(dish);

      setStoredCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => Number(item.id) === dishId && item.note === note
        );

        let updated;
        let targetCartItemId;
        if (existingIndex > -1) {
          updated = [...prev];
          targetCartItemId = updated[existingIndex].cartItemId;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
        } else {
          targetCartItemId = `cart-${dishId}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 6)}`;
          updated = [
            ...prev,
            {
              cartItemId: targetCartItemId,
              id: dishId,
              quantity,
              note,
            },
          ];
        }
        saveStoredCart(updated);

        // Also update in-memory hydrated items for smooth instant UI reaction
        if (normalized) {
          setCartItems((currentHydrated) => {
            const hIdx = currentHydrated.findIndex(
              (h) => h.cartItemId === targetCartItemId
            );
            if (hIdx > -1) {
              const nextH = [...currentHydrated];
              nextH[hIdx] = {
                ...nextH[hIdx],
                quantity: nextH[hIdx].quantity + quantity,
              };
              return nextH;
            }
            return [
              ...currentHydrated,
              {
                cartItemId: targetCartItemId,
                id: dishId,
                quantity,
                note,
                dish: normalized,
              },
            ];
          });
        }

        return updated;
      });

      if (normalized) {
        dishCacheRef.current[dishId] = normalized;
      }

      showToast(`Added "${dish.name}" to cart!`);
    },
    [showToast]
  );

  const addUpsellToCart = useCallback(
    (upsell) => {
      const dishFormat = {
        id: Number(upsell.id),
        name: upsell.name,
        original_price: upsell.price,
        discount_price: null,
        unit: upsell.unit,
        image_url: upsell.image,
      };
      addToCart({
        dish: dishFormat,
        quantity: 1,
        note: '',
      });
    },
    [addToCart]
  );

  const removeItemFromCart = useCallback((cartItemId) => {
    setStoredCart((prev) => {
      const updated = prev.filter((item) => item.cartItemId !== cartItemId);
      saveStoredCart(updated);
      return updated;
    });
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateCartQuantity = useCallback(
    (cartItemId, newQty) => {
      if (newQty <= 0) {
        removeItemFromCart(cartItemId);
        return;
      }
      setStoredCart((prev) => {
        const updated = prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
        );
        saveStoredCart(updated);
        return updated;
      });
      setCartItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
        )
      );
    },
    [removeItemFromCart]
  );

  const clearCart = useCallback(() => {
    setStoredCart([]);
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const confirmBooking = useCallback(
    (booking) => {
      setLatestBooking(booking);
      showToast(`Reservation #${booking.code} confirmed successfully!`);
    },
    [showToast]
  );

  const cartCount = useMemo(
    () => storedCart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [storedCart]
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (Number(item.dish?.price) || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      orderMode,
      setOrderMode,
      preselectedSpaceId,
      setPreselectedSpaceId,
      latestBooking,
      confirmBooking,
      toastMsg,
      showToast,
      storedCart,
      cartItems,
      cartCount,
      cartTotal,
      hydrateCart,
      addToCart,
      addUpsellToCart,
      updateCartQuantity,
      removeItemFromCart,
      clearCart,
    }),
    [
      orderMode,
      preselectedSpaceId,
      latestBooking,
      confirmBooking,
      toastMsg,
      showToast,
      storedCart,
      cartItems,
      cartCount,
      cartTotal,
      hydrateCart,
      addToCart,
      addUpsellToCart,
      updateCartQuantity,
      removeItemFromCart,
      clearCart,
    ]
  );

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
