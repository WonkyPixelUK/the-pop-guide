// scripts/import-funkodb-to-supabase.js
// Usage: node scripts/import-funkodb-to-supabase.js funkodb.json
// Imports all Funko Pop data from funkodb.json into Supabase funko_pops table

const fs = require('fs');
const path = require('path');
const { supabase } = require('../src/integrations/supabase/client.cjs');

async function importFunkoPops(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let imported = 0, errors = 0;
  for (const pop of data) {
    const insert = {
      number: pop.popNumber ? String(pop.popNumber) : null,
      series: pop.series || '',
      name: pop.title || '',
      image_url: pop.image || null,
      description: pop.description || null,
      estimated_value: pop.price ? parseFloat(pop.price.replace(/[^\d.]/g, '')) : null,
      // Add more fields as needed
    };
    const { error } = await supabase.from('funko_pops').upsert(insert, { onConflict: ['number', 'series'] });
    if (error) {
      errors++;
      console.error('Error importing:', insert, error.message);
    } else {
      imported++;
    }
  }
  console.log(`Imported: ${imported}, Errors: ${errors}`);
}

const jsonPath = process.argv[2] || 'funkodb.json';
importFunkoPops(jsonPath); 