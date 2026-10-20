import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }); }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'), anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !anonKey) return json({ error: 'Admin service is not configured.' }, 503);
    const authorization = request.headers.get('Authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) return json({ error: 'Administrator sign-in is required.' }, 401);
    const token = authorization.slice(7);
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) return json({ error: 'The session is invalid or expired.' }, 401);

    const body = await request.json();
    const reportId = String(body?.reportId ?? '');
    const lifecycleStatus = String(body?.lifecycleStatus ?? '');
    const verificationStatus = String(body?.verificationStatus ?? '');
    const allowedLifecycle = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];
    const allowedVerification = ['Unverified', 'Reviewed', 'Confirmed', 'Disputed'];
    if (!/^[0-9a-f-]{36}$/i.test(reportId) || !allowedLifecycle.includes(lifecycleStatus) || !allowedVerification.includes(verificationStatus)) return json({ error: 'Invalid review values.' }, 400);

    const { data, error } = await userClient.rpc('admin_update_report', {
      p_report_id: reportId,
      p_lifecycle_status: lifecycleStatus,
      p_verification_status: verificationStatus,
    });
    if (error) {
      if (error.code === '42501') return json({ error: 'Administrator role required.' }, 403);
      if (error.code === 'P0002') return json({ error: 'Report not found.' }, 404);
      return json({ error: 'The review update was not saved. ' + error.message }, 502);
    }
    if (data !== true) return json({ error: 'The server did not confirm the review update.' }, 502);
    return json({ success: true });
  } catch {
    return json({ error: 'Unexpected review error.' }, 500);
  }
});
