// insert_demo_funko_pops.js
// Usage:
//   SUPABASE_URL=https://pafgjwmgueerxdyxlny.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
//   node insert_demo_funko_pops.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function insertDemoPops() {
  const demoPops = [
    {
      name: 'Batman',
      series: 'DC Super Heroes',
      number: '01',
      image_url: 'https://images.popguide.co.uk/batman.png',
      estimated_value: 25,
      category: 'Heroes',
      fandom: 'DC',
      genre: 'Comics',
      is_vaulted: false,
      is_exclusive: false,
      created_at: new Date().toISOString(),
    },
    {
      name: 'Darth Vader',
      series: 'Star Wars',
      number: '02',
      image_url: 'https://images.popguide.co.uk/vader.png',
      estimated_value: 40,
      category: 'Villains',
      fandom: 'Star Wars',
      genre: 'Movies & TV',
      is_vaulted: false,
      is_exclusive: true,
      created_at: new Date().toISOString(),
    },
    {
      name: 'Goku',
      series: 'Dragon Ball Z',
      number: '03',
      image_url: 'https://images.popguide.co.uk/goku.png',
      estimated_value: 30,
      category: 'Anime',
      fandom: 'Dragon Ball',
      genre: 'Anime & Manga',
      is_vaulted: false,
      is_exclusive: false,
      created_at: new Date().toISOString(),
    },
  ];

  const { data, error } = await supabase.from('funko_pops').insert(demoPops);
  if (error) {
    console.error('Error inserting demo pops:', error);
  } else {
    console.log('Inserted demo pops:', data);
  }
}

insertDemoPops(); 