import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useRef, useState } from 'react';

const sections = [
  { id: 'signature-auth', title: 'How to Get a Funko Signature Authenticated' },
  { id: 'spot-fake', title: 'How to Spot a Fake' },
  { id: 'common-fakes', title: 'List of the Most Common Fakes' },
  { id: 'trusted-retailers', title: 'Trusted Retailers List' },
  { id: 'buyer-safety', title: 'Buyer Safety Tips' },
  { id: 'reporting-fakes', title: 'Reporting Fakes' },
  { id: 'faq', title: 'FAQ' },
  { id: 'resources', title: 'Useful Resources' },
  { id: 'case-studies', title: 'Real-World Case Studies' },
  { id: 'interactive-tools', title: 'Interactive Tools' },
  { id: 'alerts', title: 'Live Price/Authenticity Alerts' },
  { id: 'community-input', title: 'Community Input' },
  { id: 'marketplace-watch', title: 'Marketplace Watch' },
  { id: 'legal-advice', title: 'Legal/Returns Advice' },
  { id: 'glossary', title: 'Glossary' },
];

function FakeCheckerChecklist() {
  const steps = [
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.7-8-13A8 8 0 1112 21z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ),
      label: 'Check seller location (avoid China, deep discounts, stock photos)',
      details: 'If the seller is shipping from China, or the listing uses stock photos and offers deep discounts, it is almost certainly a fake. Authentic sellers usually have UK/EU/US addresses, real photos, and normal pricing. Avoid sellers with large quantities of rare items.'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: 'Verify product number on box and feet',
      details: 'Genuine Pops have a product number stamped on the bottom of the box and on the figure\'s feet or head. Fakes often have missing, printed, or incorrect numbers. Compare with official images or ask for close-up photos.'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ),
      label: 'Inspect box artwork (borders, logos, fonts)',
      details: 'Check for wide or uneven borders, missing logos, or incorrect fonts. Fakes often have blurry printing, off-centre text, or missing details. Compare with official Funko images or trusted sources.'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      label: 'Check paint quality and figure details',
      details: 'Fakes often have poor paint jobs, missing details, or incorrect colouring. Look for rough edges, wrong colours, or unfinished paint. Compare with authentic figures or collector photos.'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/></svg>
      ),
      label: 'Check stickers and logos',
      details: 'Missing, incorrect, or low-quality stickers are a red flag. Official Funko stickers have crisp printing and correct placement. Fakes may have wider borders, wrong colours, or missing text.'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 20l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      label: 'Check seller reputation and use PayPal Goods & Services',
      details: 'Avoid sellers with limited or negative feedback, or recently created accounts. Always use PayPal Goods & Services for protection. If in doubt, ask for references or check collector groups.'
    },
  ];
  const [checked, setChecked] = useState(Array(steps.length).fill(false));
  const [expanded, setExpanded] = useState(Array(steps.length).fill(false));

  const toggleStep = idx => {
    setChecked(arr => arr.map((v, i) => (i === idx ? !v : v)));
  };
  const toggleExpand = idx => {
    setExpanded(arr => arr.map((v, i) => (i === idx ? !v : v)));
  };

  const checkedCount = checked.filter(Boolean).length;
  const probability = Math.round((checkedCount / steps.length) * 100);
  let probabilityLabel = 'High Risk of Fake';
  if (probability >= 83) probabilityLabel = 'Very Likely Authentic';
  else if (probability >= 67) probabilityLabel = 'Likely Authentic';
  else if (probability >= 50) probabilityLabel = 'Uncertain';
  else if (probability >= 34) probabilityLabel = 'Likely Fake';

  return (
    <div className="space-y-3">
      {steps.map((step, idx) => (
        <div key={idx} className={`w-full bg-gray-900/80 border border-gray-700 rounded-lg px-4 py-3 transition shadow group ${checked[idx] ? 'ring-2 ring-orange-400' : ''}`}> 
          <button
            type="button"
            className="flex items-center gap-4 w-full text-left focus:outline-none"
            onClick={() => toggleStep(idx)}
          >
            <span className="flex-shrink-0">{step.icon}</span>
            <span className={`flex-1 text-base text-white transition-colors ${checked[idx] ? 'text-orange-400' : ''}`}>{step.label}</span>
            <span className="ml-2">
              {checked[idx] ? (
                <svg className="w-6 h-6 text-green-400 animate-ping-once" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <span className="inline-block w-5 h-5 border-2 border-gray-600 rounded-full" />
              )}
            </span>
          </button>
          <button
            type="button"
            className="text-xs text-orange-400 mt-2 ml-2 underline focus:outline-none"
            onClick={() => toggleExpand(idx)}
            aria-expanded={expanded[idx]}
          >
            {expanded[idx] ? 'Hide details' : 'Show details'}
          </button>
          {expanded[idx] && (
            <div className="mt-2 text-sm text-gray-300 bg-gray-800/80 border border-gray-700 rounded p-3 animate-fade-in-up">{step.details}</div>
          )}
        </div>
      ))}
      {/* Probability Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-300">Probability this Pop is authentic:</span>
          <span className={`text-base font-semibold ${probability >= 67 ? 'text-green-400' : probability >= 34 ? 'text-yellow-400' : 'text-red-400'}`}>{probabilityLabel} ({probability}%)</span>
        </div>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-300 ${probability >= 67 ? 'bg-green-500' : probability >= 34 ? 'bg-yellow-400' : 'bg-red-500'}`}
            style={{ width: `${probability}%` }}
          />
        </div>
      </div>
      <style>{`@keyframes ping-once{0%{transform:scale(1);}50%{transform:scale(1.3);}100%{transform:scale(1);}}.animate-ping-once{animation:ping-once 0.4s linear;}@keyframes fade-in-up{0%{opacity:0;transform:translateY(12px);}100%{opacity:1;transform:translateY(0);}}.animate-fade-in-up{animation:fade-in-up 0.4s cubic-bezier(.39,.575,.565,1) both;}`}</style>
    </div>
  );
}

export default function ShoppersAdvice() {
  const sectionRefs = useRef({});
  const swauScrollRef = useRef(null);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollSwauRight = () => {
    if (swauScrollRef.current) {
      swauScrollRef.current.scrollBy({ left: 440, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
      <Navigation />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Shoppers Advice</h1>
        {/* Sticky Table of Contents - styled like Members filter */}
        <div className="sticky top-0 z-10 mb-8">
          <div className="bg-gray-800/70 border border-gray-700 rounded-lg px-2 py-3 flex flex-wrap gap-2 justify-center overflow-x-auto">
            {sections.map(sec => (
              <button
                key={sec.id}
                className="px-4 py-2 rounded font-semibold text-white bg-gray-900/70 hover:bg-orange-500 hover:text-white focus:bg-orange-600 focus:text-white transition border border-transparent focus:outline-none"
                onClick={() => scrollToSection(sec.id)}
                style={{ minWidth: 180 }}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <section id="signature-auth" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">How to Get a Funko Signature Authenticated</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              {/* SWAU Logo and Blurb */}
              <div className="flex flex-col items-center mb-6">
                <img src="https://swau.com/cdn/shop/files/SWAU_1_Grey_x70.png?v=1613772455" alt="SWAU Logo" style={{ filter: 'brightness(0) invert(1)', width: 120, height: 'auto' }} className="mb-2" />
                <div className="text-white text-center text-base font-semibold mb-2">PopGuide highly recommends SWAU for Funko signature authentication. Trusted by collectors worldwide.</div>
              </div>
              {/* Animated Step-by-Step Process */}
              <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                {[
                  {
                    icon: (
                      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.93V17a1 1 0 11-2 0v-.07A8.001 8.001 0 014.07 13H7a1 1 0 110 2H4.07A8.001 8.001 0 0111 19.93V17a1 1 0 112 0v2.93A8.001 8.001 0 0119.93 15H17a1 1 0 110-2h2.93A8.001 8.001 0 0113 4.07V7a1 1 0 11-2 0V4.07A8.001 8.001 0 014.07 11H7a1 1 0 110 2H4.07A8.001 8.001 0 0111 19.93z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ),
                    title: 'Visit SWAU and create an account.',
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm-8 0V8a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ),
                    title: 'Follow their submission process for Funko authentication.',
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ),
                    title: 'Package your item securely and ship as instructed.',
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ),
                    title: 'Track your order and await certification results.',
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col items-center group animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.12 + 0.1}s` }}
                  >
                    <div className="bg-gray-900 border-2 border-orange-400 rounded-full p-4 mb-2 shadow-lg group-hover:scale-110 transition-transform duration-200">
                      {step.icon}
                    </div>
                    <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-3 text-white text-center font-semibold shadow group-hover:bg-orange-500 group-hover:text-white transition-colors duration-200 min-w-[200px]">
                      {step.title}
                    </div>
                    {idx < 3 && (
                      <div className="hidden md:block absolute right-[-32px] top-1/2 -translate-y-1/2 w-8 h-1 bg-orange-400 rounded-full z-0" />
                    )}
                    {idx < 3 && (
                      <div className="block md:hidden w-1 h-8 bg-orange-400 rounded-full mt-2 mb-2" />
                    )}
                  </div>
                ))}
              </div>
              {/* Featured SWAU Signings with modern scroll indicator */}
              <div className="mb-6 relative">
                <h3 className="text-lg font-bold text-orange-400 mb-3">Featured SWAU Signings</h3>
                <div className="relative">
                  {/* Left fade */}
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-8 z-10 bg-gradient-to-r from-gray-800/90 to-transparent" />
                  {/* Right fade */}
                  <div className="pointer-events-none absolute right-0 top-0 h-full w-8 z-10 bg-gradient-to-l from-gray-800/90 to-transparent" />
                  {/* Animated right arrow (now clickable) */}
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 animate-bounce-x bg-transparent border-none p-0 m-0 cursor-pointer"
                    onClick={scrollSwauRight}
                    aria-label="Scroll right"
                    tabIndex={0}
                    style={{ outline: 'none' }}
                  >
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="#e46c1b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <div ref={swauScrollRef} className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {[
                      { name: 'Pedro Pascal', event: 'Autograph Signing', price: '$350.00', character: 'Din Djarin (The Mandalorian)', img: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Pedro_Pascal_by_Gage_Skidmore_2.jpg' },
                      { name: 'Kevin Costner', event: 'Fanatics Fest 2025', price: '$325.00', character: 'John Dutton (Yellowstone)', img: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Kevin_Costner_Cannes_2003.jpg' },
                      { name: 'Henry Cavill', event: 'Autograph Signing', price: '$275.00', character: 'Superman (Man of Steel)', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Henry_Cavill_by_Gage_Skidmore_2.jpg' },
                      { name: 'Tom Holland', event: 'Autograph Signing', price: '$275.00', character: 'Peter Parker (Spider-Man)', img: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Tom_Holland_by_Gage_Skidmore_2.jpg' },
                      { name: 'Richard Dreyfuss', event: 'London Film and Comic Con', price: '$165.00', character: 'Matt Hooper (Jaws)', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Richard_Dreyfuss_2017.jpg' },
                      { name: 'Pom Klementieff', event: 'London Film and Comic Con', price: '$125.00', character: 'Mantis (Guardians of the Galaxy)', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Pom_Klementieff_by_Gage_Skidmore_2.jpg' },
                      { name: 'Ron Perlman', event: 'London Film and Comic Con', price: '$125.00', character: 'Hellboy (Hellboy)', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Ron_Perlman_by_Gage_Skidmore_2.jpg' },
                      { name: 'Hayley Atwell', event: 'TERRIFICON', price: '$85.00', character: 'Peggy Carter (Marvel)', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Hayley_Atwell_by_Gage_Skidmore_2.jpg' },
                    ].map((signing, idx) => (
                      <div key={idx} className="min-w-[220px] bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col justify-between shadow-lg hover:shadow-orange-500/30 transition-shadow duration-200 group">
                        <div className="flex flex-col items-center mb-2">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-400 mb-2 bg-gray-800 flex items-center justify-center">
                            {signing.img ? (
                              <img src={signing.img} alt={signing.name} className="object-cover w-full h-full" />
                            ) : (
                              <span className="text-2xl text-orange-400 font-bold">{signing.name[0]}</span>
                            )}
                          </div>
                          <div className="font-bold text-white text-base text-center mb-1">{signing.name}</div>
                          <div className="text-xs text-gray-400 text-center mb-1">{signing.character}</div>
                          <div className="text-xs text-gray-500 text-center mb-2">{signing.event}</div>
                          <div className="font-semibold text-orange-400 text-lg mb-3 text-center">{signing.price}</div>
                        </div>
                        <a
                          href="https://swau.com/collections/autograph-signings"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-center bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded transition"
                        >
                          View on SWAU
                        </a>
                      </div>
                    ))}
                  </div>
                  <style>{`.no-scrollbar::-webkit-scrollbar{display:none;} .no-scrollbar{scrollbar-width:none;-ms-overflow-style:none;} @keyframes bounce-x{0%,100%{transform:translateX(0);}50%{transform:translateX(8px);}} .animate-bounce-x{animation:bounce-x 1.2s infinite;}`}</style>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="spot-fake" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">How to Spot a Fake</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Seller Location */}
                <div className="flex items-start gap-4 bg-gray-900/80 border border-gray-700 rounded-lg p-4">
                  <svg className="w-7 h-7 text-orange-400 mt-1" fill="none" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.7-8-13A8 8 0 1112 21z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div className="text-lg font-medium text-white mb-1">Check Seller Location</div>
                    <div className="text-gray-300 text-sm">If it ships from China, it's almost certainly a fake. Avoid listings with deep discounts or stock photos.</div>
                  </div>
                </div>
                {/* Product Number */}
                <div className="flex items-start gap-4 bg-gray-900/80 border border-gray-700 rounded-lg p-4">
                  <svg className="w-7 h-7 text-orange-400 mt-1" fill="none" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div className="text-lg font-medium text-white mb-1">Verify Product Number</div>
                    <div className="text-gray-300 text-sm">Check the bottom of the box and the figure's feet for a stamped product number. Fakes often have missing or incorrect numbers.</div>
                  </div>
                </div>
                {/* Box Artwork */}
                <div className="flex items-start gap-4 bg-gray-900/80 border border-gray-700 rounded-lg p-4">
                  <svg className="w-7 h-7 text-orange-400 mt-1" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div className="text-lg font-medium text-white mb-1">Inspect Box Artwork</div>
                    <div className="text-gray-300 text-sm">Look for wide or uneven borders, missing logos, or incorrect fonts. Compare with official images.</div>
                  </div>
                </div>
                {/* Paint & Figure Details */}
                <div className="flex items-start gap-4 bg-gray-900/80 border border-gray-700 rounded-lg p-4">
                  <svg className="w-7 h-7 text-orange-400 mt-1" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  <div>
                    <div className="text-lg font-medium text-white mb-1">Check Paint & Figure</div>
                    <div className="text-gray-300 text-sm">Fakes often have poor paint jobs, missing details, or incorrect coloring. Compare with authentic figures.</div>
                  </div>
                </div>
                {/* Stickers & Logos */}
                <div className="flex items-start gap-4 bg-gray-900/80 border border-gray-700 rounded-lg p-4">
                  <svg className="w-7 h-7 text-orange-400 mt-1" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/></svg>
                  <div>
                    <div className="text-lg font-medium text-white mb-1">Check Stickers & Logos</div>
                    <div className="text-gray-300 text-sm">Missing, incorrect, or low-quality stickers are a red flag. Look for official Funko logos and correct sticker placement.</div>
                  </div>
                </div>
                {/* Seller Reputation */}
                <div className="flex items-start gap-4 bg-gray-900/80 border border-gray-700 rounded-lg p-4">
                  <svg className="w-7 h-7 text-orange-400 mt-1" fill="none" viewBox="0 0 24 24"><path d="M12 20l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  <div>
                    <div className="text-lg font-medium text-white mb-1">Check Seller Reputation</div>
                    <div className="text-gray-300 text-sm">Avoid sellers with limited or negative feedback, or recently created accounts. Use PayPal Goods & Services for protection.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="common-fakes" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">List of the Most Common Fakes</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/></svg>
                  <div>
                    <div className="font-semibold text-white">SDCC Luna Lovegood</div>
                    <div className="text-gray-400 text-sm">Frequently faked, especially with incorrect stickers or box details.</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/></svg>
                  <div>
                    <div className="font-semibold text-white">Glow-in-the-Dark Martian Manhunter</div>
                    <div className="text-gray-400 text-sm">Fake versions have darker paint and missing box details.</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/></svg>
                  <div>
                    <div className="font-semibold text-white">Convention Exclusive Deadite</div>
                    <div className="text-gray-400 text-sm">Look for missing blood details and incorrect GITD material.</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/></svg>
                  <div>
                    <div className="font-semibold text-white">Unmasked Jason Voorhees</div>
                    <div className="text-gray-400 text-sm">Fakes often miss key details on the figure and box.</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-400">For more, see the <a href="https://popcollectorsalliance.com/resources/identifying-a-fake-funko-pop/" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline">Fake Pop! Database</a>.</div>
            </CardContent>
          </Card>
        </section>

        <section id="trusted-retailers" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Trusted Retailers List</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M3 12l2-2a4 4 0 015.66 0l2 2a4 4 0 005.66 0l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <a href="#" className="font-semibold text-orange-400 underline">Pop in a Box</a>
                    <div className="text-gray-400 text-sm">Official distributor</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M3 12l2-2a4 4 0 015.66 0l2 2a4 4 0 005.66 0l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <a href="#" className="font-semibold text-orange-400 underline">Funko Europe</a>
                    <div className="text-gray-400 text-sm">Direct from Funko</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M3 12l2-2a4 4 0 015.66 0l2 2a4 4 0 005.66 0l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <a href="#" className="font-semibold text-orange-400 underline">Forbidden Planet</a>
                    <div className="text-gray-400 text-sm">Trusted UK retailer</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M3 12l2-2a4 4 0 015.66 0l2 2a4 4 0 005.66 0l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <a href="#" className="font-semibold text-orange-400 underline">SWAU</a>
                    <div className="text-gray-400 text-sm">Signature authentication</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="buyer-safety" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Buyer Safety Tips</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div className="font-semibold text-white">Use secure payment methods</div>
                    <div className="text-gray-400 text-sm">Always use PayPal Goods & Services for protection.</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div className="font-semibold text-white">Be wary of deals too good to be true</div>
                    <div className="text-gray-400 text-sm">If the price is much lower than market value, it's likely a fake.</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div className="font-semibold text-white">Check seller reviews and feedback</div>
                    <div className="text-gray-400 text-sm">Avoid new or low-feedback sellers, especially on Facebook or eBay.</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div className="font-semibold text-white">Ask for detailed photos</div>
                    <div className="text-gray-400 text-sm">Request close-ups of the box, figure, and product number.</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div>
                    <div className="font-semibold text-white">Know your rights</div>
                    <div className="text-gray-400 text-sm">Understand return/refund policies before buying.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="reporting-fakes" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Reporting Fakes</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M18 8a6 6 0 11-12 0 6 6 0 0112 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14v7m-4 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <div>
                  <div className="font-semibold text-white">Report fakes to platforms</div>
                  <div className="text-gray-400 text-sm">eBay, Facebook, Amazon, and others have reporting tools for counterfeit items.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M18 8a6 6 0 11-12 0 6 6 0 0112 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14v7m-4 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <div>
                  <div className="font-semibold text-white">Include clear photos and details</div>
                  <div className="text-gray-400 text-sm">Show why you believe the item is fake. Use side-by-side comparisons if possible.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M18 8a6 6 0 11-12 0 6 6 0 0112 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14v7m-4 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <div>
                  <div className="font-semibold text-white">Use a reporting template</div>
                  <div className="text-gray-400 text-sm">Describe the issue clearly and provide all evidence. [Template: "I believe this item is counterfeit because…"]</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">FAQ</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9 9a3 3 0 016 0c0 1.5-3 2.5-3 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div className="font-semibold text-white">Is this sticker legit?</div>
                    </div>
                    <div className="text-gray-300 text-sm">Compare with official images from Funko, trusted retailers, or collector databases. Look for crisp printing, correct colors, and proper placement.</div>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9 9a3 3 0 016 0c0 1.5-3 2.5-3 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div className="font-semibold text-white">Should I buy loose Pops?</div>
                    </div>
                    <div className="text-gray-300 text-sm">Loose Pops are riskier—harder to authenticate and typically worth 30-50% less than mint-in-box. Only buy from trusted sellers with detailed photos.</div>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9 9a3 3 0 016 0c0 1.5-3 2.5-3 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div className="font-semibold text-white">How do I check a Pop's value?</div>
                    </div>
                    <div className="text-gray-300 text-sm">Use Pop Price Guide, eBay sold listings (last 90 days), or PopGuide app. Check for condition and sticker differences—they significantly affect value.</div>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9 9a3 3 0 016 0c0 1.5-3 2.5-3 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div className="font-semibold text-white">What is a COA?</div>
                    </div>
                    <div className="text-gray-300 text-sm">Certificate of Authenticity, usually for signed Pops. Only trust COAs from reputable companies like SWAU, PSA/DNA, or JSA.</div>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9 9a3 3 0 616 0c0 1.5-3 2.5-3 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div className="font-semibold text-white">Why are convention stickers so expensive?</div>
                    </div>
                    <div className="text-gray-300 text-sm">Limited quantities, exclusive to specific events, and high collector demand. SDCC and NYCC stickers can add 200-500% to a Pop's value.</div>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9 9a3 3 0 616 0c0 1.5-3 2.5-3 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div className="font-semibold text-white">What's the difference between chase and regular variants?</div>
                    </div>
                    <div className="text-gray-300 text-sm">Chase variants are rare (usually 1 in 6 ratio), with different designs or colors. They're significantly more valuable than regular versions.</div>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9 9a3 3 0 616 0c0 1.5-3 2.5-3 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div className="font-semibold text-white">How can I tell if a box has been damaged and repaired?</div>
                    </div>
                    <div className="text-gray-300 text-sm">Look for color mismatches, uneven surfaces, or different paper textures. Check corners and edges for signs of glue or tape residue.</div>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9 9a3 3 0 616 0c0 1.5-3 2.5-3 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div className="font-semibold text-white">What's a "shared exclusive"?</div>
                    </div>
                    <div className="text-gray-300 text-sm">Same Pop sold at multiple retailers with different stickers (e.g., Hot Topic, BoxLunch). All versions are authentic but may have different values.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="resources" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Useful Resources</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <a href="https://www.funko.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-400 underline">Funko Official Guide</a>
                  <div className="text-gray-400 text-sm">Official Funko resources and guides.</div>
                </div>
                <div>
                  <a href="https://www.poppriceguide.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-400 underline">Pop Price Guide</a>
                  <div className="text-gray-400 text-sm">Check current values and trends.</div>
                </div>
                <div>
                  <a href="https://swau.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-400 underline">SWAU Authentication</a>
                  <div className="text-gray-400 text-sm">Signature authentication and signings.</div>
                </div>
                <div>
                  <a href="https://popcollectorsalliance.com/resources/identifying-a-fake-funko-pop/" target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-400 underline">Fake Pop! Database</a>
                  <div className="text-gray-400 text-sm">Gallery and tips for spotting fakes.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="case-studies" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Real-World Case Studies</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="space-y-8">
                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <div>
                      <div className="font-bold text-white text-lg">Case Study: SDCC Luna Lovegood Scam</div>
                      <div className="text-gray-400 text-sm">eBay Purchase - £180 Loss</div>
                    </div>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p><strong>The Purchase:</strong> Collector found SDCC Luna Lovegood for £180 (usual price £400+) from a seller with 98% feedback. Listing used stock photos and shipped from China.</p>
                    <p><strong>Red Flags Missed:</strong> Deep discount (55% off market), stock photos, China shipping, seller had 200+ available.</p>
                    <p><strong>The Fake:</strong> Box had blurry printing, wrong font on SDCC sticker, missing Funko logo, and figure paint was too dark.</p>
                    <p><strong>Outcome:</strong> eBay sided with buyer after photo evidence. Full refund received, but took 3 weeks to resolve.</p>
                    <p><strong>Lesson:</strong> Always be suspicious of deep discounts on rare items. Check seller location and ask for original photos.</p>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <div>
                      <div className="font-bold text-white text-lg">Case Study: Facebook Marketplace Near-Miss</div>
                      <div className="text-gray-400 text-sm">Local Purchase - Avoided £95 Loss</div>
                    </div>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p><strong>The Listing:</strong> GITD Martian Manhunter for £95 on Facebook Marketplace. Seller claimed it was from their "personal collection."</p>
                    <p><strong>Smart Moves:</strong> Buyer asked for detailed photos, checked seller's profile (new account, no other listings), and posted in collector groups for advice.</p>
                    <p><strong>Community Response:</strong> Group members immediately spotted issues: darker GITD material, missing box details, wrong sticker placement.</p>
                    <p><strong>Outcome:</strong> Buyer avoided the scam. Seller's account was later reported and removed.</p>
                    <p><strong>Lesson:</strong> Use collector communities as a second opinion. Genuine sellers welcome questions and detailed photo requests.</p>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div>
                      <div className="font-bold text-white text-lg">Case Study: Successful Authentication Process</div>
                      <div className="text-gray-400 text-sm">SWAU Authentication - £350 Protected</div>
                    </div>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p><strong>The Item:</strong> Signed Tony Stark Pop valued at £350, purchased from a private collector who claimed to have gotten it signed at a convention.</p>
                    <p><strong>Due Diligence:</strong> Buyer researched the signing event, checked photos of the convention, and requested additional photos of the signature.</p>
                    <p><strong>Authentication:</strong> Sent to SWAU for verification. Cost £25 but provided peace of mind and COA for future resale.</p>
                    <p><strong>Outcome:</strong> Signature authenticated, Pop value increased to £400+ with COA. Insurance valuation updated.</p>
                    <p><strong>Lesson:</strong> For high-value signed items, professional authentication is worth the cost. It protects your investment and increases resale value.</p>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/></svg>
                    <div>
                      <div className="font-bold text-white text-lg">Case Study: Box Damage Repair Discovery</div>
                      <div className="text-gray-400 text-sm">eBay Purchase - Negotiated £30 Discount</div>
                    </div>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p><strong>The Purchase:</strong> "Mint" condition chase variant for £120. Photos looked perfect, seller had excellent feedback.</p>
                    <p><strong>The Discovery:</strong> Upon arrival, collector noticed slight color differences on box corners and uneven surface texture.</p>
                    <p><strong>Investigation:</strong> Under closer inspection, found evidence of professional box repair work. Corners had been rebuilt and repainted.</p>
                    <p><strong>Resolution:</strong> Contacted seller, who admitted to professional restoration but claimed it was still "mint." Negotiated £30 partial refund.</p>
                    <p><strong>Lesson:</strong> "Mint" doesn't include repaired boxes. Always inspect thoroughly upon arrival and don't hesitate to negotiate if item doesn't match description.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="alerts" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Live Price/Authenticity Alerts</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/></svg>
                <div>
                  <div className="font-semibold text-white">Get warnings on high-risk Pops</div>
                  <div className="text-gray-400 text-sm">Alerts for fakes, price drops, and suspicious listings (coming soon).</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="community-input" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Community Input</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21v-2a4 4 0 013-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
                <div>
                  <div className="font-semibold text-white">See upvoted user tips</div>
                  <div className="text-gray-400 text-sm">Community-sourced advice and moderation (coming soon).</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="marketplace-watch" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Marketplace Watch</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M3 12l2-2a4 4 0 015.66 0l2 2a4 4 0 005.66 0l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div>
                  <div className="font-semibold text-white">Current scam listings & trusted sellers</div>
                  <div className="text-gray-400 text-sm">Marketplace data and highlights (coming soon).</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="legal-advice" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Legal/Returns Advice</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="space-y-8">
                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div className="font-bold text-white text-lg">What to do if you receive a fake</div>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <div><strong>1. Document Everything:</strong> Take photos immediately, save all communication, keep original packaging.</div>
                    <div><strong>2. Contact Seller First:</strong> Give them 48 hours to respond. Be polite but firm about wanting a full refund.</div>
                    <div><strong>3. Platform Protection:</strong> Open dispute through eBay, PayPal, or relevant platform. Upload evidence.</div>
                    <div><strong>4. Don't Ship Back:</strong> Never return counterfeit items. Most platforms will tell you to keep or destroy them.</div>
                    <div><strong>5. Report the Seller:</strong> Help other collectors by reporting counterfeit listings to the platform.</div>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div className="font-bold text-white text-lg">UK Consumer Rights (Consumer Rights Act 2015)</div>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <div><strong>Right to Refund:</strong> If goods are not as described, you have 30 days for full refund.</div>
                    <div><strong>Satisfactory Quality:</strong> Items must match description and be of acceptable quality.</div>
                    <div><strong>Distance Selling:</strong> 14-day cooling-off period for online purchases (doesn't apply to private sales).</div>
                    <div><strong>Counterfeit Protection:</strong> Sale of counterfeit goods is illegal under Trademark Act 1994.</div>
                    <div><strong>Bank Protection:</strong> Section 75 protection for credit card purchases over £100.</div>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div className="font-bold text-white text-lg">How to initiate a chargeback</div>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <div><strong>When to Use:</strong> After platform dispute fails, or for direct payment scams.</div>
                    <div><strong>Time Limit:</strong> Usually 120 days from transaction date (varies by bank).</div>
                    <div><strong>Required Evidence:</strong> Transaction details, communication with seller, proof item was counterfeit.</div>
                    <div><strong>Process:</strong> Contact your bank's disputes team, provide documentation, await investigation (usually 10-45 days).</div>
                    <div><strong>Success Rate:</strong> High for "item not as described" if you have good evidence.</div>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div className="font-bold text-white text-lg">PayPal Buyer Protection</div>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <div><strong>Coverage:</strong> Significantly Not as Described (SNAD) covers counterfeit items.</div>
                    <div><strong>Time Limit:</strong> 180 days from payment date to open dispute.</div>
                    <div><strong>Process:</strong> Try Resolution Centre first, escalate to claim if seller unresponsive.</div>
                    <div><strong>Evidence Needed:</strong> Photos showing differences, expert opinions, reference images.</div>
                    <div><strong>Return Policy:</strong> PayPal may not require return of counterfeit items for safety reasons.</div>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5a2 2 0 00-2-2H6a2 2 0 00-2 2v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div className="font-bold text-white text-lg">Prevention is Better Than Cure</div>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <div><strong>Payment Methods:</strong> Always use PayPal Goods & Services, never Friends & Family.</div>
                    <div><strong>Research Sellers:</strong> Check feedback, join collector groups, ask for references.</div>
                    <div><strong>Trust Your Gut:</strong> If something feels wrong, walk away. There are always other Pops.</div>
                    <div><strong>Insurance:</strong> For high-value collections, ensure adequate insurance coverage.</div>
                    <div><strong>Records:</strong> Keep receipts, photos, and authenticity certificates for valuable items.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="glossary" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Glossary</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold text-white mb-1">COA</div>
                  <div className="text-gray-400 text-sm">Certificate of Authenticity</div>
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Vaulted</div>
                  <div className="text-gray-400 text-sm">No longer in production</div>
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Chase</div>
                  <div className="text-gray-400 text-sm">Limited variant</div>
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">SWAU</div>
                  <div className="text-gray-400 text-sm">Signature authentication company</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <Footer />
      <style>{`@keyframes fade-in-up{0%{opacity:0;transform:translateY(24px);}100%{opacity:1;transform:translateY(0);}}.animate-fade-in-up{animation:fade-in-up 0.7s cubic-bezier(.39,.575,.565,1) both;}`}</style>
    </div>
  );
} 