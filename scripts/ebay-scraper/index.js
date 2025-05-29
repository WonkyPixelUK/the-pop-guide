require('dotenv').config();
const axios = require('axios');
const qs = require('qs');
const EbayAuthToken = require('ebay-oauth-nodejs-client');

// Load eBay API credentials from .env
const CLIENT_ID = process.env.EBAY_CLIENT_ID;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const AUTH_CODE = process.env.EBAY_AUTH_CODE;
const RUNAME = process.env.EBAY_RUNAME;

async function exchangeAuthCodeForToken() {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  try {
    const response = await axios.post(
      'https://api.ebay.com/identity/v1/oauth2/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code: AUTH_CODE,
        redirect_uri: RUNAME
      }),
      {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('Access Token:', response.data.access_token);
    console.log('Refresh Token:', response.data.refresh_token);
  } catch (err) {
    console.error('Error exchanging code:', err.response?.data || err.message);
  }
}

const ebayAuthToken = new EbayAuthToken({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET
});

async function main() {
  if (AUTH_CODE) {
    await exchangeAuthCodeForToken();
    return;
  }
  try {
    const tokenResponse = await ebayAuthToken.getApplicationToken('PRODUCTION');
    const accessToken = tokenResponse.access_token;
    if (!accessToken) throw new Error('No access token received');
    console.log('eBay OAuth token fetched: SUCCESS');

    // Browse API: Search for Funko Pop items (UK)
    const response = await axios.get(
      'https://api.ebay.com/buy/browse/v1/item_summary/search',
      {
        params: { q: 'funko pop', limit: 3 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKPLACE-ID': 'EBAY_GB',
        },
      }
    );
    const items = response.data.itemSummaries || [];
    if (items.length === 0) {
      console.log('No items found.');
    } else {
      items.forEach((item, i) => {
        console.log(`Result #${i + 1}:`);
        console.log('  Title:', item.title);
        console.log('  Price:', item.price ? `${item.price.value} ${item.price.currency}` : 'N/A');
        console.log('  Item ID:', item.itemId);
        console.log('---');
      });
    }
  } catch (err) {
    console.error('Error:', err && (err.response?.data || err.message || err));
  }
}

main(); 