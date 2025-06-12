import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';

const PAGE_SIZE = 20;

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line
  }, [search, page]);

  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    let query = supabase.from('profiles').select('*', { count: 'exact' })
      .or('is_admin.eq.true,is_staff.eq.true');
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }
    const { data, error, count } = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (error) setError(error.message);
    setStaff(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const handlePromote = async (id: string, toAdmin: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: toAdmin, is_staff: true }).eq('id', id);
    if (error) setError(error.message);
    fetchStaff();
  };

  const handleDemote = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ is_admin: false }).eq('id', id);
    if (error) setError(error.message);
    fetchStaff();
  };

  const handleRemoveStaff = async (id: string) => {
    if (!window.confirm('Remove staff privileges?')) return;
    const { error } = await supabase.from('profiles').update({ is_staff: false, is_admin: false }).eq('id', id);
    if (error) setError(error.message);
    fetchStaff();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Staff & Admin Management</h1>
        <div className="flex items-center mb-4 gap-2">
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="animate-spin mr-2" /> Loading staff...
          </div>
        ) : (
          <div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Admin</th>
                  <th className="p-2 text-left">Staff</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((user: any) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.full_name || '-'}</td>
                    <td className="p-2">{user.is_admin ? 'Yes' : 'No'}</td>
                    <td className="p-2">{user.is_staff ? 'Yes' : 'No'}</td>
                    <td className="p-2 flex gap-2">
                      {!user.is_admin && (
                        <Button size="sm" variant="outline" onClick={() => handlePromote(user.id, true)}>
                          Promote to Admin
                        </Button>
                      )}
                      {user.is_admin && (
                        <Button size="sm" variant="outline" onClick={() => handleDemote(user.id)}>
                          Demote to Staff
                        </Button>
                      )}
                      {user.is_staff && (
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveStaff(user.id)}>
                          Remove Staff
                        </Button>
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

export default AdminStaff; 