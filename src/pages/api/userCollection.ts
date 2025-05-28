import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

async function getUserFromRequest(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing userId' });
  }

  // Auth check: Only allow the logged-in user to access their own collection
  const user = await getUserFromRequest(req);
  if (!user || user.id !== userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_collection')
      .select('*')
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    // Add item to collection
    const { funko_pop_id, ...rest } = req.body;
    if (!funko_pop_id) return res.status(400).json({ error: 'Missing funko_pop_id' });
    const { data, error } = await supabase
      .from('user_collection')
      .insert([{ user_id: userId, funko_pop_id, ...rest }])
      .select('*')
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'PUT') {
    // Update item in collection
    const { id, ...rest } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { data, error } = await supabase
      .from('user_collection')
      .update(rest)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    // Remove item from collection
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { error } = await supabase
      .from('user_collection')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 