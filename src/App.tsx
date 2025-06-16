import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import PricingNew from "./pages/PricingNew";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import ProfileSettings from "@/pages/ProfileSettings";
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
import Search from "@/pages/Search";
import Directory from "./pages/Directory";
import DirectoryAll from "./pages/DirectoryAll";
import NewReleases from "./pages/NewReleases";
import RecentlyAdded from "./pages/RecentlyAdded";
import RetailerProfile from "./pages/retailers/[slug]";
import GetStarted from "./pages/get-started";
import SystemStatus from './pages/SystemStatus';
import HowItWorks from './pages/HowItWorks';
import Faq from './pages/Faq';
import LogTicket from './pages/LogTicket';
import MobileBottomNav from './components/MobileBottomNav';
import BecomeRetailer from "./pages/BecomeRetailer";
import RetailerDashboard from "./pages/RetailerDashboard";
import WhereToBuy from "./pages/WhereToBuy";
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
import ComingSoon from "./pages/ComingSoon";
import LatestDeals from "./pages/LatestDeals";
import TimeMachine from "./pages/TimeMachine";
import GrailGalaxyLanding from "@/pages/GrailGalaxyLanding";
import GrailGalaxyWorld from "@/pages/GrailGalaxyWorld";
import TimeMachineFeature from "./pages/features/TimeMachineFeature";
import GrailGalaxyFeature from "./pages/features/GrailGalaxyFeature";
import RetailerDirectory from "@/pages/RetailerDirectory";
import RetailerSignup from "@/pages/RetailerSignup";
import RetailerPendingApproval from "@/pages/RetailerPendingApproval";
import WhyAddYourBusiness from "@/pages/retailers/WhyAddYourBusiness";
import Export from "@/pages/Export";
import PricingDashboard from "@/pages/PricingDashboard";
import BugTracker from "./pages/BugTracker";
import DatabaseSetup from "./pages/DatabaseSetup";
import FunkoExclusives from "./pages/FunkoExclusives";
import SystemErrorReport from "./pages/SystemErrorReport";
import TestEnhancedCollection from "./pages/TestEnhancedCollection";
import DebugList from './pages/DebugList';
import SupportCenter from './components/SupportCenter';
import EbayApiTest from './components/EbayApiTest';
import EbayPriceAnalyzer from './components/EbayPriceAnalyzer';
import LivePricing from "@/pages/LivePricing";
import GenreIndex from './pages/GenreIndex';
import GenrePage from './pages/GenrePage';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import DatabaseLanding from "./pages/Database";
import StatusGroupPage from './pages/Status';
import CategoryGroupPage from './pages/Category';
import FandomGroupPage from './pages/Fandom';
import EditionGroupPage from './pages/Edition';
import CharacterGroupPage from './pages/Character';
import SeriesGroupPage from './pages/Series';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const queryClient = new QueryClient();

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <Analytics debug={false} />
      <SpeedInsights debug={false} />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/features" element={<Features />} />
            <Route path="/features/time-machine" element={<TimeMachineFeature />} />
            <Route path="/features/grail-galaxy" element={<GrailGalaxyFeature />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/pricing-new" element={<PricingNew />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/scraping-status" element={<ScrapingStatus />} />
            <Route path="/lists/:listId" element={<PublicListView />} />
            <Route path="/browse-lists" element={<BrowseLists />} />
            <Route path="/help" element={<Help />} />
            <Route path="/bug-tracker" element={<BugTracker />} />
            <Route path="/database-setup" element={<DatabaseSetup />} />
            <Route path="/ios" element={<Ios />} />
            <Route path="/android" element={<Android />} />
            <Route path="/api" element={<Api />} />
            <Route path="/search" element={<Search />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/database/all" element={<DirectoryAll />} />
            <Route path="/new-releases" element={<NewReleases />} />
            <Route path="/recently-added" element={<RecentlyAdded />} />
            <Route path="/retailers/become" element={<BecomeRetailer />} />
            <Route path="/retailers/why-add-your-business" element={<WhyAddYourBusiness />} />
            <Route path="/retailers/signup" element={<RetailerSignup />} />
            <Route path="/retailer/pending-approval" element={<RetailerPendingApproval />} />
            <Route path="/become-retailer" element={<BecomeRetailer />} />
            <Route path="/retailers/dashboard" element={<RetailerDashboard />} />
            <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
            <Route path="/retailers/:slug" element={<RetailerProfile />} />
            <Route path="/where-to-buy/:popId" element={<WhereToBuy />} />
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
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/funko-exclusives" element={<FunkoExclusives />} />
            <Route path="/deals" element={<LatestDeals />} />
            <Route path="/time-machine" element={<TimeMachine />} />
            <Route path="/grail-galaxy" element={<GrailGalaxyLanding />} />
            <Route path="/grail-galaxy/world" element={<GrailGalaxyWorld />} />
            <Route path="/retailers" element={<RetailerDirectory />} />
            <Route path="/export" element={<Export />} />
            <Route path="/pricing-dashboard" element={<PricingDashboard />} />
            <Route path="/system-error-report" element={<SystemErrorReport />} />
            <Route path="/test-enhanced-collection" element={<TestEnhancedCollection />} />
            <Route path="/debug-list/:id?" element={<DebugList />} />
            <Route path="/support" element={<SupportCenter />} />
            <Route path="/ebay-test" element={<EbayApiTest />} />
            <Route path="/ebay-analyzer" element={<EbayPriceAnalyzer />} />
            <Route path="/price-analyzer" element={<EbayPriceAnalyzer />} />
            <Route path="/auth/ebay/callback" element={<EbayPriceAnalyzer />} />
            <Route path="/live-pricing" element={<LivePricing />} />
            <Route path="/genre" element={<GenreIndex />} />
            <Route path="/genre/:genre" element={<GenrePage />} />
            <Route path="/database" element={<DatabaseLanding />} />
            <Route path="/database/genres" element={<GenreIndex />} />
            <Route path="/database/genres/:genre" element={<GenrePage />} />
            <Route path="/database/status" element={<StatusGroupPage />} />
            <Route path="/database/category" element={<CategoryGroupPage />} />
            <Route path="/database/fandom" element={<FandomGroupPage />} />
            <Route path="/database/edition" element={<EditionGroupPage />} />
            <Route path="/database/character" element={<CharacterGroupPage />} />
            <Route path="/database/series" element={<SeriesGroupPage />} />
            <Route path="/database/funko-exclusives" element={<FunkoExclusives />} />
            <Route path="/database/coming-soon" element={<ComingSoon />} />
            <Route path="/database/new-releases" element={<NewReleases />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<div>Users Management</div>} />
              <Route path="subscriptions" element={<div>Subscriptions Management</div>} />
              <Route path="staff" element={<div>Staff Management</div>} />
              <Route path="funko-pops" element={<div>Funko Pops Management</div>} />
              <Route path="retailers" element={<div>Retailers Management</div>} />
              <Route path="members" element={<div>Members Management</div>} />
              <Route path="email-templates" element={<div>Email Templates Management</div>} />
            </Route>

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
