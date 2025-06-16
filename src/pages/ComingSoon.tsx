import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Heart, ExternalLink, Star, Calendar, Package, Tag, Filter, Plus, Upload, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const releaseCategories = [
  { id: 'all', title: 'All Products', icon: '⭐' },
  { id: 'pop', title: 'Pop! Figures', icon: '🎯' },
  { id: 'bitty', title: 'Bitty Pop!', icon: '🏠' },
  { id: 'jumbo', title: 'Jumbo Pops', icon: '📏' },
  { id: 'plush', title: 'Plushies', icon: '🧸' },
  { id: 'exclusive', title: 'Exclusives', icon: '⭐' },
  { id: 'calendar', title: 'Calendars', icon: '📅' },
  { id: 'keychain', title: 'Keychains', icon: '🗝️' },
];

// Filters matching the main database page EXACTLY
const STATIC_FILTERS = {
  status: ['All', 'Coming Soon', 'New Releases', 'Funko Exclusive', 'Pre-Order', 'In Stock', 'Sold Out'],
  category: [
    'Pop!', 'Bitty Pop!', 'Mini Figures', 'Vinyl Soda', 'Loungefly', 'REWIND', 'Pop! Pins', 'Toys and Plushies', 'Clothing', 'Funko Gear', 'Funko Games'
  ],
  fandom: [
    '8-Bit', 'Ad Icons', 'Air Force', 'Albums', 'Animation', 'Aquasox', 'Army', 'Around the World', 'Artists', 'Art Covers', 'Art Series', 'Asia', 'Bape', 'Basketball', 'Board Games', 'Books', 'Boxing', 'Broadway', 'Build a Bear', 'Candy', 'Christmas', 'Classics', 'College', 'Comedians', 'Comic Covers', 'Comics', 'Conan', 'Custom', 'Deluxe', 'Deluxe Moments', 'Die-Cast', 'Digital', 'Disney', 'Directors', 'Drag Queens', 'Fantastic Beasts', 'Fashion', 'Foodies', 'Football', 'Freddy Funko', 'Fantastik Plastik', 'Lance', 'Game of Thrones', 'Games', 'Game Covers', 'Golf', 'GPK', 'Halo', 'Harry Potter', 'Heroes', 'Hockey', 'Holidays', 'House of the Dragons', 'Icons', 'League of Legends', 'Magic: The Gathering', 'Marines', 'Marvel', 'Magazine Covers', 'Minis', 'MLB', 'Moments', 'Monsters', 'Movie Posters', 'Movies', 'Muppets', 'Myths', 'My Little Pony', 'NASCAR', 'Navy', 'NBA Mascots', 'NFL', 'Pets', 'Pusheen', 'Racing', 'Retro Toys', 'Rides', 'Rocks', 'Royals', 'Sanrio', 'Sci-Fi', 'Sesame Street', 'SNL', 'South Park', 'Special Edition', 'Sports', 'Sports Legends', 'Stan Lee', 'Star Wars', 'Television', 'Tennis', 'The Vote', 'Town', 'Town Christmas', 'Trading Cards', 'Trains', 'Trolls', 'UFC', 'Uglydoll', 'Valiant', 'Vans', 'VHS Covers', 'Wreck-It Ralph', 'Wrestling', 'WWE', 'WWE Covers', 'Zodiac'
  ],
  genre: [
    'Animation', 'Anime & Manga', '80s Flashback', 'Movies & TV', 'Horror', 'Music', 'Sports', 'Video Games', 'Retro Toys', 'Ad Icons'
  ],
  edition: [
    'New Releases', 'Exclusives', 'Convention Style', 'Character Cosplay', 'Rainbow Brights', 'Retro Rewind', 'Theme Park Favourites', 'Disney Princesses', 'All The Sparkles', 'Back in Stock', 'BLACK LIGHT', 'BRONZE', 'BTS X MINIONS', 'CHASE', 'CONVENTION', 'DIAMON COLLECTION', 'DIAMOND COLLECTION', 'EASTER', 'FACET COLLECTION', 'FLOCKED', 'GLITTER', 'GLOW IN THE DARK', 'HOLIDAY', 'HYPERSPACE HEROES', 'LIGHTS AND SOUND', 'MEME', 'METALLIC', 'PEARLESCENT', 'PRIDE', 'RETRO COMIC', 'RETRO SERIES', 'SCOOPS AHOY', 'SOFT COLOUR', "VALENTINE'S"
  ],
  character: ['Hermione Granger', 'Spider-Man', 'Chica', 'Stitch', 'Batman', 'Iron Man', 'Pikachu', 'Deadpool', 'Naruto', 'Goku', 'Mandalorian', 'Eleven', 'Groot', 'Venom'],
  series: ['Five Nights at Freddy\'s', 'Harry Potter', 'Marvel Comics', 'Lilo & Stitch', 'Stranger Things', 'IT', 'Terrifier', 'Baldur\'s Gate', 'Pokémon', 'Sonic the Hedgehog', 'Spider-Man'],
  vaulted: ['All', 'Vaulted', 'Available']
};

// Real Funko Europe Coming Soon products based on the website data
const upcomingReleases = [
  {
    id: 1,
    name: 'CUPCAKE - FNAF: MOVIE',
    series: 'Five Nights at Freddy\'s',
    price: '£30',
    type: 'PLUSH',
    category: 'plush',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Adorable Cupcake plush from the FNAF Movie',
    releaseDate: '2024-12-01'
  },
  {
    id: 2,
    name: 'HERMIONE GRANGER - HARRY POTTER AND THE',
    series: 'Harry Potter',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Hermione Granger from Harry Potter series',
    releaseDate: '2024-11-28'
  },
  {
    id: 3,
    name: 'SPIDER-MAN WITH SANDWICH - MARVEL COMICS',
    series: 'Marvel Comics',
    price: '£16',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    exclusive: true,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Exclusive Spider-Man with Sandwich Pop!',
    releaseDate: '2024-12-05'
  },
  {
    id: 4,
    name: 'CHICA WITH CUPCAKE - FIVE NIGHTS AT FRED',
    series: 'Five Nights at Freddy\'s',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Chica with Cupcake from FNAF',
    releaseDate: '2024-11-30'
  },
  {
    id: 5,
    name: 'BITTY POP! BITTY BOX LILO\'S HOME - LILO',
    series: 'Lilo & Stitch',
    price: '£18',
    type: 'BITTY POP!',
    category: 'bitty',
    image: 'https://images.unsplash.com/photo-1606937036041-d3c4b0e9a53b?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Bitty Pop! Bitty Box featuring Lilo\'s Home',
    releaseDate: '2024-12-10'
  },
  {
    id: 6,
    name: 'BITTY POP! BITTY BOX HOGWARTS CASTLE - H',
    series: 'Harry Potter',
    price: '£18',
    type: 'BITTY POP!',
    category: 'bitty',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Bitty Pop! Bitty Box featuring Hogwarts Castle',
    releaseDate: '2024-12-15'
  },
  {
    id: 7,
    name: 'BITTY POP! BITTY BOX BYERS HOUSE - STRAN',
    series: 'Stranger Things',
    price: '£18',
    type: 'BITTY POP!',
    category: 'bitty',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Bitty Pop! Bitty Box featuring Byers House from Stranger Things',
    releaseDate: '2024-12-08'
  },
  {
    id: 8,
    name: 'BITTY POP! BITTY BOX PENNYWISE\'S LAIR',
    series: 'IT',
    price: '£18',
    type: 'BITTY POP!',
    category: 'bitty',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Bitty Pop! Bitty Box featuring Pennywise\'s Lair',
    releaseDate: '2024-12-12'
  },
  {
    id: 9,
    name: 'ART THE CLOWN WITH NEWSPAPER - TERRIFIER',
    series: 'Terrifier',
    price: '£16',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: true,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Exclusive Art the Clown with Newspaper from Terrifier',
    releaseDate: '2024-11-25'
  },
  {
    id: 10,
    name: 'KARLACH WITH CLIVE - BALDUR\'S GATE',
    series: 'Baldur\'s Gate',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Karlach with Clive from Baldur\'s Gate',
    releaseDate: '2024-12-20'
  },
  {
    id: 11,
    name: 'EEVEE - POKÉMON',
    series: 'Pokémon',
    price: '£33',
    type: 'POP! JUMBO',
    category: 'jumbo',
    image: 'https://images.unsplash.com/photo-1606937036041-d3c4b0e9a53b?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Jumbo sized Eevee from Pokémon',
    releaseDate: '2025-01-15'
  },
  {
    id: 12,
    name: 'SONIC WITH RING - SONIC THE HEDGEHOG',
    series: 'Sonic the Hedgehog',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Sonic with Ring from Sonic the Hedgehog',
    releaseDate: '2024-12-25'
  },
  {
    id: 13,
    name: 'DOC OCK - SPIDER-MAN: NO WAY HOME',
    series: 'Spider-Man: No Way Home',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Doc Ock from Spider-Man: No Way Home',
    releaseDate: '2025-01-10'
  },
  {
    id: 14,
    name: 'FIVE NIGHTS AT FREDDY\'S ADVENT CALENDAR',
    series: 'Five Nights at Freddy\'s',
    price: '£55',
    type: 'FUNKO CALENDAR',
    category: 'calendar',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Five Nights at Freddy\'s Advent Calendar',
    releaseDate: '2024-11-20'
  },
  {
    id: 15,
    name: 'MUNCHLAX - POKÉMON',
    series: 'Pokémon',
    price: '£33',
    type: 'POP! JUMBO',
    category: 'jumbo',
    image: 'https://images.unsplash.com/photo-1606937036041-d3c4b0e9a53b?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Jumbo sized Munchlax from Pokémon',
    releaseDate: '2025-01-20'
  },
  {
    id: 16,
    name: 'ITACHI UCHIHA - NARUTO SHIPPUDEN',
    series: 'Naruto Shippuden',
    price: '£5',
    type: 'POP! KEYCHAIN',
    category: 'keychain',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Itachi Uchiha Keychain from Naruto Shippuden',
    releaseDate: '2024-12-03'
  },
  {
    id: 17,
    name: 'EKKO - ARCANE: LEAGUE OF LEGENDS',
    series: 'Arcane: League of Legends',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Ekko from Arcane: League of Legends',
    releaseDate: '2025-02-01'
  },
  {
    id: 18,
    name: 'LITTLE PALE GIRL (GLOW IN THE DARK) - TE',
    series: 'The Ring',
    price: '£16',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: true,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Exclusive Little Pale Girl Glow in the Dark Pop!',
    releaseDate: '2024-12-31'
  },
  {
    id: 19,
    name: 'RORONOA ZORO VS KING - ONE PIECE',
    series: 'One Piece',
    price: '£33',
    type: 'POP! MOMENT',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: true,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Exclusive Roronoa Zoro vs King Pop! Moment from One Piece',
    releaseDate: '2025-01-05'
  },
  {
    id: 20,
    name: 'GOKU WITH NYOIBO - DRAGON BALL',
    series: 'Dragon Ball',
    price: '£13',
    type: 'POP!',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Goku with Nyoibo from Dragon Ball',
    releaseDate: '2025-02-15'
  },
  {
    id: 21,
    name: 'VERMAX - HOUSE OF THE DRAGON POP! SUPER',
    series: 'House of the Dragon',
    price: '£18',
    type: 'POP! SUPER',
    category: 'pop',
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
    exclusive: false,
    notifyUrl: 'https://funkoeurope.com/collections/coming-soon',
    description: 'Vermax Pop! Super from House of the Dragon',
    releaseDate: '2025-02-28'
  }
];

const releaseCalendar = [
  { month: 'November 2024', count: 23, highlights: ['Marvel Wave 3', 'Star Wars Mandalorian', 'Disney Villains'] },
  { month: 'December 2024', count: 31, highlights: ['Deadpool Movie Set', 'Holiday Exclusives', 'Anime Wave 2'] },
  { month: 'January 2025', count: 18, highlights: ['Gaming Collection', 'Winter Con Exclusives', 'Retro Wave'] },
  { month: 'February 2025', count: 25, highlights: ['Valentine Specials', 'Marvel Phase 5', 'Cartoon Classics'] }
];

const conventionSchedule = [
  { 
    event: 'London Comic Con Winter', 
    date: '2024-11-30', 
    exclusives: ['Exclusive Doctor Who', 'UK Sherlock Holmes', 'Wallace & Gromit'],
    status: 'Confirmed'
  },
  { 
    event: 'NYCC 2025', 
    date: '2025-10-09', 
    exclusives: ['Marvel Previews', 'DC Universe', 'Anime Specials'],
    status: 'Planned'
  },
  { 
    event: 'SDCC 2025', 
    date: '2025-07-24', 
    exclusives: ['Movie Tie-ins', 'TV Show Exclusives', 'Artist Series'],
    status: 'Planned'
  }
];

export default function ComingSoon() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or calendar
  const [notifiedItems, setNotifiedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addReleaseOpen, setAddReleaseOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [], fandom: [], genre: [], edition: [], status: [], character: [], series: [], vaulted: 'All', year: ''
  });

  // New release form state
  const [newRelease, setNewRelease] = useState({
    name: '',
    series: '',
    price: '',
    type: 'POP!',
    category: 'Pop!',
    fandom: '',
    genre: '',
    edition: '',
    character: '',
    description: '',
    releaseDate: '',
    exclusive: false,
    image: null as File | null,
    imagePreview: ''
  });

  const [duplicateCheck, setDuplicateCheck] = useState<{
    found: boolean;
    existingPop?: any;
    showConfirmation: boolean;
  }>({ found: false, showConfirmation: false });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Generate years from upcomingReleases data
  const years = Array.from(new Set(
    upcomingReleases
      .map(release => release.releaseDate ? new Date(release.releaseDate).getFullYear() : null)
      .filter(Boolean)
  )).sort((a, b) => b - a);

  const FILTERS = {
    ...STATIC_FILTERS,
    character: Array.from(new Set(upcomingReleases.map(release => release.name.split(' - ')[0]).filter(Boolean))).sort(),
    series: Array.from(new Set(upcomingReleases.map(release => release.series).filter(Boolean))).sort(),
  };

  const filteredReleases = upcomingReleases.filter(release => {
    // Search functionality
    const matchesSearch = !searchTerm || 
      release.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Legacy category filter (keeping for backward compatibility)
    const legacyFilter = selectedCategory === 'all' || release.category === selectedCategory;
    
    // New dropdown filters
    const matchesCategory = !filters.category.length || filters.category.some(cat => {
      if (cat === 'Pop!') return release.type === 'POP!';
      if (cat === 'Bitty Pop!') return release.type === 'BITTY POP!';
      return release.type.toLowerCase().includes(cat.toLowerCase());
    });
    
    const matchesFandom = !filters.fandom.length || filters.fandom.includes(release.series);
    
    const matchesStatus = !filters.status.length || filters.status.some(status => {
      switch (status) {
        case 'Coming Soon': return true; // All items on this page are coming soon
        case 'Funko Exclusive': return release.exclusive;
        case 'Pre-Order': return new Date(release.releaseDate) > new Date();
        default: return false;
      }
    });
    
    return matchesSearch && legacyFilter && matchesCategory && matchesFandom && matchesStatus;
  });

  const handleNotifyMe = (itemId: number) => {
    setNotifiedItems(prev => [...prev, itemId]);
    // In a real app, this would make an API call to set up notifications
  };

  const handleVisitSource = () => {
    window.open('https://funkoeurope.com/collections/coming-soon', '_blank');
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewRelease(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setNewRelease(prev => ({ ...prev, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Check for duplicates
  const checkForDuplicates = async (name: string, series: string) => {
    try {
      const { data: existingPops, error } = await supabase
        .from('funko_pops')
        .select('*')
        .ilike('name', `%${name}%`)
        .ilike('series', `%${series}%`)
        .limit(5);

      if (error) throw error;

      if (existingPops && existingPops.length > 0) {
        setDuplicateCheck({
          found: true,
          existingPop: existingPops[0],
          showConfirmation: true
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmitRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicates first (unless user has confirmed)
    if (!duplicateCheck.showConfirmation) {
      const isDuplicate = await checkForDuplicates(newRelease.name, newRelease.series);
      if (isDuplicate) {
        return; // Stop here and show confirmation dialog
      }
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "❌ Authentication Required",
          description: "You must be logged in to add releases.",
          variant: "destructive",
          duration: 5000
        });
        return;
      }

      let imageUrl = null;

      // Upload image to Supabase storage if provided
      if (newRelease.image) {
        const fileExt = newRelease.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('funko-images')
          .upload(fileName, newRelease.image);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get public URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from('funko-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      // Add to main funko_pops database with "Coming Soon" status
      const { data: newPop, error: popError } = await supabase
        .from('funko_pops')
        .insert({
          name: newRelease.name,
          series: newRelease.series,
          price: newRelease.price,
          type: newRelease.type,
          category: newRelease.category,
          fandom: newRelease.fandom,
          genre: newRelease.genre,
          edition: newRelease.edition,
          character: newRelease.character,
          description: newRelease.description,
          release_date: newRelease.releaseDate,
          status: 'Coming Soon', // Key status label
          is_exclusive: newRelease.exclusive,
          image_url: imageUrl,
          notify_url: 'https://funkoeurope.com/collections/coming-soon',
          created_by: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (popError) {
        throw new Error(`Failed to add to main database: ${popError.message}`);
      }

      // Also add to coming_soon_releases table
      const { error: comingSoonError } = await supabase
        .from('coming_soon_releases')
        .insert({
          name: newRelease.name,
          series: newRelease.series,
          price: newRelease.price,
          type: newRelease.type,
          category: newRelease.category,
          description: newRelease.description,
          release_date: newRelease.releaseDate,
          is_exclusive: newRelease.exclusive,
          image_url: imageUrl,
          notify_url: 'https://funkoeurope.com/collections/coming-soon',
          created_by: user.id
        });

      if (comingSoonError) {
        console.warn('Failed to add to coming soon table:', comingSoonError);
        // Don't throw here as main database addition succeeded
      }

      toast({
        title: "✅ Release Added Successfully!",
        description: `${newRelease.name} has been added to the main Funko database with "Coming Soon" status.`,
        duration: 5000
      });

      // Reset form and close modal
      setNewRelease({
        name: '',
        series: '',
        price: '',
        type: 'POP!',
        category: 'Pop!',
        fandom: '',
        genre: '',
        edition: '',
        character: '',
        description: '',
        releaseDate: '',
        exclusive: false,
        image: null,
        imagePreview: ''
      });
      setDuplicateCheck({ found: false, showConfirmation: false });
      setAddReleaseOpen(false);
    } catch (error) {
      toast({
        title: "❌ Failed to Add Release",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle duplicate confirmation
  const handleDuplicateConfirmation = (proceed: boolean) => {
    if (proceed) {
      setDuplicateCheck(prev => ({ ...prev, showConfirmation: false }));
      // Trigger form submission
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    } else {
      setDuplicateCheck({ found: false, showConfirmation: false });
    }
  };

  // Group releases by month for calendar view
  const groupReleasesByMonth = () => {
    const grouped = {};
    filteredReleases.forEach(release => {
      const date = new Date(release.releaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(release);
    });
    return grouped;
  };

  const renderCalendarView = () => {
    const groupedReleases = groupReleasesByMonth();
    const months = Object.keys(groupedReleases).sort();

    return (
      <div className="space-y-8">
        {months.map(monthKey => {
          const releases = groupedReleases[monthKey];
          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          });

          return (
            <Card key={monthKey} className="bg-gray-800/70 border border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-orange-400" />
                  {monthName}
                  <Badge className="bg-orange-500 text-white">{releases.length} releases</Badge>
                </h3>
                
                <div className="space-y-4">
                  {releases.map(release => (
                    <div key={release.id} className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 flex gap-4">
                      <img 
                        src={release.image} 
                        alt={release.name} 
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-white">{release.name}</h4>
                            <p className="text-orange-400 text-sm">{release.series}</p>
                            <p className="text-gray-400 text-sm">{release.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-orange-400 font-bold">{release.price}</div>
                            <div className="text-gray-400 text-sm">{new Date(release.releaseDate).toLocaleDateString()}</div>
                            {release.exclusive && (
                              <Badge className="bg-purple-500 text-white text-xs mt-1">Exclusive</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <Navigation />
      
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-6 px-4 py-2 rounded-lg bg-gray-900/80 border-l-4 border-orange-500 shadow-md" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-orange-400 font-semibold transition-colors">Home</Link>
          <span className="mx-1 text-orange-400">/</span>
          <Link to="/database" className="text-orange-400 font-bold tracking-wide uppercase hover:underline">Database</Link>
          <span className="mx-1 text-orange-400">/</span>
          <span className="text-orange-400 font-bold tracking-wide uppercase">Coming Soon</span>
        </nav>
        {/* Title & Description */}
        <div className="mb-6 text-left">
          <h1 className="text-4xl font-bold mb-2">Coming Soon</h1>
          <p className="text-lg text-gray-200 max-w-2xl mb-2">See which Funko Pops are about to launch. Be the first to know about upcoming releases and pre-orders.</p>
        </div>
      </div>

      <div className="container mx-auto flex flex-col md:flex-row gap-8 pb-12 px-4 flex-1">
        {/* Filter Sidebar */}
        <aside className="bg-gray-900 border border-gray-700 rounded-lg p-6 sticky top-24 max-h-[80vh] overflow-y-auto min-w-[220px] w-64 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Filters</h2>
          </div>
          <div className="mb-4 text-center">
            <a href="/sticker-guide" className="text-orange-400 underline text-sm">Need help understanding stickers?</a>
          </div>
          
          {Object.entries(FILTERS).map(([key, options]) => (
            key !== 'vaulted' ? (
              <div key={key} className="mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-white border-gray-600 hover:bg-gray-700 hover:text-orange-500">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      <Filter className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto">
                    <div className="p-2">
                      <Input
                        placeholder={`Search ${key}...`}
                        className="mb-2"
                        onChange={e => setFilters(f => ({ ...f, [`${key}Search`]: e.target.value }))}
                        value={filters[`${key}Search`] || ''}
                      />
                    </div>
                    {options.filter(opt => !filters[`${key}Search`] || opt.toLowerCase().includes(filters[`${key}Search`].toLowerCase())).map(opt => (
                      <div key={opt} className="flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors hover:text-[#e46c1b] hover:bg-gray-800" onClick={() => {
                        setFilters(f => {
                          const arr = (Array.isArray(f[key]) ? f[key] : []).includes(opt) ? f[key].filter(x => x !== opt) : [...f[key], opt];
                          return { ...f, [key]: arr };
                        });
                      }}>
                        <input type="checkbox" checked={(Array.isArray(filters[key]) ? filters[key] : []).includes(opt)} readOnly className="mr-2 accent-[#232837] border-[#232837]" style={{ borderColor: '#232837' }} />
                        <span className="font-medium text-sm flex-1 truncate">{opt}</span>
                        <span className="text-gray-400 font-bold text-sm ml-2">
                          ({upcomingReleases.filter(release => {
                            if (key === 'status') {
                              switch (opt) {
                                case 'All': return true;
                                case 'Coming Soon': return true;
                                case 'Funko Exclusive': return release.exclusive;
                                case 'Pre-Order': return new Date(release.releaseDate) > new Date();
                                default: return false;
                              }
                            }
                            if (key === 'category') {
                              if (opt === 'Pop!') return release.type === 'POP!';
                              if (opt === 'Bitty Pop!') return release.type === 'BITTY POP!';
                              return release.type.toLowerCase().includes(opt.toLowerCase());
                            }
                            if (key === 'fandom') return release.series === opt;
                            if (key === 'series') return release.series === opt;
                            if (key === 'character') return release.name.includes(opt);
                            return false;
                          }).length})
                        </span>
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null
          ))}
          
          {/* Vaulted filter */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 font-semibold mb-2 uppercase">Vaulted</div>
            <div className="flex gap-2">
              {FILTERS.vaulted.map(opt => (
                <Button
                  key={opt}
                  size="sm"
                  variant={filters.vaulted === opt ? 'default' : 'outline'}
                  className={filters.vaulted === opt ? 'bg-orange-500 text-white' : ''}
                  onClick={() => setFilters(f => ({ ...f, vaulted: opt }))}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Release year filter */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 font-semibold mb-2 uppercase">Release Year</div>
            <select
              className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 w-full"
              value={filters.year}
              onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
            >
              <option value="">All</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Source Attribution */}
          <Card className="bg-blue-900/20 border border-blue-500/30 rounded-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Data Source: Funko Europe</h3>
                    <p className="text-blue-300 text-sm">Real-time data from Funko Europe's official coming soon collection</p>
                  </div>
                </div>
                <Button
                  onClick={handleVisitSource}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Source
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Release Calendar Overview */}
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h2 className="text-xl font-bold text-white">📅 Release Calendar</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {releaseCalendar.map((month, idx) => (
                  <div key={idx} className="bg-gray-900/80 border border-gray-600 rounded-lg p-4">
                    <div className="font-bold text-white text-lg mb-2">{month.month}</div>
                    <div className="text-orange-400 font-semibold mb-2">{month.count} releases</div>
                    <div className="text-gray-300 text-sm">
                      {month.highlights.map((highlight, i) => (
                        <div key={i} className="mb-1">• {highlight}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded transition ${
                  viewMode === 'grid' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </button>
              <button
                className={`px-4 py-2 rounded transition ${
                  viewMode === 'calendar' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setViewMode('calendar')}
              >
                Calendar View
              </button>
            </div>
            
            {/* Add Release Button */}
            <Dialog open={addReleaseOpen} onOpenChange={setAddReleaseOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Release
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">Add New Release</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmitRelease} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Pop Name *</Label>
                      <Input
                        id="name"
                        required
                        value={newRelease.name}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="e.g. SPIDER-MAN - MARVEL COMICS"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="series" className="text-white">Series *</Label>
                      <select
                        id="series"
                        required
                        value={newRelease.series}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, series: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                      >
                        <option value="">Select Series</option>
                        {STATIC_FILTERS.series.map(series => (
                          <option key={series} value={series}>{series}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="price" className="text-white">Price *</Label>
                      <Input
                        id="price"
                        required
                        value={newRelease.price}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, price: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="e.g. £13"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type" className="text-white">Type *</Label>
                      <select
                        id="type"
                        required
                        value={newRelease.type}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                      >
                        <option value="POP!">Pop!</option>
                        <option value="BITTY POP!">Bitty Pop!</option>
                        <option value="POP! JUMBO">Pop! Jumbo</option>
                        <option value="PLUSH">Plush</option>
                        <option value="FUNKO CALENDAR">Calendar</option>
                        <option value="POP! KEYCHAIN">Keychain</option>
                        <option value="POP! MOMENT">Pop! Moment</option>
                        <option value="POP! SUPER">Pop! Super</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-white">Category *</Label>
                      <select
                        id="category"
                        required
                        value={newRelease.category}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                      >
                        {STATIC_FILTERS.category.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="fandom" className="text-white">Fandom</Label>
                      <select
                        id="fandom"
                        value={newRelease.fandom}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, fandom: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                      >
                        <option value="">Select Fandom</option>
                        {STATIC_FILTERS.fandom.map(fandom => (
                          <option key={fandom} value={fandom}>{fandom}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="genre" className="text-white">Genre</Label>
                      <select
                        id="genre"
                        value={newRelease.genre}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, genre: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                      >
                        <option value="">Select Genre</option>
                        {STATIC_FILTERS.genre.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="edition" className="text-white">Edition</Label>
                      <select
                        id="edition"
                        value={newRelease.edition}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, edition: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                      >
                        <option value="">Select Edition</option>
                        {STATIC_FILTERS.edition.map(edition => (
                          <option key={edition} value={edition}>{edition}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="character" className="text-white">Character</Label>
                      <Input
                        id="character"
                        value={newRelease.character}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, character: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="e.g. Spider-Man"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="releaseDate" className="text-white">Release Date *</Label>
                      <Input
                        id="releaseDate"
                        type="date"
                        required
                        value={newRelease.releaseDate}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, releaseDate: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="exclusive"
                        checked={newRelease.exclusive}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, exclusive: e.target.checked }))}
                        className="rounded border-gray-700"
                      />
                      <Label htmlFor="exclusive" className="text-white">Exclusive Release</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={newRelease.description}
                      onChange={(e) => setNewRelease(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Describe the Funko Pop..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image" className="text-white">Image Upload</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-orange-400 transition-colors"
                      >
                        {newRelease.imagePreview ? (
                          <img
                            src={newRelease.imagePreview}
                            alt="Preview"
                            className="h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400">Click to upload image</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddReleaseOpen(false)}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Release'}
                    </Button>
                  </div>
                </form>

                {/* Duplicate Confirmation Dialog */}
                {duplicateCheck.showConfirmation && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md mx-4">
                      <h3 className="text-lg font-bold text-white mb-4">⚠️ Potential Duplicate Detected</h3>
                      <p className="text-gray-300 mb-4">
                        A similar Funko Pop was found in the database:
                      </p>
                      {duplicateCheck.existingPop && (
                        <div className="bg-gray-800 border border-gray-600 rounded p-3 mb-4">
                          <div className="text-white font-semibold">{duplicateCheck.existingPop.name}</div>
                          <div className="text-orange-400 text-sm">{duplicateCheck.existingPop.series}</div>
                          <div className="text-gray-400 text-sm">Status: {duplicateCheck.existingPop.status || 'Unknown'}</div>
                        </div>
                      )}
                      <p className="text-gray-300 mb-6">
                        Do you want to proceed with adding this release anyway?
                      </p>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleDuplicateConfirmation(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleDuplicateConfirmation(true)}
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                        >
                          Add Anyway
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter */}
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-bold text-white">Filter by Category</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {releaseCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      ${selectedCategory === category.id 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                      }
                    `}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="text-gray-400 text-sm mb-6">
            {filteredReleases.length} upcoming releases
          </div>

          {/* Conditional View Rendering */}
          {viewMode === 'calendar' ? renderCalendarView() : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredReleases.map(release => (
                <Card key={release.id} className="bg-gray-800/70 border border-gray-700 rounded-lg overflow-hidden group hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                  <div className="relative">
                    {release.exclusive && (
                      <div className="absolute top-3 left-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                        ✨ Exclusive
                      </div>
                    )}
                    {notifiedItems.includes(release.id) && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                        Notified
                      </div>
                    )}
                    <img 
                      src={release.image} 
                      alt={release.name} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="text-xs text-orange-400 font-semibold mb-2">{release.series}</div>
                    <h3 className="font-bold text-white text-lg mb-2">{release.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{release.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Release Date:</span>
                        <span className="text-white font-semibold">{new Date(release.releaseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-orange-400 font-bold text-lg">{release.price}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {notifiedItems.includes(release.id) ? (
                        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition-colors">
                          <Bell className="w-4 h-4 mr-1" />
                          Notified
                        </button>
                      ) : (
                        <button
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded transition-colors"
                          onClick={() => handleNotifyMe(release.id)}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          Notify Me
                        </button>
                      )}
                      <button 
                        className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded transition-colors"
                        onClick={() => window.open(`/where-to-buy/${release.id}`, '_self')}
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded transition-colors">
                        🔔
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Convention Schedule */}
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg mb-8">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24">
                  <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Convention Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {conventionSchedule.map((con, idx) => (
                  <div key={idx} className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-white text-lg">{con.event}</div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        con.status === 'Confirmed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                      }`}>
                        {con.status}
                      </span>
                    </div>
                    <div className="text-orange-400 font-semibold mb-3">{new Date(con.date).toLocaleDateString()}</div>
                    <div className="text-gray-400 text-sm">
                      <div className="font-semibold mb-1">Expected Exclusives:</div>
                      {con.exclusives.map((exclusive, i) => (
                        <div key={i} className="mb-1">• {exclusive}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Signup */}
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Never Miss a Release!</h3>
              <p className="text-gray-400 mb-6">Get notified about pre-orders, release dates, and exclusive drops</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded transition-colors">
                  🔔 Enable Release Alerts
                </button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded transition-colors">
                  📧 Email Notifications
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded transition-colors">
                  📱 Push Notifications
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
} 