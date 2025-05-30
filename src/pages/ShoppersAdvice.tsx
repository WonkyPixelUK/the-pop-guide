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
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 018 0v2M21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ),
      label: 'Verify product number on box and feet',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ),
      label: 'Inspect box artwork (borders, logos, fonts)',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      label: 'Check paint quality and figure details',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/></svg>
      ),
      label: 'Check stickers and logos',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24"><path d="M12 20l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      ),
      label: 'Check seller reputation and use PayPal Goods & Services',
    },
  ];
  const [checked, setChecked] = useState(Array(steps.length).fill(false));

  const toggleStep = idx => {
    setChecked(arr => arr.map((v, i) => (i === idx ? !v : v)));
  };

  return (
    <div className="space-y-3">
      {steps.map((step, idx) => (
        <button
          key={idx}
          type="button"
          className={`w-full flex items-center gap-4 bg-gray-900/80 border border-gray-700 rounded-lg px-4 py-3 text-left transition shadow group focus:outline-none ${checked[idx] ? 'ring-2 ring-orange-400' : ''}`}
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
      ))}
      <style>{`@keyframes ping-once{0%{transform:scale(1);}50%{transform:scale(1.3);}100%{transform:scale(1);}}.animate-ping-once{animation:ping-once 0.4s linear;}`}</style>
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
                  <svg className="w-7 h-7 text-orange-400 mt-1" fill="none" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 018 0v2M21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
              <div className="mb-4">Search or browse the gallery below for known fakes.</div>
              <div className="bg-gray-800 rounded p-4 text-sm text-gray-300 mb-2">[Gallery/list of common fakes placeholder]</div>
            </CardContent>
          </Card>
        </section>

        <section id="trusted-retailers" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Trusted Retailers List</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <ul className="list-disc ml-6 mb-4">
                <li><a href="#" className="text-orange-400 underline">Pop in a Box</a> – Official distributor</li>
                <li><a href="#" className="text-orange-400 underline">Funko Europe</a> – Direct from Funko</li>
                <li><a href="#" className="text-orange-400 underline">Forbidden Planet</a> – Trusted UK retailer</li>
                <li><a href="#" className="text-orange-400 underline">SWAU</a> – Signature authentication</li>
              </ul>
              <div className="bg-gray-800 rounded p-4 text-sm text-gray-300">[Add more as needed]</div>
            </CardContent>
          </Card>
        </section>

        <section id="buyer-safety" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Buyer Safety Tips</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <ul className="list-disc ml-6 mb-4">
                <li>Always use secure payment methods (PayPal Goods & Services).</li>
                <li>Be wary of deals that seem too good to be true.</li>
                <li>Check seller reviews and feedback.</li>
                <li>Ask for detailed photos before buying.</li>
                <li>Know your rights for returns and refunds.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section id="reporting-fakes" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Reporting Fakes</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div>Report fakes to platforms like eBay, Facebook, and Amazon. Use the following template:</div>
              <div className="bg-gray-800 rounded p-4 text-sm text-gray-300 my-2">[Reporting template placeholder]</div>
              <div>Include clear photos and a description of why you believe the item is fake.</div>
            </CardContent>
          </Card>
        </section>

        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">FAQ</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <ul className="list-disc ml-6 mb-4">
                <li>Is this sticker legit?</li>
                <li>Should I buy loose Pops?</li>
                <li>How do I check a Pop's value?</li>
                <li>What is a COA?</li>
              </ul>
              <div className="bg-gray-800 rounded p-4 text-sm text-gray-300">[Add more FAQs as needed]</div>
            </CardContent>
          </Card>
        </section>

        <section id="resources" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Useful Resources</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <ul className="list-disc ml-6 mb-4">
                <li><a href="#" className="text-orange-400 underline">Funko Official Guide</a></li>
                <li><a href="#" className="text-orange-400 underline">Pop Price Guide</a></li>
                <li><a href="#" className="text-orange-400 underline">SWAU Authentication</a></li>
                <li><a href="#" className="text-orange-400 underline">Collector Communities</a></li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section id="case-studies" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Real-World Case Studies</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="mb-2">Read about real experiences from collectors:</div>
              <div className="bg-gray-800 rounded p-4 text-sm text-gray-300 mb-2">[Case study 1 placeholder]</div>
              <div className="bg-gray-800 rounded p-4 text-sm text-gray-300">[Case study 2 placeholder]</div>
            </CardContent>
          </Card>
        </section>

        <section id="interactive-tools" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Interactive Tools</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div className="mb-6">
                <div className="text-lg font-semibold mb-2">Test your knowledge or generate a checklist before buying:</div>
                {/* Fake Checker Interactive Checklist */}
                <FakeCheckerChecklist />
              </div>
              <div>
                <div className="text-lg font-semibold mb-2">Checklist Generator</div>
                <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 text-gray-400">[Checklist Generator placeholder]</div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="alerts" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Live Price/Authenticity Alerts</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div>Get warnings on high-risk Pops in your collection or wishlist. [Integration placeholder]</div>
            </CardContent>
          </Card>
        </section>

        <section id="community-input" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Community Input</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div>See upvoted user tips or ask the community for advice. [Moderation and submission placeholder]</div>
            </CardContent>
          </Card>
        </section>

        <section id="marketplace-watch" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Marketplace Watch</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <div>Current scam listings and trusted seller highlights. [Marketplace data placeholder]</div>
            </CardContent>
          </Card>
        </section>

        <section id="legal-advice" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Legal/Returns Advice</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <ul className="list-disc ml-6 mb-4">
                <li>What to do if you receive a fake</li>
                <li>Legal rights for returns and refunds</li>
                <li>How to initiate a chargeback</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section id="glossary" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Glossary</h2>
          <Card className="bg-gray-800/70 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-white">
              <ul className="list-disc ml-6 mb-4">
                <li>COA – Certificate of Authenticity</li>
                <li>Vaulted – No longer in production</li>
                <li>Chase – Limited variant</li>
                <li>SWAU – Signature authentication company</li>
              </ul>
              <div className="bg-gray-800 rounded p-4 text-sm text-gray-300">[Add more terms as needed]</div>
            </CardContent>
          </Card>
        </section>
      </div>
      <Footer />
      <style>{`@keyframes fade-in-up{0%{opacity:0;transform:translateY(24px);}100%{opacity:1;transform:translateY(0);}}.animate-fade-in-up{animation:fade-in-up 0.7s cubic-bezier(.39,.575,.565,1) both;}`}</style>
    </div>
  );
} 