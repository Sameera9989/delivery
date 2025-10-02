// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);

  // Load user & cart from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart]);

  // Login function
 const login = (email) => {
  const user = { email, name: email.split('@')[0] };
  setCurrentUser(user);
  localStorage.setItem('user', JSON.stringify(user));
  // Force redirect
  window.location.href = '/home';
};

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
    } catch (e) {
      console.error("Error clearing storage", e);
    }
    window.location.href = '/login';
  };

  // Add to cart
  const addToCart = (dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.name === dish.name);
      return existing
        ? prev.map((item) =>
            item.dish.name === dish.name
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { dish, quantity: 1 }];
    });
  };

  // Get total price as string (e.g., "12.99")
  const getTotalPrice = () => {
    const total = cart.reduce((sum, item) => {
      const price = parseFloat(item.dish.price.replace('$', '')) || 0;
      return sum + price * item.quantity;
    }, 0);
    return total.toFixed(2); // Returns string like "12.99"
  };

  // Clear cart
  const clearCart = () => setCart([]);

  // Return all values (as strings, numbers, arrays — NOT rendered directly)
  return (
    <AuthContext.Provider value={{
      currentUser,     // object, but only accessed via destructuring
      login,           // function
      logout,          // function
      cart,            // array
      addToCart,       // function
      getTotalPrice,   // function returning string
      clearCart,       // function
      orderHistory,    // array
      setOrderHistory  // function
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;