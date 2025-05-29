require('dotenv').config();
const EbayAuthToken = require('ebay-oauth-nodejs-client');

// Load eBay API credentials from .env
const CLIENT_ID = process.env.EBAY_CLIENT_ID;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;

const ebayAuthToken = new EbayAuthToken({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET
});

async function main() {
  try {
    const tokenResponse = await ebayAuthToken.getApplicationToken('PRODUCTION');
    console.log('eBay OAuth token fetched:', tokenResponse.access_token ? 'SUCCESS' : 'FAIL');
    // TODO: Add main scraping logic here
  } catch (err) {
    console.error('Failed to fetch eBay token:');
    try {
      console.error('String:', String(err));
      console.error('JSON:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      for (const key in err) {
        console.error(`err[${key}]:`, err[key]);
      }
      if (err.stack) console.error('Stack:', err.stack);
      // Print prototype chain
      let proto = Object.getPrototypeOf(err);
      while (proto) {
        console.error('Prototype:', proto);
        proto = Object.getPrototypeOf(proto);
      }
      // Print raw error
      console.log('Raw error:', err);
    } catch (e) {
      console.error('Error printing error:', e);
      console.error(err);
    }
  }
}

main(); 