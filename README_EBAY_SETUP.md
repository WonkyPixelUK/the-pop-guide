# eBay API Integration Setup

## Overview
This integration provides real-time eBay price analysis for Funko Pops and collectibles using eBay's Browse API.

## Features
- Real-time eBay marketplace data
- Price analysis with averages and ranges
- Item condition breakdown
- Seller information
- OAuth 2.0 authentication
- Support for both Sandbox and Production environments

## Setup Instructions

### 1. eBay Developer Account
1. Create an eBay Developer account at https://developer.ebay.com
2. Create a new application (both Sandbox and Production if needed)
3. Note down your credentials:
   - Client ID
   - Client Secret  
   - Developer ID

### 2. Configuration
1. Copy `ebay-config.json.template` to `ebay-config.json`
2. Fill in your eBay API credentials:
   ```json
   {
       "SANDBOX": {
           "clientId": "YOUR_SANDBOX_CLIENT_ID",
           "clientSecret": "YOUR_SANDBOX_CLIENT_SECRET",
           "devid": "YOUR_DEVELOPER_ID",
           "redirectUri": "http://localhost:8081/api/oauth/callback",
           "baseUrl": "api.sandbox.ebay.com"
       },
       "PRODUCTION": {
           "clientId": "YOUR_PRODUCTION_CLIENT_ID", 
           "clientSecret": "YOUR_PRODUCTION_CLIENT_SECRET",
           "devid": "YOUR_DEVELOPER_ID",
           "redirectUri": "http://localhost:8081/api/oauth/callback",
           "baseUrl": "api.ebay.com"
       }
   }
   ```

### 3. eBay App Configuration
In your eBay Developer Console:
- **Auth accepted URL**: `https://auth.ebay.com/oauth2/ThirdPartyAuthSucessFailure`
- **Auth declined URL**: `https://auth.ebay.com/oauth2/ThirdPartyAuthSucessFailure`

### 4. Dependencies
Install required packages:
```bash
npm install ebay-oauth-nodejs-client express cors node-fetch@2
```

### 5. Running the Integration
1. Start the OAuth callback server:
   ```bash
   node oauth-callback-server.cjs
   ```

2. Start the main application:
   ```bash
   npm run dev
   ```

3. Navigate to: `http://localhost:8080/ebay-analyzer`

## Usage
1. Click "Authorize with eBay"
2. Complete eBay OAuth flow in popup
3. Search for items (e.g., "batman funko pop")
4. View price analysis and market data

## Files Structure
- `src/components/EbayPriceAnalyzer.tsx` - Main React component
- `oauth-callback-server.cjs` - Express server for OAuth handling
- `ebay-config.json` - eBay API credentials (not in repo)
- `ebay-config.json.template` - Template for configuration
- `src/api/ebay.ts` - TypeScript interfaces and API types

## Security Notes
- `ebay-config.json` is in `.gitignore` to protect credentials
- Never commit real API credentials to the repository
- Use environment variables in production 