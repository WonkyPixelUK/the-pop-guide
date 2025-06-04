import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'GBP' | 'USD';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('GBP');
  const [isLoading, setIsLoading] = useState(true);

  // Load currency preference from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred-currency') as Currency;
    if (savedCurrency && (savedCurrency === 'GBP' || savedCurrency === 'USD')) {
      setCurrencyState(savedCurrency);
    }
    setIsLoading(false);
  }, []);

  // Update currency and save to localStorage
  const setCurrency = (newCurrency: Currency) => {
    const oldCurrency = currency;
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred-currency', newCurrency);
    
    // Show user feedback if currency actually changed
    if (oldCurrency !== newCurrency && !isLoading) {
      // Create a simple notification
      const message = newCurrency === 'USD' 
        ? 'Switched to USD - Prices converted from GBP' 
        : 'Switched to GBP - Original currency';
      
      // Simple browser notification (non-intrusive)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Currency Changed', { body: message, icon: '/favicon.ico' });
      } else {
        // Fallback: console log for development
        console.log(`💱 ${message}`);
      }
    }
    
    // Trigger a page refresh of pricing components by dispatching a custom event
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
} 