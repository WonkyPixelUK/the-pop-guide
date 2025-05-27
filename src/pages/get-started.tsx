import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const GetStarted = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
    <img 
      src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" 
      alt="PopGuide Logo" 
      className="mb-8 w-24 h-24 mx-auto"
    />
    <h1 className="text-3xl font-bold mb-8">Get started with your 3-day free trial</h1>
    <div className="bg-gray-900/90 border border-orange-500 rounded-lg px-6 py-4 text-center shadow-lg mb-8">
      <div className="text-orange-500 font-bold text-lg mb-1">Pro Membership</div>
      <div className="text-white text-xl font-bold mb-1">$3.99/mo</div>
      <div className="text-gray-300 mb-1">3-day free trial. Cancel anytime.</div>
      <div className="text-gray-400 text-sm">Unlock unlimited items, analytics, and more.</div>
    </div>
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <Link to="/auth">
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Start Now</Button>
      </Link>
    </div>
  </div>
);

export default GetStarted; 