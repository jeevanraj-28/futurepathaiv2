import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckoutModal } from '../components/CheckoutModal';

const CheckoutContext = createContext<{ openCheckout: (planCode: string) => void } | undefined>(undefined);

/** Lets any page open the Razorpay checkout without passing callbacks down the tree. */
export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [planCode, setPlanCode] = useState<string | null>(null);
  const openCheckout = useCallback((code: string) => setPlanCode(code), []);

  return (
    <CheckoutContext.Provider value={{ openCheckout }}>
      {children}
      {planCode && <CheckoutModal planCode={planCode} onClose={() => setPlanCode(null)} />}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within a CheckoutProvider');
  return ctx;
};
