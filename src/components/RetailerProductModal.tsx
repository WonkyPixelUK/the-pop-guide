import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import React from "react";

interface RetailerProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSubmit?: (values: any) => void;
  loading?: boolean;
}

const RetailerProductModal = ({ open, onOpenChange, initialData, onSubmit, loading }: RetailerProductModalProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [image, setImage] = useState(initialData?.image_url || initialData?.image || "");
  const [isDeal, setIsDeal] = useState(initialData?.is_deal || false);
  const [isIncoming, setIsIncoming] = useState(initialData?.is_incoming || false);

  // Reset form when initialData changes
  React.useEffect(() => {
    setName(initialData?.name || "");
    setPrice(initialData?.price || "");
    setImage(initialData?.image_url || initialData?.image || "");
    setIsDeal(initialData?.is_deal || false);
    setIsIncoming(initialData?.is_incoming || false);
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        name,
        price: parseFloat(price),
        image_url: image,
        is_deal: isDeal,
        is_incoming: isIncoming,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{initialData ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. Batman #01"
              required
            />
          </div>
          <div>
            <Label htmlFor="productPrice">Price (£)</Label>
            <Input
              id="productPrice"
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. 14.99"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="productImage">Image URL</Label>
            <Input
              id="productImage"
              value={image}
              onChange={e => setImage(e.target.value)}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. https://..."
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <Switch id="isDeal" checked={isDeal} onCheckedChange={setIsDeal} />
            <Label htmlFor="isDeal">Deal</Label>
            <Switch id="isIncoming" checked={isIncoming} onCheckedChange={setIsIncoming} />
            <Label htmlFor="isIncoming">Incoming</Label>
          </div>
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Save Changes" : "Add Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RetailerProductModal; 