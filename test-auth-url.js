// Test to see what eBay expects for redirect URI
const clientId = 'RichCope-PopGuide-PRD-bf0240608-e93619a9';

// Common redirect URIs that might be configured
const possibleRedirectUris = [
  'http://localhost:3000/auth/ebay/callback',
  'http://localhost:8080/auth/ebay/callback', 
  'http://localhost:8081/api/ebay/oauth/callback',
  'https://pop-universe-tracker.vercel.app/auth/ebay/callback',
  'https://www.popguide.com/auth/ebay/callback'
];

console.log('Testing possible authorization URLs...\n');

possibleRedirectUris.forEach((uri, index) => {
  const authUrl = `https://auth.ebay.com/oauth2/authorize?` + 
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(uri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://api.ebay.com/oauth/api_scope')}`;
  
  console.log(`${index + 1}. Redirect URI: ${uri}`);
  console.log(`   Auth URL: ${authUrl}\n`);
});

console.log('Try each URL in your browser to see which one works without a 400 error.'); 