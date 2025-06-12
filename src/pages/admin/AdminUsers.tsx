import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UserPlus, Edit, Trash2, Shield, Users as UsersIcon, Mail } from 'lucide-react';
import AdminLayout from './AdminLayout';

const PAGE_SIZE = 20;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', full_name: '', password: '', sendWelcome: true });
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search, page]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://db.popguide.co.uk/functions/v1/admin-list-users-with-stripe');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      let merged = json.users || [];
      // Apply search
      const filtered = search
        ? merged.filter(
            (u: any) =>
              u.email.toLowerCase().includes(search.toLowerCase()) ||
              u.full_name.toLowerCase().includes(search.toLowerCase())
          )
        : merged;
      // Pagination
      const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      setUsers(paged);
      setTotal(filtered.length);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    // Remove from auth.users and profiles
    await supabase.rpc('admin_delete_user', { user_id: id });
    fetchUsers();
  };

  const handleToggleAdmin = async (id: string, isAdmin: boolean) => {
    await supabase.from('profiles').update({ is_admin: !isAdmin }).eq('id', id);
    fetchUsers();
  };

  const handleToggleStaff = async (id: string, isStaff: boolean) => {
    await supabase.from('profiles').update({ is_staff: !isStaff }).eq('id', id);
    fetchUsers();
  };

  const handleAddUser = async () => {
    // Create user in auth.users
    const { email, password, full_name, sendWelcome } = addForm;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true,
    });
    if (error) setError(error.message);
    if (sendWelcome) {
      // Optionally send a welcome email (implement as needed)
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'welcome',
          to: email,
          data: { full_name },
        },
      });
    }
    setShowAdd(false);
    setAddForm({ email: '', full_name: '', password: '', sendWelcome: true });
    fetchUsers();
  };

  const handleEditUser = async () => {
    if (!editing) return;
    await supabase.auth.admin.updateUserById(editing.id, {
      user_metadata: { full_name: editing.full_name },
    });
    await supabase.from('profiles').update({ is_admin: editing.is_admin, is_staff: editing.is_staff }).eq('id', editing.id);
    setEditing(null);
    fetchUsers();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <div className="flex items-center mb-4 gap-2">
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
          <Button onClick={() => setShowAdd(true)}><UserPlus className="w-4 h-4 mr-1" /> Add User</Button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="animate-spin mr-2" /> Loading users...
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
                {users.map((user: any) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.full_name || '-'}</td>
                    <td className="p-2">{user.is_admin ? <Shield className="text-blue-600 w-4 h-4" /> : '-'}</td>
                    <td className="p-2">{user.is_staff ? <UsersIcon className="text-green-600 w-4 h-4" /> : '-'}</td>
                    <td className="p-2 flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => setEditing(user)}><Edit className="w-4 h-4" /></Button>
                      <Button size="icon" variant="outline" onClick={() => handleToggleAdmin(user.id, user.is_admin)}><Shield className={user.is_admin ? 'text-blue-600 w-4 h-4' : 'w-4 h-4'} /></Button>
                      <Button size="icon" variant="outline" onClick={() => handleToggleStaff(user.id, user.is_staff)}><UsersIcon className={user.is_staff ? 'text-green-600 w-4 h-4' : 'w-4 h-4'} /></Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(user.id)}><Trash2 className="w-4 h-4" /></Button>
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
        {/* Add User Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Add User</h2>
              <Input className="mb-2" placeholder="Email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} />
              <Input className="mb-2" placeholder="Full Name" value={addForm.full_name} onChange={e => setAddForm(f => ({ ...f, full_name: e.target.value }))} />
              <Input className="mb-2" placeholder="Password" type="password" value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))} />
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={addForm.sendWelcome} onChange={e => setAddForm(f => ({ ...f, sendWelcome: e.target.checked }))} />
                <span>Send Welcome Email</span>
              </label>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button onClick={handleAddUser}><Mail className="w-4 h-4 mr-1" />Add</Button>
              </div>
            </div>
          </div>
        )}
        {/* Edit User Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Edit User</h2>
              <Input className="mb-2" placeholder="Full Name" value={editing.full_name} onChange={e => setEditing((u: any) => ({ ...u, full_name: e.target.value }))} />
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={editing.is_admin} onChange={e => setEditing((u: any) => ({ ...u, is_admin: e.target.checked }))} />
                <span>Admin</span>
              </label>
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={editing.is_staff} onChange={e => setEditing((u: any) => ({ ...u, is_staff: e.target.checked }))} />
                <span>Staff</span>
              </label>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={handleEditUser}><Edit className="w-4 h-4 mr-1" />Save</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers; 