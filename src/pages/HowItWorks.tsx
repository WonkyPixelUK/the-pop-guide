import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { UserPlus, List, DollarSign, Users, Database, RefreshCw, Eye, Server, Globe, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    desc: 'Create your free account in seconds and join the PopGuide community.'
  },
  {
    icon: List,
    title: 'Track Your Collection',
    desc: 'Add, organise, and manage your Funko Pop collection with ease.'
  },
  {
    icon: DollarSign,
    title: 'See Your Value',
    desc: 'Instantly see the estimated value of your collection, updated in real time.'
  },
  {
    icon: Users,
    title: 'Share & Compete',
    desc: 'Show off your collection, share lists, and compete with friends.'
  }
];

const sources = [
  { icon: Globe, label: 'eBay' },
  { icon: Globe, label: 'Pop Price Guide' },
  { icon: Globe, label: 'HobbyDB' },
  { icon: Globe, label: 'Whatnot' },
  { icon: Globe, label: 'Other trusted sources' }
];

const HowItWorks = () => (
  <>
    <Navigation />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-8">How It Works</h1>
        <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          PopGuide makes collecting Funko Pops fun, social, and valuable. Here's how you get started:
        </p>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 mb-16">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col items-center bg-gray-800/60 rounded-xl p-8 shadow-lg w-full md:w-1/4 transition-transform duration-300 hover:-translate-y-2 animate-fadeInUp"
              style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
            >
              <step.icon className="w-12 h-12 text-orange-400 mb-4 animate-bounce" />
              <h2 className="text-2xl font-semibold mb-2 text-white text-center">{step.title}</h2>
              <p className="text-gray-300 text-center text-base">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-800/80 rounded-2xl p-8 mb-12 shadow-lg animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-3xl font-bold text-orange-400 mb-6 text-center flex items-center justify-center gap-2">
            <Server className="w-8 h-8 text-orange-400" /> How We Calculate Value
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-400" /> Real-Time Market Data</h3>
              <p className="text-gray-300 mb-4">We aggregate recent sales, average prices, and market trends from trusted sources. Outliers and suspicious sales are filtered out for accuracy.</p>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-blue-400" /> Always Up to Date</h3>
              <p className="text-gray-300 mb-4">Values and listings are updated several times per day. Some sources update in near real-time, while others are refreshed every few hours.</p>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Eye className="w-5 h-5 text-orange-400" /> Transparent Sources</h3>
              <p className="text-gray-300">You can always see the sources and recent sales behind each value. We believe in transparency and accuracy.</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <h4 className="text-lg font-semibold mb-4">Data Sources</h4>
              <div className="flex flex-wrap gap-4 justify-center">
                {sources.map((src, i) => (
                  <div key={src.label} className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: `${i * 0.1 + 0.7}s` }}>
                    <src.icon className="w-8 h-8 text-orange-400 mb-1" />
                    <span className="text-gray-200 text-sm">{src.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/80 rounded-2xl p-8 mb-12 shadow-lg animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          <h2 className="text-3xl font-bold text-orange-400 mb-6 text-center flex items-center justify-center gap-2">
            <Database className="w-8 h-8 text-orange-400" /> How We Scrape Data
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-blue-400" /> Automated & Manual</h3>
              <p className="text-gray-300 mb-4">Our automated tools regularly scan supported sites for new sales, listings, and price changes. We use a mix of APIs, web scraping, and manual review to ensure data quality. All scraping is done in compliance with site terms and with respect for privacy and fair use.</p>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Server className="w-5 h-5 text-orange-400" /> Secure & Reliable</h3>
              <p className="text-gray-300">All data is securely stored and processed. We use enterprise-grade infrastructure to keep your collection safe and available 24/7.</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center gap-4 mb-4">
                <Globe className="w-10 h-10 text-blue-400 animate-spin-slow" />
                <RefreshCw className="w-10 h-10 text-orange-400 animate-spin" />
                <Database className="w-10 h-10 text-green-400 animate-bounce" />
                <Users className="w-10 h-10 text-orange-400 animate-pulse" />
              </div>
              <p className="text-gray-300 text-center text-sm">Scraper → Database → You</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/80 rounded-2xl p-8 shadow-lg animate-fadeInUp" style={{ animationDelay: '1s' }}>
          <h2 className="text-3xl font-bold text-orange-400 mb-4 text-center flex items-center justify-center gap-2">
            <Eye className="w-8 h-8 text-orange-400" /> Transparency & Trust
          </h2>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-2">
            We believe in transparency. You can always see the sources and recent sales behind each value. If you have questions or spot an error, contact support and we'll investigate promptly.
          </p>
          <p className="text-gray-300 text-center max-w-2xl mx-auto">
            PopGuide is built by collectors, for collectors. Your trust is our top priority.
          </p>
        </div>
      </div>
    </div>
    <Footer />
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeInUp {
        animation: fadeInUp 0.6s both;
      }
      .animate-spin-slow {
        animation: spin 3s linear infinite;
      }
    `}</style>
  </>
);

export default HowItWorks; 