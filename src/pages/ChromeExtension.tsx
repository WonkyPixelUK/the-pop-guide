import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Puzzle, Camera, Wand2, List, Globe, Zap } from 'lucide-react';

const ChromeExtension = () => (
  <>
    <SEO title="Chrome Extension | The Pop Guide" description="Add Funko Pops to your collection from any website using screenshots. Learn how to install the Chrome extension." />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto py-16 px-4 max-w-2xl">
        <div className="text-center mb-10">
          <Puzzle className="w-20 h-20 text-orange-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-white mb-4">PopGuide Chrome Extension</h1>
          <p className="text-gray-300 mb-6 text-lg">
            The PopGuide Chrome Extension lets you add Funko Pops to your collection from any website in seconds. Just click the extension, take a screenshot, and it will read the Pop's name and details for you—no manual typing needed. Perfect for quickly logging new finds, wishlist items, or deals you spot online.
          </p>
        </div>
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-orange-400 mb-4">What Can the Chrome Extension Do?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="flex items-start gap-4">
              <Camera className="w-8 h-8 text-orange-400 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Screenshot to Pop</h3>
                <p className="text-gray-300 text-sm">Take a screenshot of any Pop on any website—no copy-pasting or manual entry required.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Wand2 className="w-8 h-8 text-orange-400 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Auto-Fills Details</h3>
                <p className="text-gray-300 text-sm">The extension reads the Pop's name, price, and more from your screenshot and fills in the details for you.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <List className="w-8 h-8 text-orange-400 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Add to Any List</h3>
                <p className="text-gray-300 text-sm">Choose to add Pops to your main collection, wishlist, or any custom list you've created.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Globe className="w-8 h-8 text-orange-400 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Works on Any Site</h3>
                <p className="text-gray-300 text-sm">Use it on retailer sites, eBay, Facebook groups, or anywhere you find Pops online.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Zap className="w-8 h-8 text-orange-400 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">Fast & Private</h3>
                <p className="text-gray-300 text-sm">Everything happens in your browser—no data is sent anywhere except your PopGuide account.</p>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-orange-400 mb-4">How to Install (Manual Method)</h2>
          <ol className="list-decimal pl-6 text-gray-200 space-y-2 mb-4 text-base">
            <li>
              <a href="/chrome-extension.zip" className="text-orange-400 underline font-semibold" download>
                Download the extension ZIP file
              </a> and extract it to a folder on your computer.
            </li>
            <li>Open <span className="text-orange-400">chrome://extensions</span> in your Chrome browser.</li>
            <li>Enable <span className="font-semibold">Developer mode</span> (toggle in the top right).</li>
            <li>Click <span className="font-semibold">Load unpacked</span> and select the extracted folder.</li>
            <li>The PopGuide extension will appear in your browser. Click the icon to get started!</li>
          </ol>
          <div className="text-gray-400 text-sm mb-2">While we await Chrome Store approval, you can use this manual install method. Updates will be posted here.</div>
        </div>
      </div>
      <Footer />
    </div>
  </>
);

export default ChromeExtension; 