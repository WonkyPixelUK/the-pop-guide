import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

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

  // Auth check: Only allow the logged-in user to access their own key
  const user = await getUserFromRequest(req);
  if (!user || user.id !== userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ api_key: data?.api_key || null });
  }

  if (req.method === 'POST') {
    // Revoke old keys
    await supabase
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null);
    // Generate new key
    const newKey = uuidv4() + '-' + uuidv4();
    const { data, error } = await supabase
      .from('api_keys')
      .insert({ user_id: userId, api_key: newKey })
      .select('api_key')
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ api_key: data?.api_key });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 