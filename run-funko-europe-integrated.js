// 🔥 Funko Europe Scraper - INTEGRATED with PopGuide System
const SUPABASE_URL = 'https://db.popguide.co.uk';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgxODIsImV4cCI6MjA2MzY2NDE4Mn0.YInSl_Ct_ZM_fyZ1j2rgNQFacHDGTjg64vJGTtSb9FI';
const FIRECRAWL_API_KEY = 'fc-39a379de773e4794b1a7068d4490d93a';

async function runFunkoEuropeIntegratedScraper() {
  console.log('🚀 Starting Funko Europe Scraper - INTEGRATED VERSION');
  console.log('💡 Storing directly in PopGuide funko_pops table');
  
  const startTime = new Date();
  const results = {
    totalScraped: 0,
    newProducts: 0,
    updatedProducts: 0,
    newPrices: 0,
    errors: 0,
    products: []
  };

  try {
    // Step 1: Send start notification
    console.log('\n📧 Sending start notification...');
    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        to: 'brains@popguide.co.uk',
        data: {
          fullName: `🚀 FUNKO EUROPE INTEGRATED SCRAPER STARTED - ${startTime.toLocaleString()}`
        }
      })
    });
    console.log('✅ Start notification sent');

    // Step 2: Scrape What's New collection page
    console.log('\n🔍 Scraping What\'s New collection...');
    const collectionUrl = 'https://funkoeurope.com/collections/whats-new';
    
    const collectionResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: collectionUrl,
        formats: ['html'],
        includeTags: ['a', 'img', 'div', 'span'],
        excludeTags: ['script', 'style', 'nav', 'footer'],
        waitFor: 3000,
        timeout: 45000
      })
    });

    if (!collectionResponse.ok) {
      throw new Error(`Collection scrape failed: ${collectionResponse.status} - ${await collectionResponse.text()}`);
    }

    const collectionData = await collectionResponse.json();
    if (!collectionData.success) {
      console.log('❌ Collection scrape response:', JSON.stringify(collectionData, null, 2));
      throw new Error(`Collection scrape failed: ${collectionData.error}`);
    }

    const html = collectionData.data?.html || '';
    console.log(`📄 Scraped ${html.length} characters from collection page`);
    
    // Debug: Check if HTML contains any product links at all
    const hasProducts = html.includes('/products/');
    console.log(`🔍 HTML contains product links: ${hasProducts}`);
    if (hasProducts) {
      const productCount = (html.match(/\/products\//g) || []).length;
      console.log(`📊 Found ${productCount} product link references in HTML`);
    }

    // Step 3: Extract product URLs
    console.log('\n🔗 Extracting product URLs...');
    const productUrls = [];
    
    // Try multiple URL patterns for better coverage
    const urlPatterns = [
      /href="(https:\/\/funkoeurope\.com\/collections\/[^"]*\/products\/[^"]+)"/g,
      /href="(https:\/\/funkoeurope\.com\/products\/[^"]+)"/g,
      /href="(\/collections\/[^"]*\/products\/[^"]+)"/g,
      /href="(\/products\/[^"]+)"/g,
      /"url":"(https:\/\/funkoeurope\.com\/products\/[^"]+)"/g,
      /"url":"(\/products\/[^"]+)"/g
    ];
    
    for (const urlPattern of urlPatterns) {
      const urlMatches = html.matchAll(urlPattern);
      
      for (const match of urlMatches) {
        let fullUrl = match[1];
        
        // Make relative URLs absolute
        if (fullUrl && !fullUrl.startsWith('http')) {
          fullUrl = 'https://funkoeurope.com' + fullUrl;
        }
        
        // Convert collection URLs to clean product URLs
        if (fullUrl && fullUrl.includes('/collections/')) {
          fullUrl = fullUrl.replace(/\/collections\/[^\/]+\/products\//, '/products/');
        }
        
        if (fullUrl && !productUrls.includes(fullUrl) && productUrls.length < 4) {
          productUrls.push(fullUrl);
        }
      }
    }
    
    console.log(`🔗 Found ${productUrls.length} product URLs to scrape`);
    
    // Debug: Show first few URLs if any found
    if (productUrls.length > 0) {
      console.log('📋 First few URLs:');
      productUrls.slice(0, 5).forEach((url, i) => {
        console.log(`   ${i + 1}. ${url}`);
      });
    } else {
      console.log('❌ No product URLs found. Checking HTML for common patterns...');
      const patterns = [
        '/products/',
        'href=',
        'funkoeurope.com'
      ];
      patterns.forEach(pattern => {
        const count = (html.match(new RegExp(pattern, 'g')) || []).length;
        console.log(`   "${pattern}": ${count} matches`);
      });
      
      // Debug: Show sample href attributes containing /products/
      console.log('\n🔍 Sample href attributes with /products/:');
      const sampleMatches = html.match(/href=[^>]*\/products\/[^>]*/g);
      if (sampleMatches) {
        sampleMatches.slice(0, 3).forEach((match, i) => {
          console.log(`   ${i + 1}. ${match}`);
        });
      }
    }

    // Step 4: Scrape each product and integrate with PopGuide
    for (let i = 0; i < productUrls.length; i++) {
      try {
        console.log(`\n📦 Processing product ${i + 1}/${productUrls.length}`);
        
        const productResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: productUrls[i],
            formats: ['html'],
            includeTags: ['img', 'meta', 'title', 'h1', 'div', 'span', 'p'],
            excludeTags: ['script', 'style', 'nav', 'footer'],
            waitFor: 1500,
            timeout: 20000
          })
        });

        if (!productResponse.ok) {
          console.log(`❌ Failed to scrape ${productUrls[i]}`);
          results.errors++;
          continue;
        }

        const productData = await productResponse.json();
        if (!productData.success) {
          console.log(`❌ Product scrape failed: ${productData.error}`);
          results.errors++;
          continue;
        }

        const productHtml = productData.data?.html || '';
        
        // Extract product data for PopGuide integration
        const extractedProduct = extractProductData(productUrls[i], productHtml);
        
        if (!extractedProduct) {
          console.log(`❌ Could not extract product data from ${productUrls[i]}`);
          results.errors++;
          continue;
        }

        console.log(`\n📦 Product Details:`);
        console.log(`   Name: ${extractedProduct.name}`);
        console.log(`   Series: ${extractedProduct.series}`);
        console.log(`   Price: £${extractedProduct.price || 'N/A'}`);
        console.log(`   URL: ${productUrls[i]}`);

        // Step 5: Check if product exists in funko_pops table
        console.log(`🔍 Checking if "${extractedProduct.name}" exists in PopGuide...`);
        
        const existingPopResponse = await fetch(`${SUPABASE_URL}/rest/v1/funko_pops?name=eq.${encodeURIComponent(extractedProduct.name)}&series=eq.${encodeURIComponent(extractedProduct.series)}&select=*`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
          }
        });

        let funkoPopId = null;
        let isNewProduct = false;

        if (existingPopResponse.ok) {
          const existingPops = await existingPopResponse.json();
          
          if (existingPops && existingPops.length > 0) {
            // Product exists - update it
            funkoPopId = existingPops[0].id;
            console.log(`✅ Found existing Pop: ${extractedProduct.name} (ID: ${funkoPopId})`);
            
            // Update the existing product with latest data
            const updateData = {
              image_url: extractedProduct.image_url || existingPops[0].image_url,
              is_exclusive: extractedProduct.is_exclusive,
              exclusive_to: extractedProduct.exclusive_to,
              description: extractedProduct.description || existingPops[0].description,
              data_sources: Array.from(new Set([...(existingPops[0].data_sources || []), 'Funko Europe', 'new-releases'])),
              updated_at: new Date().toISOString()
            };

            // Only include price if it was successfully extracted
            if (extractedProduct.price !== null) {
              updateData.estimated_value = extractedProduct.price;
            }

            const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/funko_pops?id=eq.${funkoPopId}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
              },
              body: JSON.stringify(updateData)
            });

            if (updateResponse.ok) {
              results.updatedProducts++;
              console.log(`✅ Updated existing Pop: ${extractedProduct.name}`);
            } else {
              console.log(`⚠️ Failed to update Pop: ${extractedProduct.name}`);
            }

          } else {
            // Product doesn't exist - create it
            isNewProduct = true;
            console.log(`🆕 Creating new Pop: ${extractedProduct.name}`);
            
            const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/funko_pops`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                name: extractedProduct.name,
                series: extractedProduct.series,
                number: extractedProduct.number,
                ...(extractedProduct.price !== null && { estimated_value: extractedProduct.price }),
                image_url: extractedProduct.image_url,
                is_exclusive: extractedProduct.is_exclusive,
                exclusive_to: extractedProduct.exclusive_to,
                description: extractedProduct.description,
                release_date: extractedProduct.release_date,
                variant: extractedProduct.variant,
                data_sources: ['Funko Europe', 'new-releases'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
            });

            if (createResponse.ok) {
              const newPop = await createResponse.json();
              funkoPopId = newPop[0]?.id;
              results.newProducts++;
              console.log(`✅ Created new Pop: ${extractedProduct.name} (ID: ${funkoPopId})`);
            } else {
              const errorText = await createResponse.text();
              console.log(`❌ Failed to create Pop: ${extractedProduct.name} - ${errorText}`);
              results.errors++;
              continue;
            }
          }
        }

        // Step 6: Add price history entry
        if (funkoPopId && extractedProduct.price !== null && extractedProduct.price > 0) {
          console.log(`💰 Adding price history for £${extractedProduct.price}...`);
          
          const priceHistoryResponse = await fetch(`${SUPABASE_URL}/rest/v1/price_history`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
              funko_pop_id: funkoPopId,
              price: extractedProduct.price,
              source: 'Funko Europe',
              date_scraped: new Date().toISOString(),
              condition: 'New',
              listing_url: productUrls[i]
            })
          });

          if (priceHistoryResponse.ok) {
            results.newPrices++;
            console.log(`✅ Added price history: £${extractedProduct.price}`);
          } else {
            console.log(`⚠️ Failed to add price history`);
          }
        }

        results.products.push({
          name: extractedProduct.name,
          series: extractedProduct.series,
          number: extractedProduct.number,
          price: extractedProduct.price || 'N/A',
          isNew: isNewProduct,
          url: productUrls[i]
        });
        
        results.totalScraped++;
        console.log(`✅ ${extractedProduct.name} - ${extractedProduct.series} - £${extractedProduct.price || 'N/A'}`);

        // Rate limiting between products
        if (i < productUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ Error processing product ${i + 1}:`, error.message);
        results.errors++;
      }
    }

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    // Step 7: Send completion notification with integrated results
    console.log('\n📧 Sending completion notification...');
    const successSummary = results.products.slice(0, 5).map(p => 
      `• ${p.name} (${p.series}${p.number ? ` #${p.number}` : ''}) - £${p.price} ${p.isNew ? '[NEW]' : '[UPDATED]'}`
    ).join('\n');

    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        to: 'brains@popguide.co.uk',
        data: {
          fullName: `✅ FUNKO EUROPE INTEGRATED SCRAPER COMPLETED!

📊 POPGUIDE INTEGRATION RESULTS:
• Total Products Processed: ${results.totalScraped}
• New Pops Added: ${results.newProducts} 
• Existing Pops Updated: ${results.updatedProducts}
• Price History Entries: ${results.newPrices}
• Errors: ${results.errors}
• Duration: ${duration}s

🎯 INTEGRATED PRODUCTS:
${successSummary}

💡 Products are now available in your main PopGuide system!
Users can add them to collections, wishlists, and track prices.

Time: ${endTime.toLocaleString()}
Status: SUCCESS ✅`
        }
      })
    });

    console.log('✅ Completion notification sent');

    console.log('\n🎉 FUNKO EUROPE INTEGRATED SCRAPER COMPLETED!');
    console.log('📊 PopGuide Integration Results:');
    console.log(`   • Total Processed: ${results.totalScraped}`);
    console.log(`   • New Pops Added: ${results.newProducts}`);
    console.log(`   • Existing Updated: ${results.updatedProducts}`);
    console.log(`   • Price Entries: ${results.newPrices}`);
    console.log(`   • Errors: ${results.errors}`);
    console.log(`   • Duration: ${duration}s`);
    console.log(`   • Success Rate: ${Math.round((results.totalScraped / (results.totalScraped + results.errors)) * 100)}%`);
    
    console.log('\n🎯 Integrated Products:');
    results.products.slice(0, 5).forEach(p => {
      console.log(`   • ${p.name} - ${p.series} - £${p.price} ${p.isNew ? '[NEW]' : '[UPDATED]'}`);
    });

    console.log('\n💡 All products are now in your main PopGuide system!');

  } catch (error) {
    console.error('\n❌ INTEGRATED SCRAPER FAILED:', error.message);
    
    // Send error notification
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'welcome',
          to: 'brains@popguide.co.uk',
          data: {
            fullName: `❌ FUNKO EUROPE INTEGRATED SCRAPER FAILED!

Error: ${error.message}
Time: ${new Date().toLocaleString()}
Status: FAILED ❌`
          }
        })
      });
      console.log('📧 Error notification sent');
    } catch (emailError) {
      console.log('⚠️ Could not send error notification');
    }
    
    process.exit(1);
  }
}

// Extract product data from HTML and format for PopGuide funko_pops table
function extractProductData(url, html) {
  try {
    // Extract name from URL and clean it up
    const urlParts = url.split('/').pop()?.replace(/-/g, ' ');
    let name = urlParts ? urlParts.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : 'Unknown Product';

    // Try to extract better name from HTML title
    const titlePatterns = [
      /<title[^>]*>([^<]+)/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /"name":\s*"([^"]+)"/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].length > name.length) {
        name = match[1]
          .replace(/ - Funko Europe$/, '')
          .replace(/\s+/g, ' ')
          .trim();
        break;
      }
    }

    // Determine series based on content analysis
    let series = 'Funko Pop!'; // Default series
    let number = null;
    let variant = null;
    
    // Look for item number/Pop number
    const itemPatterns = [
      /Item Number:\s*(\d+)/i,
      /"sku":\s*"(\d+)"/,
      /(\d{5})/g  // 5-digit product codes
    ];
    
    for (const pattern of itemPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].length >= 4) {
        number = match[1];
        break;
      }
    }

    // Determine series from product type
    if (html.includes('POP! &TEE') || html.includes('POP! & TEE')) {
      series = 'Pop! & Tee';
    } else if (html.includes('BITTY POP!')) {
      series = 'Bitty Pop!';
    } else if (html.includes('VINYL SODA')) {
      series = 'Vinyl Soda';
    } else if (html.includes('MYSTERY MINI')) {
      series = 'Mystery Minis';
    } else {
      // Try to extract series from license/brand
      const licensePatterns = [
        /(MARVEL|DC|DISNEY|STAR WARS|POKEMON|HARRY POTTER)/i
      ];
      
      for (const pattern of licensePatterns) {
        const match = html.match(pattern);
        if (match) {
          series = `${match[1]} Pop!`;
          break;
        }
      }
    }

    // Extract price
    let price = null;  // Changed from 0 to null to prevent defaulting
    const pricePatterns = [
      /"price":\s*(\d+(?:\.\d{2})?)/i,
      /"price_range":\s*"£(\d+(?:\.\d{2})?)"/i,
      /"price":\s*"£(\d+(?:\.\d{2})?)"/i,
      /£(\d+(?:\.\d{2})?)/i,
      /"price":\s*"(\d+(?:\.\d{2})?)"/i,
      /"price":\s*"(\d+\.\d{2})"/i,
      /"price":\s*(\d+\.\d{2})/i,
      /"price":\s*"(\d+)"/i,
      /"price":\s*(\d+)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const extractedPrice = parseFloat(match[1]);
        // Validate price is reasonable (between £5 and £100)
        if (extractedPrice >= 5 && extractedPrice <= 100) {
          price = extractedPrice;
          console.log(`💰 Found price £${price} using pattern: ${pattern}`);
          break;
        } else {
          console.log(`⚠️ Found invalid price £${extractedPrice} - outside reasonable range`);
        }
      }
    }
    
    if (price === null) {
      console.log('⚠️ No valid price found. Checking HTML for price-related content:');
      const priceRelatedContent = html.match(/price[^>]*>([^<]+)/gi) || [];
      console.log('Price-related content found:', priceRelatedContent.slice(0, 3));
    }

    // IMPROVED IMAGE EXTRACTION - Multiple patterns for better coverage
    let image_url = null;
    const imagePatterns = [
      // Shopify CDN images (high quality)
      /https:\/\/cdn\.shopify\.com\/s\/files\/[^"'>\s]+\.(?:jpg|jpeg|png|webp)[^"'>\s]*/gi,
      // Funko Europe CDN images
      /https:\/\/funkoeurope\.com\/cdn\/shop\/[^"'>\s]+\.(?:jpg|jpeg|png|webp)[^"'>\s]*/gi,
      // JSON product images
      /"image":\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
      /"featured_image":\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
      // Meta property images
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/gi,
      // General img src patterns
      /src="(https?:\/\/[^"]*\/products\/[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
      // Relative URLs that we'll make absolute
      /src="(\/\/[^"]*\/products\/[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi
    ];
    
    const allImages = [];
    
    // Find all potential images
    for (const pattern of imagePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        let imgUrl = match[1] || match[0]; // Some patterns capture group, others don't
        
        if (imgUrl) {
          // Make relative URLs absolute
          if (imgUrl.startsWith('//')) {
            imgUrl = 'https:' + imgUrl;
          } else if (!imgUrl.startsWith('http')) {
            imgUrl = 'https://funkoeurope.com' + imgUrl;
          }
          
          // Filter out tiny images and placeholder images
          if (!imgUrl.includes('190x') && 
              !imgUrl.includes('100x') && 
              !imgUrl.includes('placeholder') &&
              !imgUrl.includes('no-image') &&
              !imgUrl.includes('GiftBox_Quarter')) {
            allImages.push(imgUrl);
          }
        }
      }
    }
    
    // Remove duplicates and pick the best image
    const uniqueImages = [...new Set(allImages)];
    
    if (uniqueImages.length > 0) {
      // Prefer larger images and CDN images
      const sortedImages = uniqueImages.sort((a, b) => {
        // Prefer images with dimensions indicating larger size
        const aDimensions = a.match(/(\d+)x(\d+)/);
        const bDimensions = b.match(/(\d+)x(\d+)/);
        const aSize = aDimensions ? parseInt(aDimensions[1]) + parseInt(aDimensions[2]) : 800;
        const bSize = bDimensions ? parseInt(bDimensions[1]) + parseInt(bDimensions[2]) : 800;
        
        // Prefer Shopify CDN over other sources
        const aIsShopify = a.includes('cdn.shopify.com') ? 1000 : 0;
        const bIsShopify = b.includes('cdn.shopify.com') ? 1000 : 0;
        
        return (bSize + bIsShopify) - (aSize + aIsShopify);
      });
      
      image_url = sortedImages[0];
      
      // Log successful image extraction for debugging
      console.log(`🖼️ Found image: ${image_url.substring(0, 80)}...`);
    } else {
      console.log(`❌ No suitable image found for ${name}`);
    }

    // Determine exclusivity
    const is_exclusive = html.includes('EXCLUSIVE') || html.includes('Exclusive');
    const exclusive_to = is_exclusive ? 'Funko Europe' : null;

    // Check for variants
    if (html.includes('METALLIC') || html.includes('Metallic')) {
      variant = 'Metallic';
    } else if (html.includes('GLOW') || html.includes('Glow')) {
      variant = 'Glow in the Dark';
    } else if (html.includes('FLOCKED') || html.includes('Flocked')) {
      variant = 'Flocked';
    }

    return {
      name: name,
      series: series,
      number: number,
      price: price,
      image_url: image_url,
      is_exclusive: is_exclusive,
      exclusive_to: exclusive_to,
      variant: variant,
      description: null,
      release_date: new Date().toISOString().split('T')[0] // Today's date
    };

  } catch (error) {
    console.error('Error extracting product data:', error);
    return null;
  }
}

console.log('🔥 FUNKO EUROPE INTEGRATED SCRAPER');
console.log('💡 Stores directly in PopGuide funko_pops table');
console.log('📈 Includes price history tracking');
console.log('🚀 Full PopGuide system integration!\n');

runFunkoEuropeIntegratedScraper(); 