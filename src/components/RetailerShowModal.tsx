import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface RetailerShowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSubmit?: (values: any) => void;
  loading?: boolean;
}

const RetailerShowModal = ({ open, onOpenChange, initialData, onSubmit, loading }: RetailerShowModalProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [showTime, setShowTime] = useState(initialData?.show_time ? initialData.show_time.slice(0, 16) : "");
  const [showUrl, setShowUrl] = useState(initialData?.show_url || "");
  const [description, setDescription] = useState(initialData?.description || "");

  // Reset form when initialData changes
  useEffect(() => {
    setTitle(initialData?.title || "");
    setShowTime(initialData?.show_time ? initialData.show_time.slice(0, 16) : "");
    setShowUrl(initialData?.show_url || "");
    setDescription(initialData?.description || "");
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        title,
        show_time: showTime,
        show_url: showUrl,
        description,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{initialData ? "Edit Show" : "Add Show"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="showTitle">Show Title</Label>
            <Input
              id="showTitle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. Whatnot Live: DC Drops"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="showTime">Show Time</Label>
            <Input
              id="showTime"
              type="datetime-local"
              value={showTime}
              onChange={e => setShowTime(e.target.value)}
              className="bg-gray-800 border-gray-700"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="showUrl">Show URL</Label>
            <Input
              id="showUrl"
              value={showUrl}
              onChange={e => setShowUrl(e.target.value)}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. https://whatnot.com/show/123"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="showDescription">Description</Label>
            <Input
              id="showDescription"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. Special DC Comics drop and giveaways!"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
            {loading ? 'Saving...' : (initialData ? 'Update Show' : 'Add Show')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RetailerShowModal; 