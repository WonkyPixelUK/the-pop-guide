import { CheckCircle, Loader, Lightbulb, ClipboardList, Rocket, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useState } from 'react';

const deployed = [
  'Bulk Actions (add/edit/remove)',
  'CSV Import & Export',
  'Smart Value Alerts',
  'Collection Insurance Report',
  'Social & Community Upgrades',
  'Advanced Analytics',
  'Wish Tracker & Drop Alerts',
  'Gamification',
  'Personalized Recommendations',
  'Showcase & Virtual Shelf',
];
const beingBuilt = [
  'Referral Program',
  'Blog/News Section',
  'GDPR/Privacy Tools',
];
const approved = [
  'Accessibility Improvements',
  'More Retailer Integrations',
  'Advanced Collection Filters',
];
const inPlanning = [
  'Funko Pop Price Prediction AI',
  'Marketplace Expansion',
  'More Gamification',
];
const changelog = [
  { version: 'v1.1.0', date: '2024-06-10', details: 'Bulk actions, CSV import/export, value alerts, insurance report, social upgrades, analytics, wish tracker, gamification, recommendations, showcase/shelf.' },
  { version: 'v1.0.0', date: '2024-05-01', details: 'Initial launch, collection tracking, wishlist, analytics, notifications, public profiles.' },
];

export default function Roadmap() {
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');
  const [featureRequests, setFeatureRequests] = useState<{title: string, desc: string, up: number, down: number}[]>([]);

  const handleFeatureSubmit = (e) => {
    e.preventDefault();
    if (!featureTitle.trim()) return;
    setFeatureRequests([{ title: featureTitle, desc: featureDesc, up: 0, down: 0 }, ...featureRequests]);
    setFeatureTitle('');
    setFeatureDesc('');
    setFeatureModalOpen(false);
  };
  const handleVote = (idx: number, type: 'up' | 'down') => {
    setFeatureRequests(reqs => reqs.map((r, i) => i === idx ? { ...r, [type]: r[type] + 1 } : r));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
      <Navigation />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Rocket className="w-8 h-8 text-green-400 animate-bounce" />
          PopGuide Roadmap & Changelog
        </h1>
        <div className="flex justify-end mb-6">
          <button
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded shadow transition"
            onClick={() => setFeatureModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Request a feature
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Deployed */}
          <Card className="bg-gray-900 border-2 border-green-500 rounded-lg shadow-md animate-pulse-green">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400 animate-pop" />
                <span className="font-bold text-green-300">Deployed</span>
              </div>
              <ul className="text-sm text-gray-200 space-y-1">
                {deployed.map(f => <li key={f}>{f}</li>)}
              </ul>
              <div className="text-xs text-gray-400 mt-2">Latest: v1.1.0 (2024-06-10)</div>
            </CardContent>
          </Card>
          {/* Being Built */}
          <Card className="bg-gray-900 border-2 border-blue-500 rounded-lg shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Loader className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="font-bold text-blue-300">Being Built</span>
              </div>
              <ul className="text-sm text-gray-200 space-y-1">
                {beingBuilt.map(f => <li key={f}>{f}</li>)}
              </ul>
            </CardContent>
          </Card>
          {/* Approved */}
          <Card className="bg-gray-900 border-2 border-yellow-500 rounded-lg shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-5 h-5 text-yellow-400 animate-wiggle" />
                <span className="font-bold text-yellow-300">Approved</span>
              </div>
              <ul className="text-sm text-gray-200 space-y-1">
                {approved.map(f => <li key={f}>{f}</li>)}
              </ul>
            </CardContent>
          </Card>
          {/* In Planning */}
          <Card className="bg-gray-900 border-2 border-gray-500 rounded-lg shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-gray-300 animate-flicker" />
                <span className="font-bold text-gray-300">In Planning</span>
              </div>
              <ul className="text-sm text-gray-200 space-y-1">
                {inPlanning.map(f => <li key={f}>{f}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>
        {/* Changelog/Version Control */}
        <div className="bg-gray-900 border border-gray-700 rounded p-6 text-sm text-gray-300">
          <h2 className="text-xl font-bold text-white mb-4">Changelog</h2>
          {changelog.map(entry => (
            <div key={entry.version} className="mb-2">
              <span className={`font-bold ${entry.version === 'v1.1.0' ? 'text-green-400' : 'text-blue-400'}`}>{entry.version}</span> ({entry.date}): {entry.details}
            </div>
          ))}
        </div>
        {/* Feature Request Modal */}
        {featureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Request a Feature</h3>
              <form onSubmit={handleFeatureSubmit}>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-900"
                  placeholder="Feature title (required)"
                  value={featureTitle}
                  onChange={e => setFeatureTitle(e.target.value)}
                  required
                />
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-gray-900"
                  placeholder="Description (optional)"
                  value={featureDesc}
                  onChange={e => setFeatureDesc(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setFeatureModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-white font-bold hover:bg-orange-600">Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Feature Requests List */}
        {featureRequests.length > 0 && (
          <section className="mt-12" id="feature-requests">
            <h2 className="text-2xl font-bold text-white mb-4">Requested Features (Vote!)</h2>
            <ul className="space-y-4">
              {featureRequests.map((req, idx) => (
                <li key={idx} className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-white text-lg mb-1">{req.title}</div>
                    {req.desc && <div className="text-gray-300 text-sm mb-2">{req.desc}</div>}
                  </div>
                  <div className="flex items-center gap-3 mt-2 md:mt-0">
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold"
                      onClick={() => handleVote(idx, 'up')}
                      aria-label="Thumbs up"
                    >
                      <ThumbsUp className="w-4 h-4" /> {req.up}
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
                      onClick={() => handleVote(idx, 'down')}
                      aria-label="Thumbs down"
                    >
                      <ThumbsDown className="w-4 h-4" /> {req.down}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
} 