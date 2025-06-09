import React, { useState } from 'react';
import { useEbayApi } from '../hooks/useEbayApi';
import { EbayItemSummary } from '../api/ebay';

const EbayApiTest: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('funko pop batman');
  const [searchResults, setSearchResults] = useState<EbayItemSummary[]>([]);
  const [itemDetails, setItemDetails] = useState<any>(null);
  
  const ebayApi = useEbayApi({
    environment: 'PRODUCTION' // Change to 'SANDBOX' for testing
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const result = await ebayApi.search({
      q: searchQuery,
      limit: 10,
      sort: 'bestMatch'
    });
    
    if (result?.itemSummaries) {
      setSearchResults(result.itemSummaries);
    }
  };

  const handleSearchFunkoPops = async () => {
    const result = await ebayApi.searchFunkoPops(
      'Batman',
      'DC Comics',
      undefined,
      {
        limit: 10,
        condition: 'both',
        sortBy: 'price',
        marketplace: 'EBAY_GB'
      }
    );
    
    if (result?.itemSummaries) {
      setSearchResults(result.itemSummaries);
    }
  };

  const handleGetItemDetails = async (itemId: string) => {
    const result = await ebayApi.getItem(itemId);
    if (result) {
      setItemDetails(result);
    }
  };

  const formatPrice = (price: { value: string; currency: string }) => {
    return `${price.currency} ${price.value}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">eBay API Test</h1>
      
      {/* Search Section */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Search eBay Items</h2>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <button
            onClick={handleSearch}
            disabled={ebayApi.loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
          >
            {ebayApi.loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={handleSearchFunkoPops}
            disabled={ebayApi.loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded"
          >
            {ebayApi.loading ? 'Searching...' : 'Search Funko Pops'}
          </button>
        </div>

        {ebayApi.error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            <strong>Error:</strong> {ebayApi.error}
            <button
              onClick={ebayApi.clearError}
              className="ml-2 px-2 py-1 bg-red-700 hover:bg-red-800 rounded text-sm"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Search Results ({searchResults.length})
          </h2>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {searchResults.map((item) => (
              <div key={item.itemId} className="border border-gray-700 p-3 rounded">
                <div className="flex gap-3">
                  {item.image && (
                    <img
                      src={item.image.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-green-400 font-semibold">
                      {formatPrice(item.price)}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Condition: {item.condition}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Seller: {item.seller.username} ({item.seller.feedbackPercentage}%)
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleGetItemDetails(item.itemId)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                      >
                        View Details
                      </button>
                      <a
                        href={item.itemWebUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                      >
                        View on eBay
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Item Details</h2>
          
          {itemDetails ? (
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg mb-2">{itemDetails.title}</h3>
                {itemDetails.image && (
                  <img
                    src={itemDetails.image.imageUrl}
                    alt={itemDetails.title}
                    className="w-32 h-32 object-cover rounded mb-3"
                  />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Price:</strong> {formatPrice(itemDetails.price)}
                </div>
                <div>
                  <strong>Condition:</strong> {itemDetails.condition}
                </div>
                <div>
                  <strong>Category:</strong> {itemDetails.categories?.[0]?.categoryName || 'N/A'}
                </div>
                <div>
                  <strong>Location:</strong> {itemDetails.itemLocation.country}
                </div>
                <div>
                  <strong>Seller:</strong> {itemDetails.seller.username}
                </div>
                <div>
                  <strong>Feedback:</strong> {itemDetails.seller.feedbackScore} ({itemDetails.seller.feedbackPercentage}%)
                </div>
              </div>

              {itemDetails.shortDescription && (
                <div>
                  <strong>Description:</strong>
                  <p className="text-gray-300 text-sm mt-1">
                    {itemDetails.shortDescription}
                  </p>
                </div>
              )}

              {itemDetails.shippingOptions && itemDetails.shippingOptions.length > 0 && (
                <div>
                  <strong>Shipping:</strong>
                  <div className="text-sm text-gray-300 mt-1">
                    {itemDetails.shippingOptions[0].shippingCost.value === '0.0' 
                      ? 'Free shipping' 
                      : `${formatPrice(itemDetails.shippingOptions[0].shippingCost)} shipping`
                    }
                  </div>
                </div>
              )}

              <div className="pt-3">
                <a
                  href={itemDetails.itemWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  View on eBay
                </a>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">
              Click "View Details" on any search result to see more information.
            </p>
          )}
        </div>
      </div>

      {/* API Status */}
      <div className="mt-6 bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">API Status</h3>
        <div className="text-sm space-y-1">
          <div>Loading: {ebayApi.loading ? 'Yes' : 'No'}</div>
          <div>Error: {ebayApi.error || 'None'}</div>
          <div>Last Response: {ebayApi.data ? 'Available' : 'None'}</div>
        </div>
      </div>

      {/* Environment Variables Info */}
      <div className="mt-6 bg-yellow-600 text-black p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Setup Required</h3>
        <p className="text-sm">
          To use this eBay API integration, you need to set the following environment variables:
        </p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
          <li><code>VITE_EBAY_CLIENT_ID</code> - Your eBay App Client ID</li>
          <li><code>VITE_EBAY_CLIENT_SECRET</code> - Your eBay App Client Secret</li>
        </ul>
        <p className="text-sm mt-2">
          Get these from your eBay Developer Account at{' '}
          <a 
            href="https://developer.ebay.com/my/keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            https://developer.ebay.com/my/keys
          </a>
        </p>
      </div>
    </div>
  );
};

export default EbayApiTest; 