
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, List, Eye, EyeOff } from "lucide-react";
import { useCustomLists } from "@/hooks/useCustomLists";

const CustomListsManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const { lists, isLoading, createList } = useCustomLists();

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    try {
      await createList.mutateAsync({
        name: newListName,
        description: newListDescription,
        isPublic,
      });
      
      setNewListName("");
      setNewListDescription("");
      setIsPublic(false);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading lists...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Custom Lists</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Create List
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="listName">List Name</Label>
                <Input
                  id="listName"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Chase Variants, Marvel Heroes"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="listDescription">Description (Optional)</Label>
                <Textarea
                  id="listDescription"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Describe what this list is for..."
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="isPublic">Make this list public</Label>
              </div>
              <Button 
                onClick={handleCreateList}
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={!newListName.trim()}
              >
                Create List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <Card key={list.id} className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <List className="w-5 h-5" />
                  <span>{list.name}</span>
                </div>
                {list.is_public ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {list.description && (
                <p className="text-gray-400 text-sm mb-3">{list.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">
                  {list.list_items?.length || 0} items
                </span>
                <Button variant="outline" size="sm" className="border-gray-600">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lists.length === 0 && (
        <Card className="bg-gray-800/30 border-gray-700">
          <CardContent className="text-center py-8">
            <List className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Custom Lists Yet</h3>
            <p className="text-gray-400 mb-4">
              Create custom lists to organize your collection by themes, series, or any way you like.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomListsManager;
