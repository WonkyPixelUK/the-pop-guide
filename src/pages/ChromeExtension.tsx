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
  Scan,
  Database,
  Lock,
  Search,
  MousePointer,
  Layers,
  RefreshCw,
  Sparkles,
  FileText
} from 'lucide-react';

const ChromeExtension = () => {
  const appVersion = "1.0.0";
  const extensionFeatures = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Area Selection Capture",
      description: "Advanced screenshot tool with drag-to-select area capture and instant OCR processing"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Real Supabase Integration",
      description: "Connects directly to your PopGuide database with full authentication and real-time sync"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Database Search",
      description: "Intelligent search by name, series, number, or EAN with fuzzy matching and auto-complete"
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: "AI OCR Auto-Fill",
      description: "Tesseract.js powered OCR reads Pop names, prices, EANs and auto-fills forms instantly"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Authentication",
      description: "Real PopGuide account login with token-based authentication and secure API calls"
    },
    {
      icon: <List className="w-6 h-6" />,
      title: "Full List Management",
      description: "Add to owned, wishlist, for-sale, trading lists plus create and manage custom lists"
    },
    {
      icon: <MousePointer className="w-6 h-6" />,
      title: "Manual Entry Mode",
      description: "Type-to-search with instant database lookup and smart auto-suggestions"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Intelligent Detection",
      description: "Context-aware list selection based on price, exclusivity, and Pop characteristics"
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Real-Time Sync",
      description: "Instant synchronization with PopGuide cloud database across all your devices"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy & Security",
      description: "Local processing with encrypted API calls - your data stays secure and private"
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Multi-Strategy Search",
      description: "Advanced search algorithms try multiple methods to find exact matches in database"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Professional UI",
      description: "Beautiful PopGuide-branded interface with modern design and intuitive workflow"
    }
  ];

  const compatibilityFeatures = [
    "Chrome 88 and newer",
    "Real Supabase database integration",
    "Secure PopGuide authentication",
    "Bundled Tesseract.js OCR (66KB)",
    "Area selection screenshot capture",
    "Microsoft Edge (Chromium)",
    "Brave Browser",
    "Opera Browser",
    "Works on all websites",
    "Professional PopGuide branding",
    "Instant cloud sync",
    "Auto-updates enabled"
  ];

  return (
    <>
      <SEO 
        title="Chrome Extension V1.0 | The Pop Guide" 
        description="Professional Chrome extension with Supabase integration, OCR, and smart database search. Add Funko Pops from any website with AI-powered recognition." 
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navigation />
        
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="flex justify-center gap-4 mb-8">
              <div className="relative">
                <Puzzle className="w-20 h-20 text-orange-400 animate-pulse" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="relative">
                <Chrome className="w-20 h-20 text-orange-400" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              PopGuide <span className="text-orange-400">Chrome Extension</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Professional Chrome extension with real Supabase integration, AI-powered OCR, and smart database search. Add Funko Pops from any website with advanced screenshot capture and intelligent recognition.
            </p>
            
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/chrome-extension/PopGuide-Chrome-Extension-v1.0.zip" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 text-lg">
                  <Download className="w-6 h-6 mr-2" />
                  Download V1.0 Extension
                </Button>
              </a>
              <Button 
                variant="outline" 
                className="border-orange-400 text-orange-400 hover:bg-orange-500 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 text-lg bg-gray-900/50"
                onClick={() => window.open('chrome://extensions', '_blank')}
              >
                <Chrome className="w-5 h-5 mr-2" />
                Open Chrome Extensions
              </Button>
            </div>

            {/* Version Info */}
            <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-600/50 rounded-full px-4 py-2 text-green-200">
              <Star className="w-4 h-4 text-green-400" />
              <span>Version {appVersion} • Full Supabase Integration • Production Ready</span>
            </div>
          </div>
        </section>

        {/* Key Features Highlight */}
        <section className="py-16 px-4 bg-gray-900/40">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                V1.0 Professional Features
              </h2>
              <p className="text-gray-200 text-xl">
                Full production release with enterprise-grade functionality
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-500/30 hover:bg-purple-900/50 transition-all duration-300 hover:border-purple-400/50">
                <CardContent className="p-8 text-center">
                  <Database className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Real Database Integration</h3>
                  <p className="text-blue-800">Direct Supabase connection with your PopGuide account - no fake APIs or placeholders</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 border-orange-500/30 hover:bg-orange-900/50 transition-all duration-300 hover:border-orange-400/50">
                <CardContent className="p-8 text-center">
                  <Scan className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Advanced OCR Engine</h3>
                  <p className="text-blue-800">Bundled Tesseract.js with area selection, progress tracking, and intelligent text extraction</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-500/30 hover:bg-green-900/50 transition-all duration-300 hover:border-green-400/50">
                <CardContent className="p-8 text-center">
                  <Search className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Smart Search Algorithm</h3>
                  <p className="text-blue-800">Multi-strategy database search with fuzzy matching, series lookup, and EAN scanning</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Browser Compatibility Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Browser Compatibility & Requirements
              </h2>
              <p className="text-gray-200 text-xl">
                Works seamlessly with Chrome and all Chromium-based browsers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chrome & Chromium */}
              <Card className="bg-gray-900/60 border-gray-600/50 hover:bg-gray-900/80 transition-all duration-300 hover:scale-105 hover:border-orange-500/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
                      <Chrome className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Core Requirements</h3>
                      <p className="text-gray-300">Essential browser support</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {compatibilityFeatures.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-200">
                        <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Advanced Features */}
              <Card className="bg-gray-900/60 border-gray-600/50 hover:bg-gray-900/80 transition-all duration-300 hover:scale-105 hover:border-purple-500/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                      <Monitor className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Professional Features</h3>
                      <p className="text-gray-300">Enterprise functionality</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {compatibilityFeatures.slice(6).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-200">
                        <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comprehensive Features Grid */}
        <section className="py-16 px-4 bg-gray-900/40">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Complete Feature Set
              </h2>
              <p className="text-gray-200 text-xl">
                Everything you need for professional Funko Pop collecting
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {extensionFeatures.map((feature, index) => (
                <Card key={index} className="bg-gray-900/60 border-gray-600/50 hover:bg-gray-900/80 transition-colors hover:border-orange-500/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 flex-shrink-0 border border-orange-500/30">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-200 text-sm">
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
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Professional Installation
              </h2>
              <p className="text-gray-200 text-xl">
                V1.0 production release - manual installation while awaiting Chrome Web Store approval
              </p>
            </div>

            <Card className="bg-gray-900/60 border-gray-600/50 hover:bg-gray-900/80 transition-all duration-300 hover:border-orange-500/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                    <Download className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">V1.0 Installation Guide</h3>
                </div>
                <ol className="list-decimal pl-6 text-gray-200 space-y-4 mb-8">
                  <li>
                    <a href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/chrome-extension/PopGuide-Chrome-Extension-v1.0.zip" className="text-orange-400 underline font-semibold hover:text-orange-300" target="_blank" rel="noopener noreferrer">
                      Download the V1.0 extension ZIP file from CDN
                    </a> and extract it to a folder on your computer
                  </li>
                  <li>Open <span className="text-orange-400 font-semibold">"chrome://extensions"</span> in your Chrome browser</li>
                  <li>Enable <span className="font-semibold text-white">"Developer mode"</span> using the toggle in the top right corner</li>
                  <li>Click <span className="font-semibold text-white">"Load unpacked"</span> and select the extracted chrome-extension folder</li>
                  <li>The PopGuide extension will appear in your browser toolbar—click the icon and login with your PopGuide account!</li>
                </ol>
                
                <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-4 mb-6">
                  <p className="text-green-200 text-sm">
                    <strong className="text-green-400">V1.0 Features:</strong> This production release includes full Supabase integration, OCR processing, smart database search, and professional PopGuide branding. All core functionality is complete and ready for use.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/chrome-extension/PopGuide-Chrome-Extension-v1.0.zip" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25">
                      <Download className="w-4 h-4 mr-2" />
                      Download V1.0 Extension
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-orange-400 text-orange-400 hover:bg-orange-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 bg-gray-900/50"
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
        <section className="py-16 px-4 bg-gray-900/40">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Professional Workflow
              </h2>
              <p className="text-gray-200 text-xl">
                From screenshot to database in seconds with enterprise-grade precision
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gray-900/60 border-gray-600/50 hover:bg-gray-900/80 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-lg mb-4 flex items-center justify-center border border-purple-500/30">
                    <div className="text-center">
                      <MousePointer className="w-16 h-16 text-purple-400 mx-auto mb-2" />
                      <p className="text-purple-300 text-sm">Area Selection Tool</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Advanced Screenshot Capture</h3>
                  <p className="text-gray-200 text-sm">Drag-to-select area capture with professional UI overlay and precision controls</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/60 border-gray-600/50 hover:bg-gray-900/80 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-lg mb-4 flex items-center justify-center border border-orange-500/30">
                    <div className="text-center">
                      <Scan className="w-16 h-16 text-orange-400 mx-auto mb-2" />
                      <p className="text-orange-300 text-sm">Tesseract.js OCR</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Recognition</h3>
                  <p className="text-gray-200 text-sm">Professional OCR with progress tracking, intelligent text extraction, and database matching</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/60 border-gray-600/50 hover:bg-gray-900/80 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-lg mb-4 flex items-center justify-center border border-green-500/30">
                    <div className="text-center">
                      <Database className="w-16 h-16 text-green-400 mx-auto mb-2" />
                      <p className="text-green-300 text-sm">Supabase Integration</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Real Database Sync</h3>
                  <p className="text-gray-200 text-sm">Direct Supabase connection with instant cloud sync and real-time collection updates</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready for Professional Funko Collecting?
              </h2>
              <p className="text-gray-200 mb-8 text-lg">
                Download the PopGuide Chrome Extension V1.0 - complete with Supabase integration, AI-powered OCR, and smart database search.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/chrome-extension/PopGuide-Chrome-Extension-v1.0.zip" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 text-lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download V1.0 Extension
                  </Button>
                </a>
                <a 
                  href="https://pop-gude.expo.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-orange-400 text-orange-400 hover:bg-orange-500 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 text-lg bg-gray-900/50">
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