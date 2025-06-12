import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';

const PAGE_SIZE = 20;

const AdminBilling = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search, page]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    let query = supabase.from('profiles').select('*', { count: 'exact' });
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }
    const { data, error, count } = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (error) setError(error.message);
    setUsers(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const handleViewInvoices = (stripeCustomerId: string) => {
    if (!stripeCustomerId) return alert('No Stripe customer ID');
    window.open(`https://dashboard.stripe.com/customers/${stripeCustomerId}`, '_blank');
  };

  const handleManageBilling = (stripeCustomerId: string) => {
    if (!stripeCustomerId) return alert('No Stripe customer ID');
    window.open(`https://dashboard.stripe.com/customers/${stripeCustomerId}`, '_blank');
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Billing Management</h1>
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
            <Loader2 className="animate-spin mr-2" /> Loading billing data...
          </div>
        ) : (
          <div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Plan</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Renewal</th>
                  <th className="p-2 text-left">Stripe ID</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.plan || '-'}</td>
                    <td className="p-2">{user.subscription_status || '-'}</td>
                    <td className="p-2">{user.renewal_date ? new Date(user.renewal_date).toLocaleDateString() : '-'}</td>
                    <td className="p-2">{user.stripe_customer_id || '-'}</td>
                    <td className="p-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewInvoices(user.stripe_customer_id)}>
                        View Invoices
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleManageBilling(user.stripe_customer_id)}>
                        Manage Billing
                      </Button>
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

export default AdminBilling; 