import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';

const PAGE_SIZE = 20;

const AdminRetailers = () => {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    fetchRetailers();
    // eslint-disable-next-line
  }, [search, page]);

  const fetchRetailers = async () => {
    setLoading(true);
    setError('');
    let query = supabase.from('retailers').select('*', { count: 'exact' });
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    const { data, error, count } = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (error) setError(error.message);
    setRetailers(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('retailers').update({ approved: true }).eq('id', id);
    if (error) setError(error.message);
    fetchRetailers();
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this retailer?')) return;
    const { error } = await supabase.from('retailers').delete().eq('id', id);
    if (error) setError(error.message);
    fetchRetailers();
  };

  const handleEdit = (retailer: any) => setEditing(retailer);
  const handleCancelEdit = () => setEditing(null);

  const handleSaveEdit = async () => {
    if (!editing) return;
    const { id, ...fields } = editing;
    const { error } = await supabase.from('retailers').update(fields).eq('id', id);
    if (error) setError(error.message);
    setEditing(null);
    fetchRetailers();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Retailer Management</h1>
        <div className="flex items-center mb-4 gap-2">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="animate-spin mr-2" /> Loading retailers...
          </div>
        ) : (
          <div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Website</th>
                  <th className="p-2 text-left">Approved</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {retailers.map((retailer: any) => (
                  <tr key={retailer.id} className="border-t">
                    <td className="p-2">
                      {editing && editing.id === retailer.id ? (
                        <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                      ) : (
                        retailer.name
                      )}
                    </td>
                    <td className="p-2">
                      {editing && editing.id === retailer.id ? (
                        <Input value={editing.website} onChange={e => setEditing({ ...editing, website: e.target.value })} />
                      ) : (
                        retailer.website
                      )}
                    </td>
                    <td className="p-2">{retailer.approved ? 'Yes' : 'No'}</td>
                    <td className="p-2 flex gap-2">
                      {!retailer.approved && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(retailer.id)}>
                          Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleEdit(retailer)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRemove(retailer.id)}>
                        Remove
                      </Button>
                      {editing && editing.id === retailer.id && (
                        <>
                          <Button size="sm" variant="outline" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
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

export default AdminRetailers; 