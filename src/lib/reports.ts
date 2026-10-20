import type { RoadReport, SubmitReportInput, SubmitReportResult, LifecycleStatus, VerificationStatus } from '../types';
import { supabase, supabaseConfigured } from './supabase';

const STORAGE_KEY = 'roadwatch-demo-reports-v1';
const TRACKING_KEY = 'roadwatch-demo-tracking-v1';

const demoReports: RoadReport[] = [
  { id: 'sample-1', description: 'Deep pothole near the junction. Drivers are swerving to avoid it.', latitude: 12.9718, longitude: 77.5942, locationLabel: 'MG Road, Bengaluru', photoUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80', lifecycleStatus: 'Under Review', verificationStatus: 'Unverified', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), isSample: true, screeningStatus: 'Unavailable' },
  { id: 'sample-2', description: 'Broken road surface and loose gravel in the left lane.', latitude: 12.9766, longitude: 77.5993, locationLabel: 'Brigade Road, Bengaluru', photoUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80', lifecycleStatus: 'Submitted', verificationStatus: 'Unverified', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), isSample: true, screeningStatus: 'Unavailable' },
  { id: 'sample-3', description: 'Road edge has crumbled beside the footpath.', latitude: 12.9652, longitude: 77.6057, locationLabel: 'Richmond Road, Bengaluru', photoUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80', lifecycleStatus: 'In Progress', verificationStatus: 'Reviewed', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(), isSample: true, screeningStatus: 'Unavailable' },
];

function mapRow(row: Record<string, unknown>): RoadReport {
  const path = String(row.photo_storage_path ?? '');
  const resolvedPhoto = String(row.photo_url ?? '') || (path && supabase ? supabase.storage.from('road-photos').getPublicUrl(path).data.publicUrl : '');
  return {
    id: String(row.id),
    description: String(row.description ?? ''),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    locationLabel: String(row.location_label ?? 'Location not provided'),
    photoUrl: resolvedPhoto,
    lifecycleStatus: row.lifecycle_status as LifecycleStatus,
    verificationStatus: row.verification_status as VerificationStatus,
    createdAt: String(row.created_at),
    isSample: Boolean(row.is_sample),
    screeningStatus: (row.screening_status as RoadReport['screeningStatus']) ?? 'Unavailable',
    suggestedDamageType: row.suggested_damage_type as string | null,
    suggestedSeverity: row.suggested_severity as string | null,
    confidenceScore: row.confidence_score == null ? null : Number(row.confidence_score),
  };
}

function readDemoReports(): RoadReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoReports));
      return demoReports;
    }
    const parsed = JSON.parse(raw) as RoadReport[];
    return Array.isArray(parsed) ? parsed : demoReports;
  } catch {
    return demoReports;
  }
}

function writeDemoReports(reports: RoadReport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export async function listReports(): Promise<RoadReport[]> {
  if (!supabaseConfigured || !supabase) return readDemoReports();
  const { data, error } = await supabase.from('public_reports').select('*').order('created_at', { ascending: false }).limit(250);
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function submitReport(input: SubmitReportInput): Promise<SubmitReportResult> {
  if (supabaseConfigured && supabase) {
    const form = new FormData();
    form.append('photo', input.photo);
    form.append('latitude', String(input.latitude));
    form.append('longitude', String(input.longitude));
    form.append('locationLabel', input.locationLabel);
    form.append('description', input.description);
    const { data, error } = await supabase.functions.invoke('submit-report', { body: form });
    if (error) throw new Error(error.message || 'The report could not be submitted.');
    if (!data?.report || !data?.trackingCode) throw new Error('The server did not confirm a saved report.');
    return { report: mapRow(data.report as Record<string, unknown>), trackingCode: String(data.trackingCode) };
  }

  const trackingCode = crypto.randomUUID().replaceAll('-', '').toUpperCase();
  let photoUrl = '';
  if (input.photo.size <= 1_000_000) {
    photoUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Could not read the selected photo.'));
      reader.readAsDataURL(input.photo);
    });
  }
  const report: RoadReport = {
    id: crypto.randomUUID(), description: input.description, latitude: input.latitude, longitude: input.longitude,
    locationLabel: input.locationLabel || 'Pinned location', photoUrl, lifecycleStatus: 'Submitted',
    verificationStatus: 'Unverified', createdAt: new Date().toISOString(), isSample: false,
    screeningStatus: 'Unavailable', trackingCode,
  };
  try {
    const previous = readDemoReports();
    writeDemoReports([report, ...previous]);
    const tokens = JSON.parse(localStorage.getItem(TRACKING_KEY) ?? '{}') as Record<string, string>;
    tokens[trackingCode] = report.id;
    localStorage.setItem(TRACKING_KEY, JSON.stringify(tokens));
  } catch {
    throw new Error('Browser storage is full or unavailable. No report was confirmed as saved; try a smaller photo.');
  }
  return { report, trackingCode };
}

export async function trackReport(code: string): Promise<RoadReport> {
  const normalized = code.trim().replaceAll('-', '').toUpperCase();
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase.functions.invoke('track-report', { body: { trackingCode: code.trim() } });
    if (error || !data?.report) throw new Error('No report was found for that tracking code.');
    return mapRow(data.report as Record<string, unknown>);
  }
  const tokens = JSON.parse(localStorage.getItem(TRACKING_KEY) ?? '{}') as Record<string, string>;
  const id = tokens[normalized];
  const report = readDemoReports().find((item) => item.id === id);
  if (!report) throw new Error('No report was found for that tracking code in this browser. Demo tracking codes only work in the browser where the report was submitted.');
  return report;
}

export async function updateReportStatus(id: string, lifecycleStatus: LifecycleStatus, verificationStatus: VerificationStatus): Promise<void> {
  if (supabaseConfigured && supabase) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error('Sign in with an authorized administrator account first.');
    const { data, error } = await supabase.functions.invoke('admin-review', {
      body: { reportId: id, lifecycleStatus, verificationStatus },
      headers: { Authorization: 'Bearer ' + token },
    });
    if (error || !data?.success) throw new Error(error?.message ?? 'The review update was not confirmed.');
    return;
  }
  const reports = readDemoReports();
  const updated = reports.map((report) => report.id === id ? { ...report, lifecycleStatus, verificationStatus } : report);
  writeDemoReports(updated);
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  if (!supabaseConfigured || !supabase) throw new Error('Supabase is not configured. Demo review changes are local to this browser and are not secured admin actions.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { data: userData } = await supabase.auth.getUser();
  const { data: role, error: roleError } = await supabase.from('user_roles').select('role').eq('user_id', userData.user?.id ?? '').maybeSingle();
  if (roleError || role?.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('This account does not have the administrator role.');
  }
}

export function isDemoMode() {
  return !supabaseConfigured;
}
