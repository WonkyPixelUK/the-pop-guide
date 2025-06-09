import { useState, useCallback, useRef } from 'react';
import { createEbayService, EbaySearchParams, EbaySearchResult, EbayItemDetail } from '../api/ebay';

interface UseEbayApiOptions {
  clientId?: string;
  clientSecret?: string;
  environment?: 'SANDBOX' | 'PRODUCTION';
}

interface EbayApiState {
  loading: boolean;
  error: string | null;
  data: any;
}

export const useEbayApi = (options: UseEbayApiOptions = {}) => {
  const [state, setState] = useState<EbayApiState>({
    loading: false,
    error: null,
    data: null,
  });

  const ebayServiceRef = useRef<ReturnType<typeof createEbayService> | null>(null);

  const getEbayService = useCallback(() => {
    if (!ebayServiceRef.current) {
      try {
        ebayServiceRef.current = createEbayService(
          options.clientId,
          options.clientSecret,
          options.environment
        );
      } catch (error) {
        throw new Error(`Failed to initialize eBay service: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    return ebayServiceRef.current;
  }, [options.clientId, options.clientSecret, options.environment]);

  const search = useCallback(async (
    params: EbaySearchParams,
    marketplaceId?: string
  ): Promise<EbaySearchResult | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const service = getEbayService();
      const result = await service.search(params, marketplaceId);
      setState(prev => ({ ...prev, loading: false, data: result }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, [getEbayService]);

  const getItem = useCallback(async (
    itemId: string,
    marketplaceId?: string
  ): Promise<EbayItemDetail | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const service = getEbayService();
      const result = await service.getItem(itemId, marketplaceId);
      setState(prev => ({ ...prev, loading: false, data: result }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, [getEbayService]);

  const searchFunkoPops = useCallback(async (
    name: string,
    series?: string,
    number?: string,
    options: {
      limit?: number;
      condition?: 'new' | 'used' | 'both';
      priceRange?: { min?: number; max?: number };
      sortBy?: 'price' | 'newlyListed' | 'endingSoonest' | 'bestMatch';
      marketplace?: string;
    } = {}
  ): Promise<EbaySearchResult | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const service = getEbayService();
      const result = await service.searchFunkoPops(name, series, number, options);
      setState(prev => ({ ...prev, loading: false, data: result }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, [getEbayService]);

  const getSoldListings = useCallback(async (
    searchQuery: string,
    options: {
      limit?: number;
      daysBack?: number;
      marketplace?: string;
    } = {}
  ): Promise<EbaySearchResult | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const service = getEbayService();
      const result = await service.getSoldListings(searchQuery, options);
      setState(prev => ({ ...prev, loading: false, data: result }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, [getEbayService]);

  const getItemByLegacyId = useCallback(async (
    legacyItemId: string,
    marketplaceId?: string
  ): Promise<EbayItemDetail | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const service = getEbayService();
      const result = await service.getItemByLegacyId(legacyItemId, marketplaceId);
      setState(prev => ({ ...prev, loading: false, data: result }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, [getEbayService]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    search,
    getItem,
    searchFunkoPops,
    getSoldListings,
    getItemByLegacyId,
    clearError,
    reset,
  };
};

export default useEbayApi; 