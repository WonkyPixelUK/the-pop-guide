import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Code, Server } from 'lucide-react';

const Api = () => (
  <>
    <SEO title="API | The Pop Guide" description="API documentation and usage for The Pop Guide." />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto py-16 px-4 max-w-3xl">
        <div className="text-center mb-10">
          <Server className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">PopGuide API</h1>
          <p className="text-gray-300 mb-6">Access Funko Pop data, series, and user collections programmatically. All endpoints are RESTful and return JSON.</p>
        </div>
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-orange-400 mb-4">Authentication</h2>
          <p className="text-gray-200 mb-2">Most endpoints are public. For user-specific data, include your API key in the <code className="bg-gray-900 px-2 py-1 rounded text-orange-400">Authorization</code> header:</p>
          <pre className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto text-sm mb-2">Authorization: Bearer YOUR_API_KEY</pre>
        </div>
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-orange-400 mb-4">Endpoints</h2>
          <ul className="list-disc pl-6 text-gray-200 space-y-4">
            <li>
              <span className="font-semibold text-orange-400">GET /api/pops</span><br />
              <span className="text-gray-400">List all Funko Pops</span>
              <pre className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto text-sm mt-2">curl https://popguide.co.uk/api/pops</pre>
            </li>
            <li>
              <span className="font-semibold text-orange-400">GET /api/series</span><br />
              <span className="text-gray-400">List all series</span>
              <pre className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto text-sm mt-2">curl https://popguide.co.uk/api/series</pre>
            </li>
            <li>
              <span className="font-semibold text-orange-400">GET /api/user/:userId/collection</span><br />
              <span className="text-gray-400">Get a user's collection (requires API key)</span>
              <pre className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto text-sm mt-2">curl -H "Authorization: Bearer YOUR_API_KEY" https://popguide.co.uk/api/user/USER_ID/collection</pre>
            </li>
          </ul>
        </div>
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-orange-400 mb-4">Example Response</h2>
          <pre className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto text-sm mb-2">{`
{
  "id": "123",
  "name": "Darth Vader",
  "series": "Star Wars",
  "number": "01",
  "image_url": "https://...",
  "value": 25.00
}
`}</pre>
        </div>
      </div>
      <Footer />
    </div>
  </>
);

export default Api; 