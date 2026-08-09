import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSound } from './SoundContext';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { playClick, playSuccess } = useSound();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('projectxia_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [purchasedOrder, setPurchasedOrder] = useState(null);

  useEffect(() => {
    localStorage.setItem('projectxia_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (project, openDrawer = true) => {
    playClick();
    setCart((prev) => {
      const exists = prev.find((item) => item._id === project._id);
      if (exists) return prev;
      return [...prev, { ...project, addedAt: new Date() }];
    });
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (projectId) => {
    playClick();
    setCart((prev) => prev.filter((item) => item._id !== projectId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('projectxia_cart');
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const platformFee = cartSubtotal > 0 ? 99 : 0; // ₹99 Verification & Escrow Shield Fee
  const cartTotal = cartSubtotal + platformFee;

  const handleCheckout = () => {
    playClick();
    if (!isAuthenticated) {
      setIsCartOpen(false);
      openAuthModal('otp', 'Please verify your mobile or email via OTP to receive your engineering project blueprints and commercial license.');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const completeOrder = (paymentDetails) => {
    playSuccess();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

    const newOrder = {
      orderId: `XIA-ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      items: [...cart],
      totalAmount: cartTotal,
      paymentMethod: paymentDetails?.method || 'Instant UPI / Card Escrow',
      purchasedAt: new Date(),
      deliveryStatus: 'INSTANT_BLUEPRINT_DELIVERED',
      licenseKey: `XIA-LIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`,
    };

    // Save order in local history
    const existingOrders = JSON.parse(localStorage.getItem('projectxia_orders') || '[]');
    existingOrders.unshift(newOrder);
    localStorage.setItem('projectxia_orders', JSON.stringify(existingOrders));

    setPurchasedOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.length,
        isCartOpen,
        isCheckoutOpen,
        purchasedOrder,
        cartSubtotal,
        platformFee,
        cartTotal,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openCheckout: () => setIsCheckoutOpen(true),
        closeCheckout: () => setIsCheckoutOpen(false),
        clearPurchasedOrder: () => setPurchasedOrder(null),
        addToCart,
        removeFromCart,
        clearCart,
        handleCheckout,
        completeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
