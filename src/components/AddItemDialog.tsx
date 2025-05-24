
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Scan, Upload } from "lucide-react";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddItemDialog = ({ open, onOpenChange }: AddItemDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const mockSearchResults = [
    {
      id: 1,
      name: "Iron Man",
      series: "Marvel",
      number: "04",
      image: "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: 18.99
    },
    {
      id: 2,
      name: "Wonder Woman",
      series: "DC Comics",
      number: "172",
      image: "/lovable-uploads/b7333c96-5576-426d-af76-6a6a97e8a1ea.png",
      value: 14.50
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add to Collection</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="search" className="data-[state=active]:bg-orange-500">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="scan" className="data-[state=active]:bg-orange-500">
              <Scan className="w-4 h-4 mr-2" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-orange-500">
              <Upload className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Funko Pop Database</Label>
              <Input
                id="search"
                placeholder="Enter name, series, or item number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockSearchResults.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.series} #{item.number}</p>
                  </div>
                  <div className="text-orange-500 font-semibold">
                    ${item.value}
                  </div>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <div className="text-center py-8">
              <Scan className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Barcode Scanner</h3>
              <p className="text-gray-400 mb-4">
                Scan the barcode on your Funko Pop box to quickly add it to your collection.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Scan className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Spider-Man"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="series">Series</Label>
                <Input
                  id="series"
                  placeholder="e.g., Marvel"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Item Number</Label>
                <Input
                  id="number"
                  placeholder="e.g., 593"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rarity">Rarity</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select rarity" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="chase">Chase</SelectItem>
                    <SelectItem value="exclusive">Exclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Add to Collection
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
