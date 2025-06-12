import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';

const PAGE_SIZE = 100;

const AdminFunkoPops = () => {
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [newPop, setNewPop] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPops();
    // eslint-disable-next-line
  }, [search, page]);

  const fetchPops = async () => {
    setLoading(true);
    setError('');
    let query = supabase.from('funko_pops').select('*', { count: 'exact' });
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    let from = (page - 1) * PAGE_SIZE;
    let to = from + PAGE_SIZE - 1;
    if (from < 0) from = 0;
    if (to < from) to = from;
    const { data, error, count } = await query.range(from, to);
    if (error) setError(error.message);
    setPops(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this Funko Pop?')) return;
    const { error } = await supabase.from('funko_pops').delete().eq('id', id);
    if (error) setError(error.message);
    fetchPops();
  };

  const handleEdit = (pop: any) => setEditing(pop);
  const handleCancelEdit = () => setEditing(null);

  const handleSaveEdit = async () => {
    if (!editing) return;
    const { id, ...fields } = editing;
    const { error } = await supabase.from('funko_pops').update(fields).eq('id', id);
    if (error) setError(error.message);
    setEditing(null);
    fetchPops();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, pop: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const filePath = `${pop.id}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from('funko-images').upload(filePath, file, { upsert: true });
    if (uploadError) setError(uploadError.message);
    const { data } = supabase.storage.from('funko-images').getPublicUrl(filePath);
    await supabase.from('funko_pops').update({ image_url: data.publicUrl }).eq('id', pop.id);
    fetchPops();
  };

  const handleImageDelete = async (pop: any) => {
    if (!pop.image_url) return;
    const path = pop.image_url.split('funko-images/')[1];
    if (!path) return;
    await supabase.storage.from('funko-images').remove([path]);
    await supabase.from('funko_pops').update({ image_url: null }).eq('id', pop.id);
    fetchPops();
  };

  const handleAddNew = () => setNewPop({ name: '', series: '', number: '', variant: '', image_url: '', release_date: '', is_exclusive: false, is_vaulted: false, is_chase: false, estimated_value: '', description: '' });
  const handleCancelAdd = () => setNewPop(null);

  const handleSaveNew = async () => {
    const { error } = await supabase.from('funko_pops').insert([newPop]);
    if (error) setError(error.message);
    setNewPop(null);
    fetchPops();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Funko Pop Management</h1>
        <div className="flex items-center mb-4 gap-2">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
          <Button onClick={handleAddNew}>Add New</Button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="animate-spin mr-2" /> Loading Funko Pops...
          </div>
        ) : (
          <div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Image</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Series</th>
                  <th className="p-2 text-left">Number</th>
                  <th className="p-2 text-left">Variant</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pops.map((pop: any) => (
                  <tr key={pop.id} className="border-t">
                    <td className="p-2">
                      {pop.image_url ? (
                        <img src={pop.image_url} alt={pop.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                      <div className="flex gap-1 mt-1">
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={e => handleImageUpload(e, pop)} />
                        <Button size="xs" variant="outline" onClick={() => fileInputRef.current?.click()}>Upload</Button>
                        {pop.image_url && <Button size="xs" variant="destructive" onClick={() => handleImageDelete(pop)}>Delete</Button>}
                      </div>
                    </td>
                    <td className="p-2">
                      {editing && editing.id === pop.id ? (
                        <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                      ) : (
                        pop.name
                      )}
                    </td>
                    <td className="p-2">
                      {editing && editing.id === pop.id ? (
                        <Input value={editing.series} onChange={e => setEditing({ ...editing, series: e.target.value })} />
                      ) : (
                        pop.series
                      )}
                    </td>
                    <td className="p-2">
                      {editing && editing.id === pop.id ? (
                        <Input value={editing.number} onChange={e => setEditing({ ...editing, number: e.target.value })} />
                      ) : (
                        pop.number
                      )}
                    </td>
                    <td className="p-2">
                      {editing && editing.id === pop.id ? (
                        <Input value={editing.variant} onChange={e => setEditing({ ...editing, variant: e.target.value })} />
                      ) : (
                        pop.variant
                      )}
                    </td>
                    <td className="p-2 flex gap-2">
                      {editing && editing.id === pop.id ? (
                        <>
                          <Button size="sm" variant="outline" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(pop)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(pop.id)}>Delete</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {newPop && (
                  <tr className="border-t bg-orange-50">
                    <td className="p-2">-</td>
                    <td className="p-2"><Input value={newPop.name} onChange={e => setNewPop({ ...newPop, name: e.target.value })} /></td>
                    <td className="p-2"><Input value={newPop.series} onChange={e => setNewPop({ ...newPop, series: e.target.value })} /></td>
                    <td className="p-2"><Input value={newPop.number} onChange={e => setNewPop({ ...newPop, number: e.target.value })} /></td>
                    <td className="p-2"><Input value={newPop.variant} onChange={e => setNewPop({ ...newPop, variant: e.target.value })} /></td>
                    <td className="p-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleSaveNew}>Save</Button>
                      <Button size="sm" variant="outline" onClick={handleCancelAdd}>Cancel</Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
              <span>Page {page} of {Math.ceil(total / PAGE_SIZE) || 1}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>Prev</Button>
                <Button size="sm" variant="outline" onClick={() => setPage(page + 1)} disabled={page * PAGE_SIZE >= total}>Next</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFunkoPops; 