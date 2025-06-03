import { CheckCircle, Loader, Lightbulb, ClipboardList, Rocket, ThumbsUp, ThumbsDown, Plus, Monitor, Chrome, Smartphone, Tablet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FeatureRequest, FeatureRequestVote } from '@/types/supabase';

// Web App Data
const webAppData = {
  deployed: [
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
    'Friend Requests & DM System',
    'New Releases Tracking',
    'Currency Support (£/$/€)',
    'Dashboard 2.0 with Accordion UI',
    'Enhanced Pro Features (24 total)',
  ],
  beingBuilt: [
    'Referral Program',
    'Blog/News Section',
    'GDPR/Privacy Tools',
  ],
  approved: [
    'Accessibility Improvements',
    'More Retailer Integrations',
    'Advanced Collection Filters',
  ],
  inPlanning: [
    'Funko Pop Price Prediction AI',
    'Marketplace Expansion',
    'More Gamification',
  ],
  changelog: [
    { version: 'v1.2.0', date: '02/06/2025', details: 'Major feature update: Added comprehensive friend request and DM functionality to public profiles, enhanced pricing system with accurate £3.99/£3.49 Pro pricing, implemented New Releases tracking system with Funko Europe integration, upgraded Dashboard with accordion-style interface and currency support (£/$/€), expanded Pro plan features list to 24 comprehensive features, added performance optimizations and improved user experience across the platform.' },
    { version: 'v1.1.2', date: '31/01/2025', details: 'Platform section enhancements: Added styled buttons with gradients and hover effects across all platform cards (Web App, iOS, Android, Chrome Extension). Completely reworked Chrome Extension page to match Android/iOS layout with hero section, compatibility info, features grid, and installation guide. Removed "Coming Soon" from iOS platform card. Fixed syntax errors and improved button alignment consistency. Enhanced mobile app with comprehensive Expo development setup.' },
    { version: 'v1.1.1', date: '29/04/2025', details: 'Added 60+ new feature requests for voting and improved roadmap display.' },
    { version: 'v1.1.0', date: '12/06/2024', details: 'Bulk actions, CSV import/export, value alerts, insurance report, social upgrades, analytics, wish tracker, gamification, recommendations, showcase/shelf.' },
    { version: 'v1.0.0', date: '01/05/2024', details: 'Initial launch, collection tracking, wishlist, analytics, notifications, public profiles.' },
  ],
  latestVersion: { version: 'v1.2.0', date: '02/06/2025', details: 'Major feature update: Friend requests, DM functionality, New Releases tracking, enhanced Dashboard with currency support, and expanded Pro features.' }
};

// Chrome Extension Data
const chromeExtensionData = {
  deployed: [
    'Real Supabase Integration',
    'Advanced OCR with Tesseract.js',
    'Area Selection Screenshots',
    'Smart Database Search',
    'Multi-Strategy Pop Detection',
    'Secure Authentication',
    'List Management Integration',
    'Professional PopGuide UI',
    'Auto-Fill from OCR',
    'Manual Entry Mode',
    'Real-Time Cloud Sync',
    'Privacy & Security Features',
  ],
  beingBuilt: [
    'Chrome Web Store Approval',
    'Auto-Update System',
    'Enhanced Price Detection',
  ],
  approved: [
    'Bulk Add from Screenshots',
    'Keyboard Shortcuts',
    'Offline Mode Support',
  ],
  inPlanning: [
    'Firefox Extension',
    'Safari Extension',
    'Edge-Specific Features',
  ],
  changelog: [
    { version: 'v1.0.0', date: '02/06/2025', details: 'Initial release: Full production Chrome extension with real Supabase integration, Tesseract.js OCR, area selection capture, smart database search, and professional PopGuide branding. Complete with authentication, list management, and real-time sync.' },
  ],
  latestVersion: { version: 'v1.0.0', date: '02/06/2025', details: 'Production release with full Supabase integration, OCR processing, and smart database search.' }
};

// iOS/iPad App Data
const iosData = {
  deployed: [
    'React Native Framework Setup',
    'Expo Development Environment',
    'Cross-Platform Component Library',
    'Navigation Architecture',
    'Core UI Components',
  ],
  beingBuilt: [
    'Supabase Mobile Integration',
    'Authentication System',
    'Collection Management UI',
    'Search & Filter System',
    'Camera Integration for Scanning',
  ],
  approved: [
    'App Store Optimization',
    'Push Notifications',
    'Offline Data Sync',
    'iOS-Specific UI Enhancements',
  ],
  inPlanning: [
    'Widget Support',
    'Siri Shortcuts',
    'Apple Watch Companion',
    'iPad Pro Features',
  ],
  changelog: [
    { version: 'v0.2.0', date: '31/01/2025', details: 'Development milestone: Completed Expo setup, navigation architecture, and core component library. Ready for feature development phase.' },
    { version: 'v0.1.0', date: '15/01/2025', details: 'Project initialization: React Native and Expo setup, development environment configuration.' },
  ],
  latestVersion: { version: 'v0.2.0', date: '31/01/2025', details: 'Development framework completed, ready for feature implementation.' }
};

// Android App Data
const androidData = {
  deployed: [
    'React Native Framework Setup',
    'Expo Development Environment',
    'Cross-Platform Component Library',
    'Navigation Architecture',
    'Core UI Components',
  ],
  beingBuilt: [
    'Supabase Mobile Integration',
    'Authentication System',
    'Collection Management UI',
    'Search & Filter System',
    'Camera Integration for Scanning',
  ],
  approved: [
    'Google Play Store Optimization',
    'Push Notifications',
    'Offline Data Sync',
    'Material Design Integration',
  ],
  inPlanning: [
    'Android Widgets',
    'Google Assistant Integration',
    'Wear OS Companion',
    'Tablet-Optimized UI',
  ],
  changelog: [
    { version: 'v0.2.0', date: '31/01/2025', details: 'Development milestone: Completed Expo setup, navigation architecture, and core component library. Ready for feature development phase.' },
    { version: 'v0.1.0', date: '15/01/2025', details: 'Project initialization: React Native and Expo setup, development environment configuration.' },
  ],
  latestVersion: { version: 'v0.2.0', date: '31/01/2025', details: 'Development framework completed, ready for feature implementation.' }
};

const platforms = [
  { id: 'webapp', name: 'Web App', icon: <Monitor className="w-5 h-5" />, data: webAppData },
  { id: 'chrome', name: 'Chrome Extension', icon: <Chrome className="w-5 h-5" />, data: chromeExtensionData },
  { id: 'ios', name: 'iOS/iPad App', icon: <Tablet className="w-5 h-5" />, data: iosData },
  { id: 'android', name: 'Android App', icon: <Smartphone className="w-5 h-5" />, data: androidData },
];

export default function Roadmap() {
  const [activeTab, setActiveTab] = useState('webapp');
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [votes, setVotes] = useState<FeatureRequestVote[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voteLoading, setVoteLoading] = useState<string | null>(null);

  const activePlatform = platforms.find(p => p.id === activeTab);
  const { deployed, beingBuilt, approved, inPlanning, changelog, latestVersion } = activePlatform?.data || webAppData;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Get user
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      // Get feature requests
      const { data: reqs } = await supabase.from('feature_requests').select('*').order('created_at', { ascending: false });
      setFeatureRequests(reqs || []);
      // Get votes
      if (session?.user?.id) {
        const { data: vts } = await supabase.from('feature_request_votes').select('*').eq('user_id', session.user.id);
        setVotes(vts || []);
      } else {
        setVotes([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureTitle.trim() || !userId) return;
    setSubmitting(true);
    const { error } = await supabase.from('feature_requests').insert({
      title: featureTitle.trim(),
      description: featureDesc.trim() || null,
      created_by: userId,
      platform: activeTab, // Add platform context to feature requests
    });
    setSubmitting(false);
    if (!error) {
      setFeatureTitle('');
      setFeatureDesc('');
      setFeatureModalOpen(false);
      // Refresh
      const { data: reqs } = await supabase.from('feature_requests').select('*').order('created_at', { ascending: false });
      setFeatureRequests(reqs || []);
    }
  };

  const handleVote = async (featureId: string, vote: 1 | -1) => {
    if (!userId) return;
    setVoteLoading(featureId + vote);
    // Upsert vote (one per user per feature)
    const { error } = await supabase.from('feature_request_votes').upsert({
      feature_request_id: featureId,
      user_id: userId,
      vote,
    }, { onConflict: ['feature_request_id', 'user_id'] });
    setVoteLoading(null);
    if (!error) {
      // Refresh votes
      const { data: vts } = await supabase.from('feature_request_votes').select('*').eq('user_id', userId);
      setVotes(vts || []);
    }
  };

  // Aggregate votes for each feature
  const getVoteCounts = (featureId: string) => {
    const ups = votes.filter(v => v.feature_request_id === featureId && v.vote === 1).length;
    const downs = votes.filter(v => v.feature_request_id === featureId && v.vote === -1).length;
    return { up: ups, down: downs };
  };

  const getUserVote = (featureId: string) => {
    const v = votes.find(v => v.feature_request_id === featureId);
    return v ? v.vote : 0;
  };

  // Filter feature requests by platform
  const platformFeatureRequests = featureRequests.filter(req => 
    req.platform === activeTab || (!req.platform && activeTab === 'webapp')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
      <Navigation />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Rocket className="w-8 h-8 text-green-400 animate-bounce" />
          PopGuide Roadmap & Changelog
        </h1>

        {/* Platform Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6 bg-gray-800/50 p-2 rounded-lg">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setActiveTab(platform.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === platform.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                {platform.icon}
                {platform.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded shadow transition"
            onClick={() => setFeatureModalOpen(true)}
            disabled={!userId}
            title={!userId ? 'Log in to request a feature' : ''}
          >
            <Plus className="w-4 h-4" /> Request a feature for {activePlatform?.name}
          </button>
        </div>

        {/* Latest Version Highlight */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between border-4 border-green-300 animate-pop">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
                {activePlatform?.icon}
                <Rocket className="w-8 h-8 text-white animate-bounce" />
                {latestVersion.version} <span className="text-green-200 text-lg font-bold ml-3">({latestVersion.date})</span>
              </div>
              <div className="text-lg text-white font-semibold">{latestVersion.details}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
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
              <div className="text-xs text-gray-400 mt-2">Latest: {latestVersion.version} ({latestVersion.date})</div>
            </CardContent>
          </Card>
        </div>

        {/* Changelog/Version Control */}
        <div className="bg-gray-900 border border-gray-700 rounded p-6 text-sm text-gray-300 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            {activePlatform?.icon}
            {activePlatform?.name} Changelog
          </h2>
          {changelog.slice(1).map(entry => (
            <div key={entry.version} className="mb-2">
              <span className={`font-bold ${entry.version.includes('v1.') ? 'text-green-400' : 'text-blue-400'}`}>{entry.version}</span> ({entry.date}): {entry.details}
            </div>
          ))}
        </div>

        {/* Feature Request Modal */}
        {featureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                {activePlatform?.icon}
                Request a Feature for {activePlatform?.name}
              </h3>
              <form onSubmit={handleFeatureSubmit}>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-900"
                  placeholder="Feature title (required)"
                  value={featureTitle}
                  onChange={e => setFeatureTitle(e.target.value)}
                  required
                  disabled={submitting}
                />
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-gray-900"
                  placeholder="Description (optional)"
                  value={featureDesc}
                  onChange={e => setFeatureDesc(e.target.value)}
                  rows={3}
                  disabled={submitting}
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setFeatureModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" disabled={submitting}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-white font-bold hover:bg-orange-600" disabled={submitting || !featureTitle.trim()}>Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Feature Requests List */}
        {loading ? (
          <div className="text-white text-center py-12"><Loader className="animate-spin inline-block mr-2" /> Loading feature requests...</div>
        ) : platformFeatureRequests.length > 0 && (
          <section className="mt-12" id="feature-requests">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              {activePlatform?.icon}
              {activePlatform?.name} Feature Requests (Vote!)
            </h2>
            <ul className="space-y-4">
              {platformFeatureRequests.map((req) => {
                const { up, down } = getVoteCounts(req.id);
                const userVote = getUserVote(req.id);
                return (
                  <li key={req.id} className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold text-white text-lg mb-1">{req.title}</div>
                      {req.description && <div className="text-gray-300 text-sm mb-2">{req.description}</div>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                      <button
                        className={`flex items-center gap-1 px-3 py-1 rounded font-bold ${userVote === 1 ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                        onClick={() => handleVote(req.id, 1)}
                        aria-label="Thumbs up"
                        disabled={voteLoading === req.id + 1}
                      >
                        <ThumbsUp className="w-4 h-4" /> {up}
                      </button>
                      <button
                        className={`flex items-center gap-1 px-3 py-1 rounded font-bold ${userVote === -1 ? 'bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                        onClick={() => handleVote(req.id, -1)}
                        aria-label="Thumbs down"
                        disabled={voteLoading === req.id + -1}
                      >
                        <ThumbsDown className="w-4 h-4" /> {down}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {/* Back to Top Button */}
            <div className="flex justify-center mt-10">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full shadow-lg transition text-lg"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
              >
                ↑ Back to Top
              </button>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
} 