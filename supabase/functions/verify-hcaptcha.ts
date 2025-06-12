// @verify_jwt false
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve((_req) => {
  return new Response(JSON.stringify({ success: true, message: 'Public function works' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
});