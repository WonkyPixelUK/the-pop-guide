import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface RetailerShowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

const RetailerShowModal = ({ open, onOpenChange, initialData }: RetailerShowModalProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [showUrl, setShowUrl] = useState(initialData?.show_url || "");
  const [showTime, setShowTime] = useState(initialData?.show_time || "");
  const [description, setDescription] = useState(initialData?.description || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{initialData ? "Edit Show" : "Add Show"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="showTitle">Show Title</Label>
            <Input
              id="showTitle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. Whatnot Live: DC Drops"
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
            />
          </div>
          <Button className="w-full bg-orange-500 hover:bg-orange-600">{initialData ? "Save Changes" : "Add Show"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RetailerShowModal; 