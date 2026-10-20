import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }); }
async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Tracking service is not configured.' }, 503);
    const body = await request.json();
    const code = String(body?.trackingCode ?? '').trim().replaceAll('-', '').toUpperCase();
    if (!/^[A-F0-9]{32}$/.test(code)) return json({ error: 'Invalid tracking code.' }, 400);
    const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const hash = await sha256(code);
    const { data: report, error } = await admin.from('reports').select('id,description,latitude,longitude,location_label,photo_storage_path,lifecycle_status,verification_status,is_sample,created_at').eq('tracking_token_hash', hash).maybeSingle();
    if (error || !report) return json({ error: 'No report found for that tracking code.' }, 404);
    const photoUrl = admin.storage.from('road-photos').getPublicUrl(report.photo_storage_path).data.publicUrl;
    return json({ report: { id: report.id, description: report.description, latitude: report.latitude, longitude: report.longitude, location_label: report.location_label, photo_url: photoUrl, lifecycle_status: report.lifecycle_status, verification_status: report.verification_status, is_sample: report.is_sample, created_at: report.created_at, screening_status: 'Unavailable', suggested_damage_type: null, suggested_severity: null, confidence_score: null } });
  } catch {
    return json({ error: 'Tracking request failed.' }, 500);
  }
});
