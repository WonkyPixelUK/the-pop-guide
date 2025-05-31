interface CoinbaseCharge {
  id: string;
  code: string;
  name: string;
  description: string;
  pricing: {
    local: { amount: string; currency: string };
    bitcoin?: { amount: string; currency: string };
    ethereum?: { amount: string; currency: string };
    litecoin?: { amount: string; currency: string };
  };
  payments: any[];
  timeline: any[];
  metadata: Record<string, any>;
  hosted_url: string;
  cancel_url: string;
  redirect_url: string;
  expires_at: string;
}

interface CreateChargeRequest {
  name: string;
  description: string;
  amount: string;
  currency: string;
  metadata: Record<string, any>;
  redirect_url: string;
  cancel_url: string;
}

class CoinbaseCommerce {
  private baseURL = 'https://api.commerce.coinbase.com';
  private apiKey: string;
  private apiVersion = '2018-03-22';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': this.apiKey,
        'X-CC-Version': this.apiVersion,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Coinbase API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async createCharge(data: CreateChargeRequest): Promise<CoinbaseCharge> {
    return this.request('/charges', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: data.amount,
          currency: data.currency,
        },
        metadata: data.metadata,
        redirect_url: data.redirect_url,
        cancel_url: data.cancel_url,
      }),
    });
  }

  async getCharge(chargeId: string): Promise<CoinbaseCharge> {
    return this.request(`/charges/${chargeId}`);
  }

  async listCharges(limit = 25): Promise<CoinbaseCharge[]> {
    const result = await this.request(`/charges?limit=${limit}`);
    return Array.isArray(result) ? result : [result];
  }
}

// Export a function to create instances (since we'll use this in Edge Functions)
export const createCoinbaseCommerce = (apiKey: string) => new CoinbaseCommerce(apiKey);
export type { CoinbaseCharge, CreateChargeRequest }; 