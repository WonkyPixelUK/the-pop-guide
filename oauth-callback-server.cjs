const express = require('express');
const cors = require('cors');
const EbayAuthToken = require('ebay-oauth-nodejs-client');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize eBay OAuth client
const ebayAuthToken = new EbayAuthToken({
  filePath: 'ebay-config.json'
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'eBay OAuth Callback Server',
    endpoints: {
      health: '/api/health',
      callback: 'POST /api/oauth/callback'
    }
  });
});

// Handle OAuth callback
app.post('/api/oauth/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Authorization code is required' 
      });
    }

    console.log('Received authorization code:', code);

    // Exchange authorization code for access token
    const tokenResponse = await ebayAuthToken.exchangeCodeForAccessToken('PRODUCTION', code);
    
    console.log('Token response:', tokenResponse);

    if (tokenResponse && tokenResponse.access_token) {
      res.json({
        success: true,
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        expires_in: tokenResponse.expires_in,
        refresh_token: tokenResponse.refresh_token
      });
    } else {
      throw new Error('Failed to get access token from eBay');
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to exchange code for token'
    });
  }
});

// Handle eBay OAuth errors/callback via GET (eBay sometimes uses GET)
app.get('/api/oauth/callback', (req, res) => {
  console.log('GET callback received with query params:', req.query);
  
  const { code, error, error_description } = req.query;
  
  if (error) {
    console.error('eBay OAuth error:', { error, error_description });
    res.status(400).json({
      success: false,
      error: error,
      error_description: error_description
    });
    return;
  }
  
  if (code) {
    // For GET callback, we'll redirect to the frontend with the code
    res.redirect(`http://localhost:8080/price-analyzer?code=${code}`);
  } else {
    res.status(400).json({
      success: false,
      error: 'No authorization code received'
    });
  }
});

// Get token after user authorization (simplified approach)
app.post('/api/get-token', async (req, res) => {
  try {
    console.log('Getting application token after user authorization...');

    // After user authorizes, we can get an application token for Browse API
    const tokenResponse = await ebayAuthToken.getApplicationToken('PRODUCTION');
    
    console.log('Token response:', tokenResponse);

    let accessToken;
    if (typeof tokenResponse === 'string') {
      accessToken = tokenResponse;
    } else if (tokenResponse && tokenResponse.access_token) {
      accessToken = tokenResponse.access_token;
    } else {
      throw new Error('Failed to get access token');
    }

    res.json({
      success: true,
      access_token: accessToken,
      message: 'Application token retrieved successfully'
    });
  } catch (error) {
    console.error('Token retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get token'
    });
  }
});

// Search eBay listings endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, token } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }

    console.log('Searching eBay for:', query);

    // Use the token provided or get a fresh application token
    let accessToken = token;
    
         if (!accessToken) {
       console.log('No token provided, getting fresh application token...');
       const tokenResponse = await ebayAuthToken.getApplicationToken('PRODUCTION');
      
      if (typeof tokenResponse === 'string') {
        accessToken = tokenResponse;
      } else if (tokenResponse && tokenResponse.access_token) {
        accessToken = tokenResponse.access_token;
      } else {
        throw new Error('Failed to get access token');
      }
    }

    // Search eBay API
    const searchParams = new URLSearchParams({
      q: query,
      limit: '50',
      sort: 'bestMatch'
    });

    const fetch = require('node-fetch');
    const searchResponse = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB'
      }
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('eBay API Error:', errorData);
      throw new Error(`eBay API Error: ${errorData.errors?.[0]?.message || 'Unknown error'}`);
    }

    const data = await searchResponse.json();
    console.log(`Found ${data.itemSummaries?.length || 0} items`);

    res.json({
      success: true,
      items: data.itemSummaries || [],
      total: data.total || 0
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Search failed'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'OAuth callback server is running' });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`OAuth callback server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Root endpoint: http://localhost:${PORT}/`);
}); 