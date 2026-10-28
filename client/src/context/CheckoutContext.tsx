import React, { useCallback, useState } from 'react';
import { CheckoutModal } from '../components/CheckoutModal';
import { CheckoutContext } from './checkout';

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
