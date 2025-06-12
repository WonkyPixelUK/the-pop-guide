import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useRetailer } from '@/hooks/useRetailer';

interface RetailerPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RetailerPaymentModal = ({ open, onOpenChange }: RetailerPaymentModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  // Get retailer from dashboard context or props if needed
  // For now, fetch from URL slug
  const slug = window.location.pathname.split("/").pop() || "";
  const { data: retailer } = useRetailer(slug);

  const SUPABASE_FUNCTION_URL = "https://db.popguide.co.uk/functions/v1/stripe-checkout-public";

  const handleCheckout = async () => {
    if (!user || !retailer) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user && user.access_token) {
        headers['Authorization'] = `Bearer ${user.access_token}`;
      }
      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Could not start checkout');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Pay for Directory Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Choose Plan</Label>
            <div className="flex gap-4">
              <Button
                className={`flex-1 ${selectedPlan === "free" ? "bg-orange-500" : "bg-gray-800"}`}
                onClick={() => setSelectedPlan("free")}
                type="button"
                disabled={loading}
              >
                Free Plan
              </Button>
              <Button
                className={`flex-1 ${selectedPlan === "yearly" ? "bg-orange-500" : "bg-gray-800"}`}
                onClick={() => setSelectedPlan("yearly")}
                type="button"
                disabled={loading}
              >
                Professional (£30/year)
              </Button>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded text-sm text-gray-300">
            <p>Get featured in the public directory, add unlimited Funko Pop listings, and notify customers when you have new stock.</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Priority placement in directory</li>
              <li>Verified retailer badge</li>
              <li>Unlimited Funko Pop listings</li>
              <li>Automatic wishlist notifications</li>
              <li>New stock alerts to customers</li>
              <li>Analytics dashboard</li>
            </ul>
          </div>
          <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleCheckout} disabled={loading || !user || !retailer}>
            {loading ? 'Redirecting...' : 'Proceed to Payment (Stripe)'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RetailerPaymentModal; 