import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Funko Used Stickers (all from Fandom page, some without images)
const funkoStickers = [
  { title: 'Flocked', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Flocked.webp', years: '2011 - Present' },
  { title: 'Glow in The Dark', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Glow_In_The_Dark.webp', years: '2011 - Present' },
  { title: 'Diamond Collection', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Diamond_Collection.webp', years: '2011 - Present' },
  { title: 'Scented', img: '', years: '2011 - Present' },
  { title: 'Glitter', img: '', years: '2011 - Present' },
  { title: 'Glow In The Dark & Flocked', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Glowflocked.webp', years: '2011 - Present' },
  { title: 'Specialty Series', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Funko_Specialty_Series.webp', years: '2011 - Present' },
  { title: 'Special Edition (2011-2022)', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Specialeditionsticker21.webp', years: '2011 - 2022' },
  { title: 'Special Edition (2022-Present)', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Specialeditionstickernew.webp', years: '2022 - Present' },
  { title: 'Exclusive (International)', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Exclusivesticker.webp', years: '2016 - Present' },
  { title: 'Chase', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Chase.webp', years: '2011 - Present' },
  { title: 'Glow Chase', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Glow_In_The_Dark_Chase.webp', years: '2011 - Present' },
  { title: 'Flocked Chase', img: '', years: '2011 - Present' },
  { title: 'Black & White Chase', img: '', years: '2011 - Present' },
  { title: 'Funko Shop Exclusive', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Funko_Shop_Exclusive.webp', years: '2011 - Present' },
  { title: 'Funko Shop Exclusive (Holiday)', img: '', years: '' },
  { title: 'Funko HQ Exclusive', img: '', years: '' },
  { title: 'Funko Hollywood Exclusive', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Funko_Hollywood_Exclusive.webp', years: '' },
];

// Retailer Exclusive Stickers (all from Fandom page, some without images)
const retailerStickers = [
  { title: 'Target', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Only_at_Target.webp' },
  { title: 'Walmart', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Only_at_Walmart.webp' },
  { title: 'GameStop', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/GameStop_Exclusive.webp' },
  { title: 'Hot Topic', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Htex.webp' },
  { title: 'Hot Topic Pre-Release', img: '', years: '' },
  { title: 'Hot Topic Glows In The Dark', img: '', years: '' },
  { title: 'Hot Topic Class 1B', img: '', years: '' },
  { title: 'Best Buy', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Only_%40_Best_Buy.webp' },
  { title: 'Blockbuster', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Blockbuster_Exclusive_Sticker.webp' },
  { title: 'Box Lunch', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Box_Lunch_Exclusive.webp' },
  { title: 'Box Lunch Special Edition', img: '', years: '' },
  { title: 'Amazon', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Amazon_Exclusive.webp' },
  { title: 'Toys "R" Us', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Toys_%22R%22_Us_Exclusive.webp' },
  { title: 'Barnes & Noble', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Barnes_%26_Noble_Exclusive.webp' },
  { title: 'Macy\'s', img: '', years: '' },
  { title: 'F.Y.E', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/F.Y.E._Exclusive.webp' },
  { title: 'Entertainment Earth', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Entertainment_Earth_Exclusive.webp' },
  { title: 'AAA Anime', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/AAA_Anime_Exclusive.webp' },
  { title: 'Toy Tokyo', img: '', years: '' },
  { title: 'Gemini Collectibles', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Gemini_Collectibles_Exclusive.webp' },
  { title: 'Zavvi', img: '', years: '' },
  { title: 'HobbyStock', img: '', years: '' },
  { title: 'Underground Toys', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/Underground_Toys_Exclusive.webp' },
  { title: 'Galactic Toys', img: '', years: '' },
  { title: 'Pop In A Box', img: '', years: '' },
  { title: 'BAIT', img: '', years: '' },
  { title: 'BAIT Pre-Release', img: '', years: '' },
  { title: 'GTS Distribution', img: 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Funko-stickers/GTS_Exclusive.webp' },
  { title: 'Box Warehouse', img: '', years: '' },
  { title: 'Alliance Entertainment', img: '', years: '' },
  { title: 'Toy Sapiens', img: '', years: '' },
];

// US Convention Stickers (add all years and types as listed)
const usConventionStickers = [
  { title: 'SDCC 2016', img: '', years: '2016' },
  { title: 'SDCC 2017', img: '', years: '2017' },
  { title: 'SDCC 2018', img: 'https://static.wikia.nocookie.net/funko/images/2/2d/SDCC2022Sticker.webp/revision/latest?cb=20230807153008', years: '2018' },
  { title: 'SDCC 2019', img: '', years: '2019' },
  { title: 'SDCC 2020', img: '', years: '2020' },
  { title: 'SDCC 2021', img: '', years: '2021' },
  { title: 'SDCC 2022', img: 'https://static.wikia.nocookie.net/funko/images/2/2d/SDCC2022Sticker.webp/revision/latest?cb=20230807153008', years: '2022' },
  { title: 'SDCC 2023', img: 'https://static.wikia.nocookie.net/funko/images/0/09/SDCC2023Sticker.webp/revision/latest?cb=20230807152944', years: '2023' },
  { title: 'NYCC 2015', img: '', years: '2015' },
  { title: 'NYCC 2016', img: '', years: '2016' },
  { title: 'NYCC 2017', img: '', years: '2017' },
  { title: 'NYCC 2018', img: '', years: '2018' },
  { title: 'NYCC 2019', img: 'https://static.wikia.nocookie.net/funko/images/4/43/New%5FYork%5FComic-Con%5F2019.png/revision/latest?cb=20240519220156', years: '2019' },
  { title: 'NYCC 2020', img: '', years: '2020' },
  { title: 'NYCC 2021', img: '', years: '2021' },
  { title: 'NYCC 2022', img: 'https://static.wikia.nocookie.net/funko/images/e/ea/NYCC2022Sticker.webp/revision/latest?cb=20230807153025', years: '2022' },
  { title: 'NYCC 2023', img: '', years: '2023' },
  { title: 'ECCC 2016', img: '', years: '2016' },
  { title: 'ECCC 2017', img: '', years: '2017' },
  { title: 'ECCC 2018', img: '', years: '2018' },
  { title: 'ECCC 2019', img: '', years: '2019' },
  { title: 'ECCC 2020', img: '', years: '2020' },
  { title: 'ECCC 2021', img: '', years: '2021' },
  { title: 'ECCC 2022', img: '', years: '2022' },
  { title: 'ECCC 2023', img: '', years: '2023' },
  { title: 'WonderCon 2016', img: '', years: '2016' },
  { title: 'WonderCon 2017', img: '', years: '2017' },
  { title: 'WonderCon 2018', img: '', years: '2018' },
  { title: 'WonderCon 2019', img: '', years: '2019' },
  { title: 'WonderCon 2020', img: '', years: '2020' },
  { title: 'WonderCon 2021', img: '', years: '2021' },
  { title: 'WonderCon 2022', img: '', years: '2022' },
  { title: 'WonderCon 2023', img: '', years: '2023' },
  { title: 'E3 2018', img: 'https://static.wikia.nocookie.net/funko/images/d/d4/E3%5F2018%5FSticker.png/revision/latest?cb=20240516181330', years: '2018' },
];

// International Convention Stickers
const intlConventionStickers = [
  { title: 'Japan Expo 2018', img: 'https://static.wikia.nocookie.net/funko/images/3/38/Japanexposticker.png/revision/latest?cb=20230728015314', years: '2018', location: 'Paris, France' },
  { title: 'Japan Expo 2019', img: 'https://static.wikia.nocookie.net/funko/images/a/a8/Japanexpo2019.png/revision/latest?cb=20230728023755', years: '2019', location: 'Paris, France' },
  { title: 'MCM London Comic Con 2018', img: 'https://static.wikia.nocookie.net/funko/images/0/0a/Mcmcomiccon2018sticker.png/revision/latest?cb=20230728020615', years: '2018', location: 'London, England' },
  { title: 'MCM London Comic Con 2019', img: '', years: '2019', location: 'London, England' },
  { title: 'Comic Con Africa 2019', img: 'https://static.wikia.nocookie.net/funko/images/0/09/Comicconafrica.png/revision/latest?cb=20230728044040', years: '2019', location: 'Africa' },
];

// Shared Convention Stickers (none with images on Fandom page)
const sharedConventionStickers = [
  { title: 'Shared Convention', img: '', years: '' },
];

const StickerGuide = () => (
  <>
    <SEO title="Funko Pop Sticker Guide | PopGuide" description="A visual guide to Funko Pop stickers and exclusives." />
    <Navigation />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <div className="flex-1 container mx-auto py-16 px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-6">Funko Pop Sticker Guide</h1>
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Funko Used Stickers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {funkoStickers.map(sticker => (
            <Card key={sticker.title} className="bg-gray-800/70 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base mb-2">{sticker.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {sticker.img ? (
                  <img src={sticker.img} alt={sticker.title} className="w-16 h-16 object-contain mb-2" />
                ) : (
                  <div className="w-16 h-16 mb-2 bg-gray-700 rounded flex items-center justify-center text-gray-500">No Image</div>
                )}
                <div className="text-gray-300 text-xs text-center">{sticker.years}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Retailer Exclusive Stickers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {retailerStickers.map(sticker => (
            <Card key={sticker.title} className="bg-gray-800/70 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base mb-2">{sticker.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {sticker.img ? (
                  <img src={sticker.img} alt={sticker.title} className="w-16 h-16 object-contain mb-2" />
                ) : (
                  <div className="w-16 h-16 mb-2 bg-gray-700 rounded flex items-center justify-center text-gray-500">No Image</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-orange-400 mb-4">US Convention Stickers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {usConventionStickers.map(sticker => (
            <Card key={sticker.title} className="bg-gray-800/70 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base mb-2">{sticker.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {sticker.img ? (
                  <img src={sticker.img} alt={sticker.title} className="w-16 h-16 object-contain mb-2" />
                ) : (
                  <div className="w-16 h-16 mb-2 bg-gray-700 rounded flex items-center justify-center text-gray-500">No Image</div>
                )}
                <div className="text-gray-300 text-xs text-center">{sticker.years}{sticker.location ? ` • ${sticker.location}` : ''}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-orange-400 mb-4">International Convention Stickers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {intlConventionStickers.map(sticker => (
            <Card key={sticker.title} className="bg-gray-800/70 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base mb-2">{sticker.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {sticker.img ? (
                  <img src={sticker.img} alt={sticker.title} className="w-16 h-16 object-contain mb-2" />
                ) : (
                  <div className="w-16 h-16 mb-2 bg-gray-700 rounded flex items-center justify-center text-gray-500">No Image</div>
                )}
                <div className="text-gray-300 text-xs text-center">{sticker.years}{sticker.location ? ` • ${sticker.location}` : ''}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Shared Convention Stickers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {sharedConventionStickers.map(sticker => (
            <Card key={sticker.title} className="bg-gray-800/70 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base mb-2">{sticker.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {sticker.img ? (
                  <img src={sticker.img} alt={sticker.title} className="w-16 h-16 object-contain mb-2" />
                ) : (
                  <div className="w-16 h-16 mb-2 bg-gray-700 rounded flex items-center justify-center text-gray-500">No Image</div>
                )}
                <div className="text-gray-300 text-xs text-center">{sticker.years}{sticker.location ? ` • ${sticker.location}` : ''}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  </>
);

export default StickerGuide; 