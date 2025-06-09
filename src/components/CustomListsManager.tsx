import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, List, Eye, EyeOff, Settings, Trash2 } from "lucide-react";
import { useCustomLists } from "@/hooks/useCustomLists";
import ListManagementDialog from "./ListManagementDialog";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CustomListsManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [managingListId, setManagingListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [createError, setCreateError] = useState("");
  const [transferRequests, setTransferRequests] = useState([]);

  const { lists, isLoading, createList, deleteList } = useCustomLists();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('list_transfers')
      .select('*, to_user:to_user_id (email, username), list: list_id (name)')
      .eq('from_user_id', user.id)
      .eq('status', 'pending')
      .then(({ data }) => setTransferRequests(data || []));
  }, [user]);

  const validateSlug = (slug: string) => /^[a-z0-9-]+$/.test(slug);
  const checkSlugAvailability = async (slug: string) => {
    if (!validateSlug(slug)) {
      setSlugError('Only a-z, 0-9, and hyphens allowed');
      return false;
    }
    const { data } = await supabase
      .from('custom_lists')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (data) {
      setSlugError('Slug is already taken');
      return false;
    }
    setSlugError('');
    return true;
  };

  const handleCreateList = async () => {
    setCreateError("");
    if (!newListName.trim()) return;
    if (customSlug && !(await checkSlugAvailability(customSlug))) return;
    try {
      await createList.mutateAsync({
        name: newListName,
        description: newListDescription,
        isPublic,
        slug: customSlug || null,
      });
      setNewListName("");
      setNewListDescription("");
      setIsPublic(false);
      setCustomSlug("");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      setCreateError(error?.message || 'Failed to create list. Please log in and try again.');
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    if (confirm(`Are you sure you want to delete "${listName}"? This action cannot be undone.`)) {
      try {
        await deleteList.mutateAsync(listId);
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  const TransferListDialogContent = ({ list, user, toast, onSuccess }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTransfer = async () => {
      setError('');
      if (!user) {
        toast({ title: 'You must be logged in', description: 'Please log in to transfer a list.', variant: 'destructive' });
        return;
      }
      if (!input.trim()) {
        setError('Please enter a username or email.');
        return;
      }
      setLoading(true);
      try {
        const { data: recipient, error: lookupError } = await supabase
          .from('public_profiles')
          .select('user_id,username,email')
          .or(`username.eq.${input},email.eq.${input}`)
          .maybeSingle();
        if (lookupError || !recipient) {
          setError('User not found.');
          setLoading(false);
          return;
        }
        if (recipient.user_id === user.id) {
          setError('You cannot transfer a list to yourself.');
          setLoading(false);
          return;
        }
        const { error: transferError } = await supabase
          .from('list_transfers')
          .insert({
            list_id: list.id,
            from_user_id: user.id,
            to_user_id: recipient.user_id,
            status: 'pending',
          });
        if (transferError) throw transferError;
        await supabase.from('notifications').insert({
          user_id: recipient.user_id,
          type: 'list_transfer',
          message: `${user.email || 'A user'} wants to transfer the list '${list.name}' to you.`,
          data: { list_id: list.id, from_user_id: user.id },
        });
        toast({ title: 'Transfer request sent!', description: 'The user has been notified.' });
        setInput('');
        if (onSuccess) onSuccess();
      } catch (err) {
        setError(err.message || 'Failed to request transfer.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4">
        <p>Enter the username or email of the user you want to transfer this list to:</p>
        <Input placeholder="Username or email" value={input} onChange={e => setInput(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <Button className="bg-orange-500 hover:bg-orange-600 w-full" onClick={handleTransfer} disabled={loading}>{loading ? 'Sending...' : 'Send Transfer Request'}</Button>
      </div>
    );
  };

  console.log('🔍 CustomListsManager - Lists:', lists);
  console.log('🔍 CustomListsManager - Loading:', isLoading);

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
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="listDescription">Description (Optional)</Label>
                <Textarea
                  id="listDescription"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Describe what this list is for..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={(checked) => {
                      setIsPublic(checked);
                      if (checked) {
                        toast({
                          title: "🌍 Going Public!",
                          description: "Your list will be visible to the world! Time to show off those grails! 🔥",
                        });
                      } else {
                        toast({
                          title: "🔒 Back to the Vault",
                          description: "Your list is now private. Your secrets are safe with us! 🤫",
                        });
                      }
                    }}
                    className={`${
                      isPublic 
                        ? 'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500' 
                        : 'data-[state=unchecked]:bg-red-500 data-[state=unchecked]:border-red-500'
                    } transition-colors duration-200`}
                  />
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full transition-opacity duration-200 ${
                    isPublic ? 'bg-green-400 opacity-100 animate-pulse' : 'opacity-0'
                  }`} />
                </div>
                <Label htmlFor="isPublic" className="cursor-pointer">
                  <span className={`transition-colors duration-200 ${
                    isPublic ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPublic ? '🌍 Public List' : '🔒 Private List'}
                  </span>
                </Label>
              </div>
              <div>
                <Label htmlFor="customSlug">Custom URL (optional)</Label>
                <Input
                  id="customSlug"
                  value={customSlug}
                  onChange={e => setCustomSlug(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
                  onBlur={e => customSlug && checkSlugAvailability(e.target.value)}
                  placeholder="e.g. richs-funkos-for-sale-v1"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                {slugError && <span className="text-red-500 text-xs">{slugError}</span>}
              </div>
              <Button 
                onClick={handleCreateList}
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
                disabled={!newListName.trim()}
              >
                Create List
              </Button>
              {createError && <div className="text-red-500 text-xs mt-2">{createError}</div>}
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
                  <span className="line-clamp-1">{list.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    {list.is_public ? (
                      <>
                        <Eye className="w-4 h-4 text-green-500" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      </>
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteList(list.id, list.name)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">Transfer this list</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle>Transfer List</DialogTitle>
                      </DialogHeader>
                      <TransferListDialogContent list={list} user={user} toast={toast} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {list.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{list.description}</p>
              )}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">
                    {list.list_items?.length || 0} items
                  </span>
                  <span className={`text-sm font-medium ${
                    list.is_public 
                      ? 'text-green-400 bg-green-500/10 px-2 py-1 rounded-full' 
                      : 'text-red-400 bg-red-500/10 px-2 py-1 rounded-full'
                  }`}>
                    {list.is_public ? '🌍 Public' : '🔒 Private'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-white hover:bg-gray-700 hover:text-white flex-1"
                    onClick={() => setManagingListId(list.id)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                  {list.is_public && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-600 text-white hover:bg-gray-700 hover:text-white"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/lists/${list.id}`;
                        navigator.clipboard.writeText(shareUrl);
                        toast({
                          title: "Link copied!",
                          description: "The list link has been copied to your clipboard.",
                        });
                      }}
                    >
                      Share
                    </Button>
                  )}
                </div>
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

      {/* List Management Dialog */}
      {managingListId && (
        <ListManagementDialog
          listId={managingListId}
          open={!!managingListId}
          onOpenChange={(open) => !open && setManagingListId(null)}
        />
      )}

      {/* Transfer Requests Section */}
      {transferRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Pending List Transfer Requests</h3>
          <div className="space-y-3">
            {transferRequests.map(req => (
              <div key={req.id} className="flex items-center gap-4 bg-gray-900/60 rounded p-3">
                <div className="flex-1">
                  <div className="font-semibold text-white">{req.list?.name}</div>
                  <div className="text-xs text-gray-400">Requested by: {req.to_user?.email || req.to_user?.username}</div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white mr-2" onClick={async () => {
                  // Accept: update status, transfer ownership, notify both
                  await supabase.from('list_transfers').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', req.id);
                  await supabase.from('custom_lists').update({ user_id: req.to_user_id }).eq('id', req.list_id);
                  await supabase.from('notifications').insert([
                    { user_id: req.to_user_id, type: 'list_transfer', message: `Your request for list '${req.list?.name}' was accepted.`, data: { list_id: req.list_id } },
                    { user_id: user.id, type: 'list_transfer', message: `You transferred list '${req.list?.name}' to ${req.to_user?.email || req.to_user?.username}.`, data: { list_id: req.list_id } }
                  ]);
                  setTransferRequests(trs => trs.filter(r => r.id !== req.id));
                }}>Accept</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={async () => {
                  // Decline: update status, notify requester
                  await supabase.from('list_transfers').update({ status: 'declined', declined_at: new Date().toISOString() }).eq('id', req.id);
                  await supabase.from('notifications').insert({
                    user_id: req.to_user_id,
                    type: 'list_transfer',
                    message: `Your request for list '${req.list?.name}' was declined.`,
                    data: { list_id: req.list_id }
                  });
                  setTransferRequests(trs => trs.filter(r => r.id !== req.id));
                }}>Decline</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomListsManager;
