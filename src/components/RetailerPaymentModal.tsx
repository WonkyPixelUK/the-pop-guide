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
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  // Get retailer from dashboard context or props if needed
  // For now, fetch from URL slug
  const slug = window.location.pathname.split("/").pop() || "";
  const { data: retailer } = useRetailer(slug);

  const SUPABASE_FUNCTION_URL = "https://pafgjwmgueerxdxtneyg.functions.supabase.co/stripe-checkout-open";

  const handleCheckout = async () => {
    if (!user || !retailer) return;
    setLoading(true);
    try {
      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
                className={`flex-1 ${selectedPlan === "monthly" ? "bg-orange-500" : "bg-gray-800"}`}
                onClick={() => setSelectedPlan("monthly")}
                type="button"
                disabled={loading}
              >
                Monthly (£49.99)
              </Button>
              <Button
                className={`flex-1 ${selectedPlan === "yearly" ? "bg-orange-500" : "bg-gray-800"}`}
                onClick={() => setSelectedPlan("yearly")}
                type="button"
                disabled={loading}
              >
                Yearly (£499.99)
              </Button>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded text-sm text-gray-300">
            <p>Get featured in the public directory, add unlimited products, deals, and Whatnot shows. Cancel anytime.</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Priority placement in directory</li>
              <li>Retailer badge</li>
              <li>Analytics dashboard</li>
              <li>Deal alerts to followers</li>
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