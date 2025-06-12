import 'dotenv/config';
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Config
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const FIRECRAWL_API_KEY = 'fc-39a379de773e4794b1a7068d4490d93a';

// S3 Config
const S3_ENDPOINT = 'https://pafgjwmgueerxdxtneyg.supabase.co/storage/v1/s3';
const S3_ACCESS_KEY = '27c420f3874ea278b8c14d86224bfcce';
const S3_SECRET_KEY = '0b9bc6237c2124d2285924e4e60e26eae00d4ad4ed1b54c88bf9c2210767997b';
const S3_BUCKET = 'funko-images';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY
  },
  forcePathStyle: true
});

async function scrapeProductData(productUrl: string) {
  // Use Firecrawl API to get rendered content
  const response = await axios.post('https://api.firecrawl.dev/v1/scrape', {
    url: productUrl
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
    }
  });

  if (!response.data.success || !response.data.data.markdown) {
    throw new Error('Failed to fetch product data from Firecrawl');
  }

  const markdown = response.data.data.markdown;
  const lines = markdown.split('\n');

  // --- Refined field extraction for all filter fields ---
  // 1. Name (full product name)
  const nameLine = lines.find(line => /^# \d+ /.test(line));
  const name = nameLine ? nameLine.replace(/^# /, '').trim() : lines[0].trim();

  // 2. Number (from start of name)
  const numberMatch = name.match(/^(\d+)/);
  const number = numberMatch ? numberMatch[1] : '';

  // 3. Series (first parentheses after number)
  const seriesMatch = name.match(/\d+ ([^(]+) \(([^)]+)\)/);
  const series = seriesMatch ? seriesMatch[2] : '';

  // 4. Description (from price development section)
  const descriptionMatch = markdown.match(/## What is the Price Development for.*?\n\n([\s\S]*?)(?=\n\n|## )/);
  const description = descriptionMatch ? descriptionMatch[1].replace(/\n/g, ' ').trim() : '';

  // 5. Estimated Value (USD or GBP)
  const priceMatch = markdown.match(/USD(\d+\.?\d*)/);
  const estimatedValue = priceMatch ? parseFloat(priceMatch[1]) : null;

  // 6. Categories (labels only, no URLs, support multiple)
  const categoriesMatch = markdown.match(/## Categories\n\n([\s\S]*?)(?=\n\n|## )/);
  const categories = categoriesMatch ?
    categoriesMatch[1].split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('- '))
      .map(line => {
        // Extract label from markdown link: - [Label](url)
        const labelMatch = line.match(/- \[(.*?)\]/);
        return labelMatch ? labelMatch[1] : line.replace('- ', '');
      }) : [];

  // 7. Fandom (first category containing 'Character')
  const fandom = categories.find(cat => cat.toLowerCase().includes('character')) || '';

  // 8. Genre (all categories not containing 'character')
  const genres = categories.filter(cat => !cat.toLowerCase().includes('character'));
  const genre = genres.length === 1 ? genres[0] : genres.join(', '); // comma-separated if multiple

  // 9. Category (first category)
  const category = categories[0] || '';

  // 10. Release Year (from name, e.g. (Fall Convention 2017))
  const yearMatch = name.match(/(19|20)\d{2}/);
  const releaseYear = yearMatch ? yearMatch[0] : '';
  // Use release_date as YYYY-01-01 if only year is available
  const release_date = releaseYear ? `${releaseYear}-01-01` : null;

  // 11. Image (main product image)
  const imageMatch = markdown.match(/!\[Collectible image of.*?\]\((.*?)\)/);
  const imageUrl = imageMatch ? imageMatch[1] : null;

  // 12. Vaulted, Chase, Exclusive (from name)
  const isVaulted = /vaulted/i.test(name);
  const isChase = /chase/i.test(name);
  const isExclusive = /exclusive/i.test(name);
  const exclusiveToMatch = name.match(/Exclusive\s*to\s*([^)]+)/i);
  const exclusiveTo = isExclusive && exclusiveToMatch ? exclusiveToMatch[1].trim() : '';

  // 13. Edition (from name, if present)
  const editionMatch = name.match(/\(([^)]+)\)/);
  const edition = editionMatch ? editionMatch[1] : '';

  // 14. Status (default to 'In Stock')
  const status = 'In Stock';

  // Debug log all fields
  console.log({
    name, number, series, description, estimatedValue, genres, genre, category, fandom, edition, status, release_date, isExclusive, exclusiveTo, isVaulted, isChase, imageUrl
  });

  const safeSeries = series || 'Standard';

  return {
    name,
    number,
    series: safeSeries,
    variant: edition, // Use edition as variant if no better info
    description,
    release_date,
    is_exclusive: isExclusive,
    exclusive_to: exclusiveTo,
    is_vaulted: isVaulted,
    is_chase: isChase,
    estimated_value: estimatedValue,
    fandom,
    genre,
    edition,
    category,
    status,
    image_url: imageUrl
  };
}

async function uploadImage(imageUrl: string, productName: string) {
  try {
    // Validate image URL
    if (!imageUrl.startsWith('http')) {
      console.error('Invalid image URL:', imageUrl);
      return null;
    }

    console.log('Downloading image from:', imageUrl);
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    
    const fileName = `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
    console.log('Uploading image to S3 as:', fileName);
    
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType: 'image/jpeg'
    });

    await s3Client.send(command);
    
    // Construct the public URL using the correct format
    const publicUrl = `${S3_ENDPOINT}/public/${S3_BUCKET}/${fileName}`;
    console.log('Image uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

async function main() {
  try {
    const productUrl = process.argv[2];
    if (!productUrl) {
      throw new Error('Please provide a product URL');
    }

    const productData = await scrapeProductData(productUrl);
    
    // Upload image if available
    let imageUrl = null;
    if (productData.image_url) {
      imageUrl = await uploadImage(productData.image_url, productData.name);
    }

    // Check if product exists by name AND number (case-sensitive)
    const { data: existingProduct } = await supabase
      .from('funko_pops')
      .select('id')
      .eq('name', productData.name)
      .eq('number', productData.number)
      .single();

    if (existingProduct) {
      // Update existing product
      const { error } = await supabase
        .from('funko_pops')
        .update({
          ...productData,
          image_url: imageUrl
        })
        .eq('id', existingProduct.id);

      if (error) throw error;
      console.log('Product updated successfully');
    } else {
      // Insert new product
      const { error } = await supabase
        .from('funko_pops')
        .insert([{
          ...productData,
          image_url: imageUrl
        }]);

      if (error) throw error;
      console.log('Product inserted successfully');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 