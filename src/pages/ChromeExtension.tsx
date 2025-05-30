import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Puzzle, 
  Download, 
  Star, 
  Camera, 
  Wand2, 
  List, 
  Globe, 
  Zap,
  CheckCircle,
  Eye,
  Share2,
  Shield,
  Monitor,
  Chrome,
  Scan
} from 'lucide-react';

const ChromeExtension = () => {
  const appVersion = "1.0.0";
  const extensionFeatures = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Screenshot to Pop",
      description: "Take a screenshot of any Funko Pop on any website—no copy-pasting or manual entry required"
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: "Auto-Fill Details",
      description: "AI reads the Pop's name, price, and details from your screenshot and fills everything automatically"
    },
    {
      icon: <List className="w-6 h-6" />,
      title: "Add to Any List",
      description: "Choose to add Pops to your main collection, wishlist, or any custom list you've created"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Works Everywhere",
      description: "Use it on retailer sites, eBay, Facebook groups, or anywhere you find Pops online"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Add Pops to your collection in seconds with just one click and a screenshot"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Everything happens in your browser—no data is sent anywhere except your PopGuide account"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Smart Recognition",
      description: "Advanced AI can identify Pop names, numbers, exclusives, and variant details"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Instant Sync",
      description: "Screenshots sync instantly with your PopGuide account across all devices"
    }
  ];

  const compatibilityFeatures = [
    "Chrome 88 and newer",
    "Chromium-based browsers",
    "Microsoft Edge (Chromium)",
    "Brave Browser",
    "Opera Browser",
    "Works on all websites",
    "Screenshot permissions",
    "PopGuide account required",
    "Instant cloud sync",
    "Auto-updates enabled"
  ];

  return (
    <>
      <SEO 
        title="Chrome Extension | The Pop Guide" 
        description="Add Funko Pops to your collection from any website using screenshots. The ultimate Chrome extension for Funko Pop collectors." 
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="flex justify-center gap-4 mb-8">
              <div className="relative">
                <Puzzle className="w-20 h-20 text-orange-500 animate-pulse" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="relative">
                <Chrome className="w-20 h-20 text-orange-500" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              PopGuide <span className="text-orange-500">Chrome Extension</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Add Funko Pops to your collection from any website in seconds. Take a screenshot and let AI fill in all the details automatically—no typing required!
            </p>
            
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href="/chrome-extension.zip" download>
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-lg">
                  <Download className="w-6 h-6 mr-2" />
                  Download Extension
                </Button>
              </a>
              <Button 
                variant="outline" 
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 text-lg"
                onClick={() => window.open('chrome://extensions', '_blank')}
              >
                <Chrome className="w-5 h-5 mr-2" />
                Open Chrome Extensions
              </Button>
            </div>

            {/* Version Info */}
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 text-gray-300">
              <Star className="w-4 h-4 text-orange-500" />
              <span>Version {appVersion} • Manual Install Available</span>
            </div>
          </div>
        </section>

        {/* Browser Compatibility Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Browser Compatibility
              </h2>
              <p className="text-gray-300 text-xl">
                Works seamlessly with Chrome and all Chromium-based browsers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chrome & Chromium */}
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                      <Chrome className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Chrome & Chromium</h3>
                      <p className="text-gray-400">Full feature support</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {compatibilityFeatures.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Other Browsers */}
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                      <Monitor className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Advanced Features</h3>
                      <p className="text-gray-400">Enhanced functionality and privacy</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {compatibilityFeatures.slice(5).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-gray-300 text-xl">
                Everything you need to collect Funkos from any website
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {extensionFeatures.map((feature, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-500 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Installation Guide Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Easy Installation
              </h2>
              <p className="text-gray-300 text-xl">
                Manual installation while we await Chrome Web Store approval
              </p>
            </div>

            <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Manual Installation Guide</h3>
                </div>
                <ol className="list-decimal pl-6 text-gray-300 space-y-4 mb-8">
                  <li>
                    <a href="/chrome-extension.zip" className="text-orange-400 underline font-semibold" download>
                      Download the extension ZIP file
                    </a> and extract it to a folder on your computer
                  </li>
                  <li>Open <span className="text-orange-400 font-semibold">"chrome://extensions"</span> in your Chrome browser</li>
                  <li>Enable <span className="font-semibold text-white">"Developer mode"</span> using the toggle in the top right corner</li>
                  <li>Click <span className="font-semibold text-white">"Load unpacked"</span> and select the extracted folder</li>
                  <li>The PopGuide extension will appear in your browser toolbar—click the icon to get started!</li>
                </ol>
                
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
                  <p className="text-orange-400 text-sm">
                    <strong>Note:</strong> This manual installation method is temporary while we await Chrome Web Store approval. Updates will be posted here.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/chrome-extension.zip" download className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                      <Download className="w-4 h-4 mr-2" />
                      Download Extension
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                    onClick={() => window.open('chrome://extensions', '_blank')}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Open Extensions Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Screenshots Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                See It In Action
              </h2>
              <p className="text-gray-300 text-xl">
                From screenshot to collection in seconds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Take Screenshot</h3>
                  <p className="text-gray-400 text-sm">Click the extension and capture any Funko Pop from any website</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center">
                    <Wand2 className="w-16 h-16 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI Recognition</h3>
                  <p className="text-gray-400 text-sm">Advanced AI reads and fills in all the Pop details automatically</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center">
                    <List className="w-16 h-16 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Add to Collection</h3>
                  <p className="text-gray-400 text-sm">Choose your collection or wishlist and the Pop is instantly added</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Supercharge Your Collecting?
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Download the PopGuide Chrome Extension and start adding Pops from any website in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/chrome-extension.zip" download>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download Extension
                  </Button>
                </a>
                <a 
                  href="https://pop-gude.expo.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 text-lg">
                    <Globe className="w-5 h-5 mr-2" />
                    Try Web Version
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

      <Footer />
    </div>
  </>
  );
};

export default ChromeExtension;