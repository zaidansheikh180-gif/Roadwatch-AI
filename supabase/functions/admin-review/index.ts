import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }); }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'), serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !serviceKey || !anonKey) return json({ error: 'Admin service is not configured.' }, 503);
    const authorization = request.headers.get('Authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) return json({ error: 'Administrator sign-in is required.' }, 401);
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: 'The session is invalid or expired.' }, 401);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: role } = await admin.from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle();
    if (role?.role !== 'admin') return json({ error: 'Administrator role required.' }, 403);
    const body = await request.json();
    const reportId = String(body?.reportId ?? '');
    const lifecycleStatus = String(body?.lifecycleStatus ?? '');
    const verificationStatus = String(body?.verificationStatus ?? '');
    const allowedLifecycle = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];
    const allowedVerification = ['Unverified', 'Reviewed', 'Confirmed', 'Disputed'];
    if (!/^[0-9a-f-]{36}$/i.test(reportId) || !allowedLifecycle.includes(lifecycleStatus) || !allowedVerification.includes(verificationStatus)) return json({ error: 'Invalid review values.' }, 400);
    const { data: before, error: beforeError } = await admin.from('reports').select('id,lifecycle_status,verification_status').eq('id', reportId).single();
    if (beforeError || !before) return json({ error: 'Report not found.' }, 404);
    const { error: updateError } = await admin.from('reports').update({ lifecycle_status: lifecycleStatus, verification_status: verificationStatus }).eq('id', reportId);
    if (updateError) return json({ error: 'Could not save the review decision.' }, 502);
    const history = [];
    if (before.lifecycle_status !== lifecycleStatus) history.push({ report_id: reportId, actor_user_id: userData.user.id, change_type: 'lifecycle', old_value: before.lifecycle_status, new_value: lifecycleStatus });
    if (before.verification_status !== verificationStatus) history.push({ report_id: reportId, actor_user_id: userData.user.id, change_type: 'verification', old_value: before.verification_status, new_value: verificationStatus });
    if (history.length) {
      const { error: historyError } = await admin.from('report_status_history').insert(history);
      if (historyError) return json({ error: 'Status changed, but audit history failed to save. Please inspect the report before retrying.' }, 502);
    }
    const decision = verificationStatus === 'Confirmed' ? 'Confirmed' : verificationStatus === 'Disputed' || lifecycleStatus === 'Rejected' ? 'Disputed' : 'Reviewed';
    const { error: reviewError } = await admin.from('report_reviews').insert({ report_id: reportId, reviewer_user_id: userData.user.id, decision });
    if (reviewError) return json({ error: 'Status changed, but review history failed to save. Please inspect the report before retrying.' }, 502);
    return json({ success: true });
  } catch {
    return json({ error: 'Unexpected review error.' }, 500);
  }
});
