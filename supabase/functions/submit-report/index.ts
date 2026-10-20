import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function validImage(bytes: Uint8Array, type: string) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return false;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) return json({ error: 'Server storage is not configured.' }, 503);
    const form = await request.formData();
    const photo = form.get('photo');
    const latitude = Number(form.get('latitude'));
    const longitude = Number(form.get('longitude'));
    const description = String(form.get('description') ?? '').trim();
    const locationLabel = String(form.get('locationLabel') ?? 'Pinned location').trim().slice(0, 160);
    if (!(photo instanceof File)) return json({ error: 'A road photo is required.' }, 400);
    if (photo.size < 1 || photo.size > 8 * 1024 * 1024) return json({ error: 'Photo must be smaller than 8 MB.' }, 400);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) return json({ error: 'Only JPG, PNG, and WebP photos are supported.' }, 400);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return json({ error: 'Valid coordinates are required.' }, 400);
    if (description.length > 1000) return json({ error: 'Description is too long.' }, 400);
    const bytes = new Uint8Array(await photo.arrayBuffer());
    if (!validImage(bytes, photo.type)) return json({ error: 'The uploaded file does not match a supported image format.' }, 400);

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const authHeader = request.headers.get('Authorization') ?? '';
    let reporterUserId: string | null = null;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data } = await admin.auth.getUser(token);
      reporterUserId = data.user?.id ?? null;
    }
    const trackingCode = crypto.randomUUID().replaceAll('-', '').toUpperCase();
    const trackingHash = await sha256(trackingCode);
    const extension = photo.type === 'image/jpeg' ? 'jpg' : photo.type === 'image/png' ? 'png' : 'webp';
    const path = new Date().toISOString().slice(0, 10) + '/' + crypto.randomUUID() + '.' + extension;
    const { error: uploadError } = await admin.storage.from('road-photos').upload(path, bytes, { contentType: photo.type, upsert: false });
    if (uploadError) return json({ error: 'Photo upload failed. The report was not saved.' }, 502);
    const { data: inserted, error: insertError } = await admin.from('reports').insert({
      reporter_user_id: reporterUserId, tracking_token_hash: reporterUserId ? null : trackingHash,
      description, latitude, longitude, location_label: locationLabel || 'Pinned location',
      photo_storage_path: path, lifecycle_status: 'Submitted', verification_status: 'Unverified', is_sample: false,
    }).select('id, description, latitude, longitude, location_label, photo_storage_path, lifecycle_status, verification_status, is_sample, created_at').single();
    if (insertError || !inserted) {
      await admin.storage.from('road-photos').remove([path]);
      return json({ error: 'The report could not be saved. Please retry.' }, 502);
    }
    const photoUrl = admin.storage.from('road-photos').getPublicUrl(path).data.publicUrl;
    return json({
      trackingCode,
      report: {
        id: inserted.id, description: inserted.description, latitude: inserted.latitude, longitude: inserted.longitude,
        location_label: inserted.location_label, photo_url: photoUrl, lifecycle_status: inserted.lifecycle_status,
        verification_status: inserted.verification_status, is_sample: inserted.is_sample, created_at: inserted.created_at,
        screening_status: 'Unavailable', suggested_damage_type: null, suggested_severity: null, confidence_score: null,
      },
    }, 201);
  } catch {
    return json({ error: 'Unexpected submission error. No success was confirmed.' }, 500);
  }
});
