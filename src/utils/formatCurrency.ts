import { Currency } from '@/contexts/CurrencyContext';

// Cache for exchange rates
let cachedRates: { [key: string]: number } | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

// Fallback exchange rates (GBP as base currency)
const FALLBACK_RATES = {
  GBP: 1.0,
  USD: 1.27, // Approximate GBP to USD rate
};

// Fetch live exchange rates from a free API
async function fetchExchangeRates(): Promise<{ [key: string]: number }> {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (cachedRates && (now - lastFetch) < CACHE_DURATION) {
    return cachedRates;
  }
  
  try {
    // Using a free exchange rate API (no API key required)
    // Base currency is GBP, so GBP = 1.0
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/GBP');
    const data = await response.json();
    
    if (data.rates) {
      cachedRates = {
        GBP: 1.0,
        USD: data.rates.USD || FALLBACK_RATES.USD,
      };
      lastFetch = now;
      return cachedRates;
    }
  } catch (error) {
    console.warn('Failed to fetch live exchange rates, using fallback rates:', error);
  }
  
  // Return fallback rates if API fails
  return FALLBACK_RATES;
}

// Get exchange rates (synchronous with fallback)
function getExchangeRates(): { [key: string]: number } {
  // If we have cached rates, use them
  if (cachedRates) {
    return cachedRates;
  }
  
  // Otherwise, trigger async fetch for next time and return fallback
  fetchExchangeRates().catch(() => {
    // Silent fail, fallback rates will be used
  });
  
  return FALLBACK_RATES;
}

export function formatCurrency(value: number, currency: Currency, baseCurrency: Currency = 'GBP') {
  const rates = getExchangeRates();
  
  // Convert from base currency to target currency
  let convertedValue = value;
  
  if (baseCurrency !== currency) {
    // Convert from base currency to GBP first (if not already GBP)
    const gbpValue = baseCurrency === 'GBP' ? value : value / rates[baseCurrency];
    // Then convert from GBP to target currency
    convertedValue = gbpValue * rates[currency];
  }
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Currency conversion: ${value} ${baseCurrency} -> ${convertedValue.toFixed(2)} ${currency} (rate: ${rates[currency]})`);
  }
  
  if (currency === 'USD') {
    return `$${convertedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  // Default GBP
  return `£${convertedValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Export function to manually refresh exchange rates
export async function refreshExchangeRates(): Promise<void> {
  cachedRates = null;
  lastFetch = 0;
  await fetchExchangeRates();
}

// Initialize exchange rates on module load
fetchExchangeRates().catch(() => {
  // Silent fail, will use fallback rates
});

// Export test function for manual testing
export async function testCurrencyConversion(): Promise<void> {
  console.log('🧪 Testing currency conversion...');
  
  const rates = await fetchExchangeRates();
  console.log('📊 Current exchange rates:', rates);
  
  const testAmount = 10;
  const gbpFormatted = formatCurrency(testAmount, 'GBP');
  const usdFormatted = formatCurrency(testAmount, 'USD');
  
  console.log(`💷 ${testAmount} GBP = ${gbpFormatted}`);
  console.log(`💵 ${testAmount} GBP = ${usdFormatted}`);
  console.log(`📈 Exchange rate: 1 GBP = ${rates.USD} USD`);
}

// Make testCurrencyConversion available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as typeof window & { testCurrencyConversion: () => Promise<void> }).testCurrencyConversion = testCurrencyConversion;
} 