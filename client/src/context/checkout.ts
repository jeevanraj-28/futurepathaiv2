import { createContext, useContext } from 'react';

export const CheckoutContext = createContext<{ openCheckout: (planCode: string) => void } | undefined>(undefined);

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within a CheckoutProvider');
  return ctx;
};
