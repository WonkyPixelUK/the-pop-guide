// scripts/scrape-incendar-funkodb.js
// Usage: node scripts/scrape-incendar-funkodb.js > funkodb.json
// Scrapes all Funko Pop data from Incendar FunkoDB, including pop number, series, title, image, description, and price.

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://incendar.com/funkodb.php';

async function getSeriesList() {
  const { data } = await axios.get(BASE_URL);
  const $ = cheerio.load(data);
  const series = [];
  $('select[name="series"] option').each((i, el) => {
    const val = $(el).attr('value');
    if (val && val !== '') series.push(val);
  });
  return series;
}

async function getAmazonDetails(amazonUrl) {
  if (!amazonUrl) return { image: null, price: null, description: null };
  try {
    const { data } = await axios.get(amazonUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    // Try to get image
    const image = $("#imgTagWrapperId img").attr('src') || $("#landingImage").attr('src') || null;
    // Try to get price
    const price = $("#priceblock_ourprice").text().trim() || $("#priceblock_dealprice").text().trim() || null;
    // Try to get description
    const description = $('#productDescription').text().trim() || null;
    return { image, price, description };
  } catch (e) {
    return { image: null, price: null, description: null };
  }
}

async function scrapeSeries(series) {
  const url = `${BASE_URL}?series=${encodeURIComponent(series)}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const pops = [];
  $('table tr').each(async (i, el) => {
    const tds = $(el).find('td');
    if (tds.length) {
      // Try to parse pop number, title, etc. from the text
      const titleRaw = $(tds[0]).text().trim();
      const link = $(tds[0]).find('a').attr('href') || null;
      let popNumber = null;
      let title = titleRaw;
      const match = titleRaw.match(/^(\d+)\s+(.*)$/);
      if (match) {
        popNumber = match[1];
        title = match[2];
      }
      // Get Amazon details if link exists
      let image = null, price = null, description = null;
      if (link && link.includes('amazon.com')) {
        const details = await getAmazonDetails(link);
        image = details.image;
        price = details.price;
        description = details.description;
      }
      pops.push({
        popNumber,
        series,
        title,
        link,
        image,
        description,
        price
      });
    }
  });
  // Wait for all async Amazon fetches to finish
  return Promise.all(pops);
}

(async () => {
  const allSeries = await getSeriesList();
  let allPops = [];
  for (const series of allSeries) {
    const pops = await scrapeSeries(series);
    allPops = allPops.concat(pops);
    console.error(`Scraped series: ${series} (${pops.length} items)`);
  }
  fs.writeFileSync('funkodb.json', JSON.stringify(allPops, null, 2));
  console.log(JSON.stringify(allPops, null, 2));
})(); 