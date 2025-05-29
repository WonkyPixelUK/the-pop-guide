import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import ProfileSettings from "./pages/ProfileSettings";
import ScrapingStatus from "./pages/ScrapingStatus";
import PublicListView from "./pages/PublicListView";
import BrowseLists from "./pages/BrowseLists";
import NotFound from "./pages/NotFound";
import Help from "./pages/Help";
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import Ios from "./pages/Ios";
import Android from "./pages/Android";
import Api from "./pages/Api";
import SearchPage from "./pages/Search";
import Directory from "./pages/Directory";
import DirectoryAll from "./pages/DirectoryAll";
import RecentlyAdded from "./pages/RecentlyAdded";
import RetailerProfile from "./pages/retailers/[slug]";
import GetStarted from "./pages/get-started";
import SystemStatus from './pages/SystemStatus';
import HowItWorks from './pages/HowItWorks';
import Faq from './pages/Faq';
import LogTicket from './pages/LogTicket';
import MobileBottomNav from './components/MobileBottomNav';
import BecomeRetailer from "./pages/retailers/become";
import RetailerDashboard from "./pages/RetailerDashboard";
import StickerGuide from "./pages/StickerGuide";
import Privacy from "./pages/Privacy";
import CookiePolicy from "./pages/CookiePolicy";
import Legal from "./pages/Legal";
import Blog from "./pages/Blog";
import PublicPopView from "./pages/PublicPopView";
import Members from "./pages/Members";
import AuthSuccess from "./pages/auth/success";
import AuthDeclined from "./pages/auth/declined";
import ChromeExtension from "./pages/ChromeExtension";
import Roadmap from "./pages/roadmap";
import ShoppersAdvice from "./pages/ShoppersAdvice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <Analytics />
      <SpeedInsights />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/scraping-status" element={<ScrapingStatus />} />
            <Route path="/lists/:listId" element={<PublicListView />} />
            <Route path="/browse-lists" element={<BrowseLists />} />
            <Route path="/help" element={<Help />} />
            <Route path="/ios" element={<Ios />} />
            <Route path="/android" element={<Android />} />
            <Route path="/api" element={<Api />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/directory-all" element={<DirectoryAll />} />
            <Route path="/recently-added" element={<RecentlyAdded />} />
            <Route path="/retailers/become" element={<BecomeRetailer />} />
            <Route path="/retailers/dashboard" element={<RetailerDashboard />} />
            <Route path="/retailers/:slug" element={<RetailerProfile />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/howitworks" element={<HowItWorks />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/log-ticket" element={<LogTicket />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/cookie-policy" element={<CookiePolicy/>} />
            <Route path="/system-status" element={<SystemStatus />} />
            <Route path="/blog" element={<Blog/>} />
            <Route path="/chrome-extension" element={<ChromeExtension />} />
            <Route path="/sticker-guide" element={<StickerGuide />} />
            <Route path="/pop/:id" element={<PublicPopView />} />
            <Route path="/members" element={<Members />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/declined" element={<AuthDeclined />} />
            <Route path="/shoppers-advice" element={<ShoppersAdvice />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileBottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
