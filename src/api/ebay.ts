export interface EbaySearchParams {
  q?: string;                    // Keyword search
  category_ids?: string;         // Category ID filter
  epid?: string;                // eBay Product ID
  gtin?: string;                // Global Trade Item Number
  charity_id?: string;          // Charity ID
  limit?: number;               // Number of items to return (max 200)
  offset?: number;              // Starting point for results
  sort?: 'price' | 'newlyListed' | 'endingSoonest' | 'bestMatch';
  filter?: string;              // Additional filters
  aspect_filter?: string;       // Item aspect filters
  fieldgroups?: string;         // What data to return (MATCHING_ITEMS, FULL, etc.)
}

export interface EbaySearchResult {
  itemSummaries?: EbayItemSummary[];
  total?: number;
  limit?: number;
  offset?: number;
  next?: string;
  prev?: string;
  warnings?: any[];
}

export interface EbayItemSummary {
  itemId: string;
  title: string;
  leafCategoryIdPath: string;
  categoryId: string;
  categoryIdPath: string;
  categories: EbayCategory[];
  image: EbayImage;
  price: EbayPrice;
  itemHref: string;
  seller: EbaySeller;
  condition: string;
  conditionId: string;
  thumbnailImages: EbayImage[];
  shippingOptions: EbayShippingOption[];
  buyingOptions: string[];
  itemAffiliateWebUrl?: string;
  itemWebUrl: string;
  itemLocation: EbayItemLocation;
  additionalImages?: EbayImage[];
  adultOnly?: boolean;
  availableCoupons?: boolean;
  bidCount?: number;
  currentBidPrice?: EbayPrice;
  eligibleForInlineCheckout?: boolean;
  enabledForGuestCheckout?: boolean;
  energyEfficiencyClass?: string;
  epid?: string;
  itemCreationDate?: string;
  itemEndDate?: string;
  itemGroupHref?: string;
  itemGroupType?: string;
  legacyItemId?: string;
  listingMarketplaceId?: string;
  marketingPrice?: EbayMarketingPrice;
  pickupOptions?: EbayPickupOption[];
  priorityListing?: boolean;
  qualifiedPrograms?: string[];
  quantityLimitPerBuyer?: number;
  reservePriceMet?: boolean;
  sellerItemRevision?: string;
  shippingCost?: EbayPrice;
  shortDescription?: string;
  topRatedBuyingExperience?: boolean;
  tyreLabelImageUrl?: string;
  unitPrice?: EbayPrice;
  unitPriceBasis?: string;
  watchCount?: number;
}

export interface EbayItemDetail {
  itemId: string;
  title: string;
  subtitle?: string;
  shortDescription?: string;
  description?: string;
  categoryId: string;
  categoryIdPath: string;
  categoryPath: string;
  categories: EbayCategory[];
  condition: string;
  conditionId: string;
  conditionDescription?: string;
  conditionDescriptors?: EbayConditionDescriptor[];
  image: EbayImage;
  additionalImages?: EbayImage[];
  brand?: string;
  mpn?: string;
  gtin?: string;
  aspects?: { [key: string]: string[] };
  color?: string;
  pattern?: string;
  material?: string;
  size?: string;
  sizeSystem?: string;
  sizeType?: string;
  gender?: string;
  ageGroup?: string;
  price: EbayPrice;
  originalPrice?: EbayPrice;
  minimumPriceToBid?: EbayPrice;
  currentBidPrice?: EbayPrice;
  bidCount?: number;
  seller: EbaySeller;
  sellerItemRevision?: string;
  buyingOptions: string[];
  itemWebUrl: string;
  itemAffiliateWebUrl?: string;
  itemLocation: EbayItemLocation;
  shippingOptions: EbayShippingOption[];
  shipToLocations?: EbayShipToLocation;
  returnTerms?: EbayReturnTerms;
  taxes?: EbayTax[];
  localizedAspects?: EbayLocalizedAspect[];
  primaryItemGroup?: EbayItemGroup;
  commonDescriptions?: EbayCommonDescription[];
  warnings?: any[];
  listingMarketplaceId?: string;
  qualifiedPrograms?: string[];
  quantityLimitPerBuyer?: number;
  lotSize?: number;
  legacyItemId?: string;
  priorityListing?: boolean;
  adultOnly?: boolean;
  categoryTreeVersion?: string;
  itemCreationDate?: string;
  topRatedBuyingExperience?: boolean;
  enabledForGuestCheckout?: boolean;
  eligibleForInlineCheckout?: boolean;
  availableCoupons?: boolean;
  authenticityGuarantee?: EbayAuthenticityGuarantee;
  authenticityVerification?: EbayAuthenticityVerification;
  estimatedAvailabilities?: EbayEstimatedAvailability[];
  productFicheWebUrl?: string;
  energyEfficiencyClass?: string;
  hazmat?: EbayHazmat;
}

// Supporting interfaces
export interface EbayCategory {
  categoryId: string;
  categoryName: string;
}

export interface EbayImage {
  imageUrl: string;
  height?: number;
  width?: number;
}

export interface EbayPrice {
  value: string;
  currency: string;
}

export interface EbaySeller {
  username: string;
  feedbackPercentage: string;
  feedbackScore: number;
  sellerAccountType?: string;
}

export interface EbayShippingOption {
  shippingCost: EbayPrice;
  shippingCostType: string;
  type?: string;
  serviceType?: string;
  minEstimatedDeliveryDate?: string;
  maxEstimatedDeliveryDate?: string;
  guaranteedDelivery?: boolean;
}

export interface EbayItemLocation {
  postalCode?: string;
  country: string;
  city?: string;
  stateOrProvince?: string;
}

export interface EbayMarketingPrice {
  originalPrice: EbayPrice;
  discountPercentage: string;
  discountAmount: EbayPrice;
  priceTreatment: string;
}

export interface EbayPickupOption {
  pickupLocationType: string;
  pickupLocationId?: string;
}

export interface EbayConditionDescriptor {
  name: string;
  values: string[];
}

export interface EbayShipToLocation {
  regionIncluded?: EbayShipToRegion[];
  regionExcluded?: EbayShipToRegion[];
}

export interface EbayShipToRegion {
  regionName: string;
  regionType: string;
}

export interface EbayReturnTerms {
  returnsAccepted: boolean;
  refundMethod?: string;
  returnMethod?: string;
  returnPeriod?: EbayTimeDuration;
  returnShippingCostPayer?: string;
  restockingFeePercentage?: string;
}

export interface EbayTimeDuration {
  value: number;
  unit: string;
}

export interface EbayTax {
  taxJurisdiction: EbayTaxJurisdiction;
  taxType: string;
  collectionMethod: string;
  amount?: EbayPrice;
  percentage?: string;
}

export interface EbayTaxJurisdiction {
  region: EbayShipToRegion;
  taxJurisdictionId: string;
}

export interface EbayLocalizedAspect {
  type: string;
  name: string;
  value: string;
}

export interface EbayItemGroup {
  itemGroupHref: string;
  itemGroupId: string;
  itemGroupTitle: string;
  itemGroupType: string;
  itemGroupImage?: EbayImage;
}

export interface EbayCommonDescription {
  description: string;
  audience?: string;
  useCase?: string;
}

export interface EbayAuthenticityGuarantee {
  description: string;
  terms: string;
}

export interface EbayAuthenticityVerification {
  description: string;
  terms: string;
  type: string;
}

export interface EbayEstimatedAvailability {
  deliveryOptions: string[];
  estimatedAvailabilityStatus: string;
  estimatedAvailableQuantity?: number;
  estimatedSoldQuantity?: number;
}

export interface EbayHazmat {
  component: string;
  pictograms: EbayHazmatPictogram[];
  precautionaryStatements: string[];
  statements: string[];
  signalWords: string[];
}

export interface EbayHazmatPictogram {
  pictogramDescription: string;
  pictogramId: string;
  pictogramUrl: string;
}

export interface EbayOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface EbayApiError {
  errorId: number;
  domain: string;
  category: string;
  message: string;
  longMessage?: string;
  subdomain?: string;
  severity?: string;
  parameters?: EbayErrorParameter[];
}

export interface EbayErrorParameter {
  name: string;
  value: string;
}

export class EbayApiService {
  private baseUrl: string;
  private environment: 'SANDBOX' | 'PRODUCTION';
  private ebayAuthToken: any;

  constructor(
    clientId?: string,
    clientSecret?: string,
    environment: 'SANDBOX' | 'PRODUCTION' = 'PRODUCTION'
  ) {
    this.environment = environment;
    this.baseUrl = environment === 'SANDBOX' 
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';

    // Initialize the official eBay OAuth client with proper configuration
    try {
      // Dynamic import for the eBay OAuth library
      const EbayAuthToken = require('ebay-oauth-nodejs-client');
      
      // Use config file approach if no direct credentials provided
      if (!clientId || !clientSecret) {
        this.ebayAuthToken = new EbayAuthToken({
          filePath: 'ebay-config.json'
        });
      } else {
        // Fallback to direct credentials (for backwards compatibility)
        this.ebayAuthToken = new EbayAuthToken({
          clientId,
          clientSecret,
          env: environment,
          redirectUri: 'http://localhost:3000/auth/ebay/callback'
        });
      }
    } catch (error) {
      throw new Error(`Failed to initialize eBay OAuth client: ${error}`);
    }
  }

  /**
   * Get access token using the official eBay OAuth library
   */
  private async getAccessToken(): Promise<string> {
    try {
      const tokenResponse = await this.ebayAuthToken.getApplicationToken(this.environment);
      
      // Handle both string token response and object response
      let accessToken: string;
      if (typeof tokenResponse === 'string') {
        accessToken = tokenResponse;
      } else if (tokenResponse && tokenResponse.access_token) {
        accessToken = tokenResponse.access_token;
      } else {
        throw new Error('No access token received from eBay OAuth service');
      }

      return accessToken;
    } catch (error) {
      throw new Error(`Failed to get eBay access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make authenticated request to eBay API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    marketplaceId: string = 'EBAY_GB'
  ): Promise<T> {
    const token = await this.getAccessToken();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw new Error(`eBay API Error: ${response.status} - ${errorData.message || errorText}`);
    }

    return response.json();
  }

  /**
   * Search for items using the Browse API
   * Documentation: https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
   */
  async search(params: EbaySearchParams, marketplaceId: string = 'EBAY_GB'): Promise<EbaySearchResult> {
    const queryParams = new URLSearchParams();

    // Add search parameters
    if (params.q) queryParams.append('q', params.q);
    if (params.category_ids) queryParams.append('category_ids', params.category_ids);
    if (params.epid) queryParams.append('epid', params.epid);
    if (params.gtin) queryParams.append('gtin', params.gtin);
    if (params.charity_id) queryParams.append('charity_id', params.charity_id);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.filter) queryParams.append('filter', params.filter);
    if (params.aspect_filter) queryParams.append('aspect_filter', params.aspect_filter);
    if (params.fieldgroups) queryParams.append('fieldgroups', params.fieldgroups);

    const endpoint = `/buy/browse/v1/item_summary/search?${queryParams.toString()}`;
    return this.makeRequest<EbaySearchResult>(endpoint, {}, marketplaceId);
  }

  /**
   * Get detailed item information using the Browse API
   * Documentation: https://developer.ebay.com/api-docs/buy/browse/resources/item/methods/getItem
   */
  async getItem(itemId: string, marketplaceId: string = 'EBAY_GB'): Promise<EbayItemDetail> {
    const endpoint = `/buy/browse/v1/item/${itemId}`;
    return this.makeRequest<EbayItemDetail>(endpoint, {}, marketplaceId);
  }

  /**
   * Search for Funko Pop items specifically
   */
  async searchFunkoPops(
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
  ): Promise<EbaySearchResult> {
    // Build search query
    let query = `"${name}" funko pop`;
    if (series) query += ` "${series}"`;
    if (number) query += ` ${number}`;

    const params: EbaySearchParams = {
      q: query,
      limit: options.limit || 50,
      sort: options.sortBy || 'bestMatch',
    };

    // Add filters
    const filters: string[] = [];
    
    if (options.condition && options.condition !== 'both') {
      filters.push(`conditionIds:{${options.condition === 'new' ? '1000' : '3000|4000|5000|6000'}}`);
    }

    if (options.priceRange) {
      const currency = options.marketplace === 'EBAY_US' ? 'USD' : 'GBP';
      if (options.priceRange.min) {
        filters.push(`price:[${options.priceRange.min}..], priceCurrency:${currency}`);
      }
      if (options.priceRange.max) {
        filters.push(`price:[..${options.priceRange.max}], priceCurrency:${currency}`);
      }
    }

    if (filters.length > 0) {
      params.filter = filters.join(',');
    }

    return this.search(params, options.marketplace || 'EBAY_GB');
  }

  /**
   * Get sold listings for price analysis (requires advanced filters)
   */
  async getSoldListings(
    searchQuery: string,
    options: {
      limit?: number;
      daysBack?: number;
      marketplace?: string;
    } = {}
  ): Promise<EbaySearchResult> {
    const params: EbaySearchParams = {
      q: searchQuery,
      limit: options.limit || 50,
      filter: 'buyingOptions:{FIXED_PRICE|AUCTION},itemLocationCountry:GB',
      sort: 'endingSoonest',
    };

    // Note: eBay Browse API doesn't have direct access to sold listings
    // This would typically require Trading API or Advanced Search capabilities
    // For now, we'll search current listings which is what the Browse API supports
    return this.search(params, options.marketplace || 'EBAY_GB');
  }

  /**
   * Get item by legacy eBay item number
   */
  async getItemByLegacyId(legacyItemId: string, marketplaceId: string = 'EBAY_GB'): Promise<EbayItemDetail> {
    const endpoint = `/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${legacyItemId}`;
    return this.makeRequest<EbayItemDetail>(endpoint, {}, marketplaceId);
  }

  /**
   * Get multiple items by their IDs
   */
  async getItemsByIds(itemIds: string[], marketplaceId: string = 'EBAY_GB'): Promise<{ items: EbayItemDetail[] }> {
    const endpoint = `/buy/browse/v1/item/get_items_by_item_group`;
    return this.makeRequest<{ items: EbayItemDetail[] }>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({ item_ids: itemIds }),
      },
      marketplaceId
    );
  }
}

// Utility functions
export const createEbayService = (
  clientId?: string,
  clientSecret?: string,
  environment: 'SANDBOX' | 'PRODUCTION' = 'PRODUCTION'
): EbayApiService => {
  const id = clientId || process.env.VITE_EBAY_CLIENT_ID || '';
  const secret = clientSecret || process.env.VITE_EBAY_CLIENT_SECRET || '';
  
  if (!id || !secret) {
    throw new Error('eBay client ID and secret are required');
  }

  return new EbayApiService(id, secret, environment);
};

export default EbayApiService; 