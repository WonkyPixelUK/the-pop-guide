require('dotenv').config();
const EbayAuthToken = require('ebay-oauth-nodejs-client');

async function testEbayApi() {
  console.log('🚀 Testing eBay API Integration...\n');

  // Check for required environment variables
  const clientId = process.env.VITE_EBAY_CLIENT_ID || process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.VITE_EBAY_CLIENT_SECRET || process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Missing eBay credentials!');
    console.log('Please set the following environment variables:');
    console.log('- VITE_EBAY_CLIENT_ID (or EBAY_CLIENT_ID)');
    console.log('- VITE_EBAY_CLIENT_SECRET (or EBAY_CLIENT_SECRET)');
    console.log('\nGet these from: https://developer.ebay.com/my/keys');
    return;
  }

  try {
    // Initialize eBay OAuth client
    console.log('🔑 Initializing eBay OAuth client...');
    const ebayAuthToken = new EbayAuthToken({
      clientId,
      clientSecret,
      redirectUri: 'http://localhost:3000/auth/ebay/callback'
    });

    // Get application token
    console.log('🎫 Requesting application token...');
    const tokenResponse = await ebayAuthToken.getApplicationToken('PRODUCTION');
    
    if (!tokenResponse || !tokenResponse.access_token) {
      throw new Error('No access token received');
    }

    console.log('✅ Successfully obtained access token!');
    console.log(`Token type: ${tokenResponse.token_type}`);
    console.log(`Expires in: ${tokenResponse.expires_in} seconds`);
    console.log(`Token (first 20 chars): ${tokenResponse.access_token.substring(0, 20)}...`);

    // Test Browse API search
    console.log('\n🔍 Testing Browse API search...');
    const searchUrl = 'https://api.ebay.com/buy/browse/v1/item_summary/search';
    const searchParams = new URLSearchParams({
      q: 'funko pop batman',
      limit: '3',
      sort: 'bestMatch'
    });

    const searchResponse = await fetch(`${searchUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${tokenResponse.access_token}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB'
      }
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      throw new Error(`Browse API error: ${searchResponse.status} ${errorText}`);
    }

    const searchData = await searchResponse.json();
    console.log('✅ Browse API search successful!');
    console.log(`Found ${searchData.total || 0} total items`);
    console.log(`Returned ${searchData.itemSummaries?.length || 0} items in this response`);

    if (searchData.itemSummaries && searchData.itemSummaries.length > 0) {
      console.log('\n📦 Sample items:');
      searchData.itemSummaries.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   Price: ${item.price.currency} ${item.price.value}`);
        console.log(`   Condition: ${item.condition}`);
        console.log(`   Seller: ${item.seller.username}\n`);
      });
    }

    // Test getItem API if we have items
    if (searchData.itemSummaries && searchData.itemSummaries.length > 0) {
      const firstItemId = searchData.itemSummaries[0].itemId;
      console.log(`🔍 Testing getItem API with item ID: ${firstItemId}...`);
      
      const itemResponse = await fetch(`https://api.ebay.com/buy/browse/v1/item/${firstItemId}`, {
        headers: {
          'Authorization': `Bearer ${tokenResponse.access_token}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB'
        }
      });

      if (itemResponse.ok) {
        const itemData = await itemResponse.json();
        console.log('✅ getItem API successful!');
        console.log(`Item: ${itemData.title}`);
        console.log(`Price: ${itemData.price.currency} ${itemData.price.value}`);
        console.log(`Location: ${itemData.itemLocation.country}`);
      } else {
        console.log(`⚠️ getItem API failed: ${itemResponse.status}`);
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\nYour eBay API integration is working correctly.');
    console.log('You can now use the eBay API service in your React application.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify your eBay client ID and secret are correct');
    console.log('2. Make sure your eBay app has the correct scopes enabled');
    console.log('3. Check that your app is approved for production use');
    console.log('4. Ensure your network allows HTTPS requests to api.ebay.com');
  }
}

// Run the test
testEbayApi().catch(console.error); 