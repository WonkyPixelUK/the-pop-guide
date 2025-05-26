import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const GetStarted = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
    <h1 className="text-3xl font-bold mb-8">Choose your plan to get started</h1>
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <Link to="/auth?plan=free">
        <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">Continue with Free</Button>
      </Link>
      <Link to="/auth?plan=pro">
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Upgrade to Pro</Button>
      </Link>
    </div>
  </div>
);

export default GetStarted; 