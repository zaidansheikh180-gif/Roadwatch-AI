import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Activity, ArrowRight, ArrowUpRight, BadgeCheck, Camera, Check, CheckCircle2,
  ChevronDown, CircleAlert, Clock3, FileCheck2, Filter, ImagePlus, LocateFixed,
  LockKeyhole, Map as MapIcon, MapPin, Plus, Search, ShieldCheck, Sparkles,
  UploadCloud, X, ClipboardCheck, Route, LogIn
} from 'lucide-react';
import ReportMap from './components/ReportMap';
import { isDemoMode, listReports, signInAdmin, submitReport, trackReport, updateReportStatus } from './lib/reports';
import { supabase } from './lib/supabase';
import type { LifecycleStatus, RoadReport, VerificationStatus } from './types';

type View = 'map' | 'report' | 'track' | 'admin';
const statusLabels: LifecycleStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];

function timeAgo(value: string) {
  const delta = Math.max(0, Date.now() - new Date(value).getTime());
  const hours = Math.floor(delta / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : days + ' days ago';
}
function shortId(id: string) { return id.startsWith('sample-') ? 'DEMO-' + id.slice(-1).padStart(3, '0') : id.slice(0, 8).toUpperCase(); }
function statusClass(status: string) { return status.toLowerCase().replaceAll(' ', '-'); }

export default function App() {
  const [view, setView] = useState<View>('map');
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [refreshError, setRefreshError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All reports');
  const [notice, setNotice] = useState<{ kind: 'success' | 'error' | 'info'; text: string }>();
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedReport, setTrackedReport] = useState<RoadReport>();
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [photo, setPhoto] = useState<File>();
  const [photoPreview, setPhotoPreview] = useState('');
  const [latitude, setLatitude] = useState('12.9716');
  const [longitude, setLongitude] = useState('77.5946');
  const [locationLabel, setLocationLabel] = useState('Bengaluru, Karnataka');
  const [description, setDescription] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSignedIn, setAdminSignedIn] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const [reviewingId, setReviewingId] = useState<string>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setRefreshError('');
    try {
      const rows = await listReports();
      setReports(rows);
      setSelectedId((current) => current && rows.some((row) => row.id === current) ? current : rows[0]?.id);
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : 'Could not load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setAdminSignedIn(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const visibleReports = useMemo(() => reports.filter((report) => {
    if (report.lifecycleStatus === 'Rejected') return false;
    const matchesText = (report.locationLabel + ' ' + report.description).toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All reports' || report.lifecycleStatus === filter;
    return matchesText && matchesFilter;
  }), [reports, query, filter]);

  const selectedReport = reports.find((report) => report.id === selectedId);
  const activeCount = reports.filter((report) => !['Resolved', 'Rejected'].includes(report.lifecycleStatus)).length;
  const reviewedCount = reports.filter((report) => ['Reviewed', 'Confirmed'].includes(report.verificationStatus)).length;

  function changeView(next: View) {
    setView(next);
    setNotice(undefined);
    if (next === 'report') { setPhoto(undefined); setPhotoPreview(''); }
  }

  function handlePhoto(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNotice({ kind: 'error', text: 'Choose a JPG, PNG, or WebP image.' }); return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setNotice({ kind: 'error', text: 'The photo must be 8 MB or smaller.' }); return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setNotice(undefined);
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setNotice({ kind: 'error', text: 'Location is not supported by this browser. Enter coordinates manually.' }); return; }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude.toFixed(6));
      setLongitude(position.coords.longitude.toFixed(6));
      setLocationLabel('Pinned current location');
      setGettingLocation(false);
      setNotice({ kind: 'success', text: 'Current coordinates added. Confirm the location before submitting.' });
    }, () => {
      setGettingLocation(false);
      setNotice({ kind: 'error', text: 'Location permission was unavailable. You can still enter coordinates manually.' });
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!photo) { setNotice({ kind: 'error', text: 'Add a road photo before submitting.' }); return; }
    const lat = Number(latitude), lon = Number(longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      setNotice({ kind: 'error', text: 'Enter valid latitude and longitude values.' }); return;
    }
    setSubmitting(true); setNotice(undefined);
    try {
      const result = await submitReport({ photo, latitude: lat, longitude: lon, locationLabel: locationLabel.trim(), description: description.trim() });
      setTrackingCode(result.trackingCode);
      setTrackedReport(result.report);
      setReports((current) => [result.report, ...current]);
      setSelectedId(result.report.id);
      setNotice({ kind: 'success', text: 'Your report was saved. Keep the tracking code safe.' });
      setView('track');
      setDescription(''); setPhoto(undefined); setPhotoPreview('');
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'The report could not be saved.' });
    } finally { setSubmitting(false); }
  }

  async function handleTrack(event: FormEvent) {
    event.preventDefault(); setNotice(undefined); setTrackedReport(undefined);
    try {
      const report = await trackReport(trackingCode);
      setTrackedReport(report);
      setNotice({ kind: 'success', text: 'Report found.' });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Report could not be found.' });
    }
  }

  async function handleAdminLogin(event: FormEvent) {
    event.preventDefault(); setAdminBusy(true); setNotice(undefined);
    try {
      await signInAdmin(adminEmail, adminPassword);
      setAdminSignedIn(true);
      setNotice({ kind: 'success', text: 'Administrator session verified.' });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Administrator sign-in failed.' });
    } finally { setAdminBusy(false); }
  }

  async function reviewReport(report: RoadReport, lifecycleStatus: LifecycleStatus) {
    setReviewingId(report.id); setNotice(undefined);
    const verificationStatus: VerificationStatus = lifecycleStatus === 'Rejected' ? 'Disputed' : lifecycleStatus === 'Under Review' ? 'Reviewed' : report.verificationStatus;
    try {
      await updateReportStatus(report.id, lifecycleStatus, verificationStatus);
      if (isDemoMode()) {
        setReports((current) => current.map((item) => item.id === report.id ? { ...item, lifecycleStatus, verificationStatus } : item));
      } else { await refresh(); }
      setNotice({ kind: 'success', text: 'Review update saved.' });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Review update failed.' });
    } finally { setReviewingId(undefined); }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => changeView('map')} aria-label="RoadWatch AI home">
          <span className="brand-mark"><Route size={22} strokeWidth={2.4} /></span>
          <span className="brand-copy"><strong>RoadWatch <em>AI</em></strong><small>COMMUNITY ROAD INTELLIGENCE</small></span>
        </button>
        <div className="sidebar-rule" />
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={view === 'map' ? 'nav-item active' : 'nav-item'} onClick={() => changeView('map')}><MapIcon size={18} /> Explore reports <span className="nav-count">{reports.length}</span></button>
          <button className={view === 'report' ? 'nav-item active' : 'nav-item'} onClick={() => changeView('report')}><Plus size={18} /> Report an issue</button>
          <button className={view === 'track' ? 'nav-item active' : 'nav-item'} onClick={() => changeView('track')}><FileCheck2 size={18} /> Track a report</button>
          <button className={view === 'admin' ? 'nav-item active' : 'nav-item'} onClick={() => changeView('admin')}><ShieldCheck size={18} /> Review desk</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status"><span className="live-dot" /><span><strong>{isDemoMode() ? 'Demo workspace' : 'Connected workspace'}</strong><small>{isDemoMode() ? 'Local browser storage' : 'Supabase backend'}</small></span></div>
          <div className="sidebar-note"><LockKeyhole size={15} /><span>Public reports never include private tracking codes.</span></div>
          <div className="sidebar-footer">ROADWATCH AI <span>•</span> MVP 0.1</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><Route size={19} /></span><strong>RoadWatch <em>AI</em></strong></div>
          <div className="breadcrumb"><span>Workspace</span><ArrowRight size={13} /><strong>{view === 'map' ? 'Overview' : view === 'report' ? 'New report' : view === 'track' ? 'Report tracking' : 'Review desk'}</strong></div>
          <div className="topbar-actions">
            <span className="topbar-location"><MapPin size={15} /> Bengaluru, India</span>
            <button className="avatar-button" onClick={() => changeView('admin')} aria-label="Open review desk"><ShieldCheck size={17} /></button>
          </div>
        </header>

        {isDemoMode() && <div className="demo-banner"><CircleAlert size={16} /><span><strong>Demo mode</strong> — reports are saved only in this browser. Connect Supabase for shared, secure persistence.</span><button onClick={() => changeView('admin')}>Setup <ArrowUpRight size={14} /></button></div>}
        {notice && <div className={'notice ' + notice.kind} role="status"><span>{notice.kind === 'success' ? <CheckCircle2 size={18} /> : notice.kind === 'error' ? <CircleAlert size={18} /> : <Activity size={18} />}</span><p>{notice.text}</p><button onClick={() => setNotice(undefined)} aria-label="Dismiss message"><X size={16} /></button></div>}

        {view === 'map' && (
          <>
            <section className="page-heading">
              <div><div className="eyebrow"><span className="eyebrow-dot" /> CIVIC REPORTING NETWORK</div><h1>Better roads <span>start with us.</span></h1><p>Every report makes the road ahead a little clearer.</p></div>
              <button className="btn btn-primary" onClick={() => changeView('report')}><Plus size={17} /> Report road damage <ArrowUpRight size={15} /></button>
            </section>
            <section className="stat-grid">
              <div className="stat-card"><span className="stat-icon turquoise"><MapPin size={19} /></span><span className="stat-label">Total reports</span><strong>{reports.length.toString().padStart(2, '0')}</strong><small>Across the community</small></div>
              <div className="stat-card"><span className="stat-icon mulberry"><Activity size={19} /></span><span className="stat-label">Active issues</span><strong>{activeCount.toString().padStart(2, '0')}</strong><small>Awaiting completion</small></div>
              <div className="stat-card"><span className="stat-icon pale"><BadgeCheck size={19} /></span><span className="stat-label">Reviewed</span><strong>{reviewedCount.toString().padStart(2, '0')}</strong><small>Human review recorded</small></div>
            </section>
            <section className="explorer-grid">
              <div className="panel map-panel">
                <div className="panel-heading"><div><div className="eyebrow">LIVE OVERVIEW</div><h2>Road issue map</h2></div><span className="map-chip"><span className="live-dot" /> {visibleReports.length} visible</span></div>
                <div className="map-wrap">
                  {loading ? <div className="map-state"><span className="spinner" /> Loading reports…</div> : refreshError ? <div className="map-state"><CircleAlert size={22} /><strong>Map data unavailable</strong><span>{refreshError}</span><button className="btn btn-secondary btn-small" onClick={() => void refresh()}>Try again</button></div> : <ReportMap reports={visibleReports} selectedId={selectedId} onSelect={(report) => setSelectedId(report.id)} />}
                  <div className="map-legend"><span><i className="legend-dot active-dot" /> Open</span><span><i className="legend-dot resolved-dot" /> Resolved</span><span><i className="legend-dot sample-dot" /> Demo sample</span></div>
                </div>
                <div className="map-foot"><span><MapPin size={14} /> Bengaluru region</span><span>Map tiles © OpenStreetMap contributors</span></div>
              </div>
              <div className="panel report-list-panel">
                <div className="panel-heading"><div><div className="eyebrow">COMMUNITY FEED</div><h2>Recent reports <span className="count-pill">{visibleReports.length}</span></h2></div><button className="icon-btn" onClick={() => void refresh()} aria-label="Refresh reports"><Activity size={17} /></button></div>
                <div className="report-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search location or issue" aria-label="Search reports" /></div>
                <div className="filter-row"><Filter size={14} /><select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter reports"><option>All reports</option>{statusLabels.filter((s) => s !== 'Rejected').map((s) => <option key={s}>{s}</option>)}</select><ChevronDown size={13} /></div>
                <div className="report-list">
                  {visibleReports.map((report) => (
                    <button key={report.id} className={'report-row ' + (selectedId === report.id ? 'selected' : '')} onClick={() => setSelectedId(report.id)}>
                      <span className="report-thumb">{report.photoUrl ? <img src={report.photoUrl} alt="" /> : <span className="thumb-placeholder"><MapPin size={18} /></span>}{report.isSample && <i className="sample-tag">DEMO</i>}</span>
                      <span className="report-row-content"><strong>{report.locationLabel}</strong><span>{report.description || 'Road issue reported'}</span><small><Clock3 size={12} /> {timeAgo(report.createdAt)}</small><span className={'status-badge ' + statusClass(report.lifecycleStatus)}>{report.lifecycleStatus}</span></span>
                      <ArrowUpRight className="row-arrow" size={16} />
                    </button>
                  ))}
                  {!visibleReports.length && <div className="empty-state"><MapPin size={24} /><strong>No matching reports</strong><span>Try another search or submit a new issue.</span></div>}
                </div>
                <button className="list-footer" onClick={() => changeView('report')}>Submit a new report <ArrowRight size={15} /></button>
              </div>
            </section>
            {selectedReport && (
              <section className="panel selected-detail">
                <div className="selected-photo">{selectedReport.photoUrl ? <img src={selectedReport.photoUrl} alt="Submitted road condition" /> : <div className="thumb-placeholder"><ImagePlus size={26} /></div>}</div>
                <div className="selected-copy"><div className="eyebrow">REPORT {shortId(selectedReport.id)} {selectedReport.isSample && ' · SAMPLE DATA'}</div><h2>{selectedReport.locationLabel}</h2><p>{selectedReport.description || 'No additional description was provided.'}</p><div className="detail-tags"><span className={'status-badge ' + statusClass(selectedReport.lifecycleStatus)}>{selectedReport.lifecycleStatus}</span><span className="status-badge unverified">{selectedReport.verificationStatus}</span><span className="ai-label"><Sparkles size={13} /> AI: {selectedReport.screeningStatus === 'Unavailable' ? 'Not configured' : selectedReport.screeningStatus}</span></div><small><Clock3 size={13} /> Reported {timeAgo(selectedReport.createdAt)}</small></div>
                <button className="btn btn-secondary" onClick={() => { setTrackingCode(''); setTrackedReport(selectedReport); changeView('track'); }}>View tracking <ArrowUpRight size={15} /></button>
              </section>
            )}
          </>
        )}

        {view === 'report' && (
          <section className="form-layout">
            <div className="form-intro"><div className="eyebrow"><span className="eyebrow-dot" /> COMMUNITY REPORTING</div><h1>Make the road <span>safer.</span></h1><p>Share what you found. Add a photo and a precise location so the issue can be reviewed.</p><div className="form-steps"><div className="step active"><span>01</span><div><strong>Describe</strong><small>Photo and details</small></div></div><div className="step"><span>02</span><div><strong>Pinpoint</strong><small>Confirm location</small></div></div><div className="step"><span>03</span><div><strong>Submit</strong><small>Get your tracking code</small></div></div></div><div className="privacy-note"><LockKeyhole size={18} /><div><strong>Your tracking code is private.</strong><p>Save it after submission. Public map visitors cannot use a report ID to access private tracking.</p></div></div></div>
            <form className="panel submission-form" onSubmit={(event) => void handleSubmit(event)}>
              <div className="form-card-heading"><div><div className="eyebrow">NEW SUBMISSION</div><h2>Road damage details</h2></div><span className="required-note">* Required</span></div>
              <label className="field-label">Photo evidence <span>*</span><small>JPG, PNG or WebP · Up to 8 MB</small></label>
              <label className={'upload-zone ' + (photoPreview ? 'has-photo' : '')}>
                {photoPreview ? <><img src={photoPreview} alt="Selected road damage preview" /><span className="upload-overlay"><Camera size={17} /> Change photo</span></> : <><span className="upload-icon"><UploadCloud size={23} /></span><strong>Choose a road photo</strong><span>Tap to browse your device</span><small>Photos may be publicly visible with the report.</small></>}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhoto(e.target.files?.[0])} />
              </label>
              <label className="field-label" htmlFor="description">What did you notice? <small>Optional</small></label>
              <textarea id="description" rows={3} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the pothole, cracks, or other road damage…" />
              <div className="field-row"><label className="field-label" htmlFor="lat">Latitude <span>*</span><input id="lat" required inputMode="decimal" value={latitude} onChange={(e) => setLatitude(e.target.value)} /></label><label className="field-label" htmlFor="lon">Longitude <span>*</span><input id="lon" required inputMode="decimal" value={longitude} onChange={(e) => setLongitude(e.target.value)} /></label></div>
              <label className="field-label" htmlFor="location">Location label <small>Optional</small><input id="location" maxLength={160} value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="Street, junction, or nearby landmark" /></label>
              <button type="button" className="location-button" onClick={useMyLocation} disabled={gettingLocation}><LocateFixed size={16} /> {gettingLocation ? 'Finding location…' : 'Use my current location'}</button>
              <div className="form-privacy"><CircleAlert size={15} /><span>Submitted photos may be visible on the public map. Avoid including faces or private information where possible.</span></div>
              <button className="btn btn-primary submit-button" type="submit" disabled={submitting}>{submitting ? <><span className="spinner small" /> Saving report…</> : <><UploadCloud size={17} /> Submit report <ArrowUpRight size={16} /></>}</button>
              <p className="form-footnote">AI screening is a separate step and may be unavailable. It will not be represented as official verification.</p>
            </form>
          </section>
        )}

        {view === 'track' && (
          <section className="track-layout">
            <div className="form-intro"><div className="eyebrow"><span className="eyebrow-dot" /> REPORT TRANSPARENCY</div><h1>Your report.<br /><span>Your visibility.</span></h1><p>Use the private tracking code issued when you submitted a report to view its latest saved status.</p><div className="privacy-note"><LockKeyhole size={18} /><div><strong>Keep the code private.</strong><p>A public report ID is not a tracking credential. Do not share your tracking code publicly.</p></div></div></div>
            <div className="panel tracking-panel">
              <div className="form-card-heading"><div><div className="eyebrow">SECURE LOOKUP</div><h2>Track a report</h2></div><span className="tracking-icon"><FileCheck2 size={21} /></span></div>
              {trackingCode && trackedReport && <div className="tracking-code-box"><small>YOUR PRIVATE TRACKING CODE</small><strong>{trackingCode}</strong><button onClick={() => void navigator.clipboard?.writeText(trackingCode)} type="button">Copy code</button></div>}
              <form onSubmit={(event) => void handleTrack(event)} className="track-form"><label className="field-label" htmlFor="tracking-code">Tracking code<input id="tracking-code" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder="Enter your private code" required /></label><button className="btn btn-primary" type="submit"><Search size={16} /> Find my report</button></form>
              {trackedReport && <div className="tracked-result"><div className="tracked-result-head"><span className={'status-badge ' + statusClass(trackedReport.lifecycleStatus)}>{trackedReport.lifecycleStatus}</span><span className="status-badge unverified">{trackedReport.verificationStatus}</span></div>{trackedReport.photoUrl && <img className="tracked-photo" src={trackedReport.photoUrl} alt="Reported road condition" />}<h3>{trackedReport.locationLabel}</h3><p>{trackedReport.description || 'No description provided.'}</p><div className="timeline"><div className="timeline-item done"><span><Check size={13} /></span><div><strong>Report submitted</strong><small>{new Date(trackedReport.createdAt).toLocaleString()}</small></div></div><div className={'timeline-item ' + (trackedReport.lifecycleStatus !== 'Submitted' ? 'done' : '')}><span><Activity size={13} /></span><div><strong>Review status</strong><small>{trackedReport.lifecycleStatus === 'Submitted' ? 'Waiting for review' : trackedReport.lifecycleStatus}</small></div></div></div></div>}
            </div>
          </section>
        )}

        {view === 'admin' && (
          <section className="admin-page">
            <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> OPERATIONS</div><h1>Review <span>desk.</span></h1><p>Inspect reports and record a clear review status.</p></div><span className="admin-secure"><ShieldCheck size={16} /> Role-protected when connected</span></div>
            {isDemoMode() && <div className="setup-card"><div className="setup-icon"><LockKeyhole size={20} /></div><div><strong>Demo review mode</strong><p>Changes here affect this browser only. This is not secure administrator authentication. Configure Supabase and assign an admin role before using real reports.</p></div></div>}
            {!isDemoMode() && !adminSignedIn && <form className="panel admin-login" onSubmit={(event) => void handleAdminLogin(event)}><div><div className="eyebrow">ADMIN ACCESS</div><h2>Sign in to review reports</h2><p>Only accounts with the backend-managed admin role can save review decisions.</p></div><label className="field-label">Email<input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required /></label><label className="field-label">Password<input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required /></label><button className="btn btn-primary" disabled={adminBusy}><LogIn size={16} /> {adminBusy ? 'Checking access…' : 'Admin sign in'}</button></form>}
            <div className="admin-summary"><div className="panel admin-stat"><span className="stat-icon pale"><ClipboardCheck size={18} /></span><small>Awaiting review</small><strong>{reports.filter((r) => r.lifecycleStatus === 'Submitted' || r.lifecycleStatus === 'Under Review').length}</strong></div><div className="panel admin-stat"><span className="stat-icon turquoise"><BadgeCheck size={18} /></span><small>Confirmed by review</small><strong>{reports.filter((r) => r.verificationStatus === 'Confirmed').length}</strong></div><div className="panel admin-stat"><span className="stat-icon mulberry"><CheckCircle2 size={18} /></span><small>Resolved status</small><strong>{reports.filter((r) => r.lifecycleStatus === 'Resolved').length}</strong></div></div>
            <div className="panel admin-queue"><div className="panel-heading"><div><div className="eyebrow">REPORT QUEUE</div><h2>All reports <span className="count-pill">{reports.length}</span></h2></div><button className="btn btn-secondary btn-small" onClick={() => void refresh()}><Activity size={14} /> Refresh</button></div>
              {reports.map((report) => <div className="admin-row" key={report.id}><div className="admin-thumb">{report.photoUrl ? <img src={report.photoUrl} alt="" /> : <MapPin size={20} />}</div><div className="admin-report-copy"><strong>{report.locationLabel} {report.isSample && <span className="sample-inline">SAMPLE</span>}</strong><p>{report.description || 'No description supplied.'}</p><div className="detail-tags"><span className={'status-badge ' + statusClass(report.lifecycleStatus)}>{report.lifecycleStatus}</span><span className="status-badge unverified">{report.verificationStatus}</span></div></div><div className="admin-controls"><label className="sr-only" htmlFor={'status-' + report.id}>Update lifecycle status</label><select id={'status-' + report.id} value={report.lifecycleStatus} onChange={(e) => void reviewReport(report, e.target.value as LifecycleStatus)} disabled={Boolean(reviewingId) || (!isDemoMode() && !adminSignedIn)}>{statusLabels.map((status) => <option key={status}>{status}</option>)}</select>{reviewingId === report.id && <small>Saving…</small>}</div></div>)}
              {!reports.length && <div className="empty-state"><ClipboardCheck size={24} /><strong>No reports yet</strong><span>Submitted reports will appear here.</span></div>}
            </div>
          </section>
        )}
        <footer className="app-footer"><span>© 2026 RoadWatch AI</span><span><span className="footer-dot" /> {isDemoMode() ? 'Local demo · Not connected to a shared backend' : 'Backend configured · Review service status in setup docs'}</span><button onClick={() => changeView('report')}>Report a road issue <ArrowUpRight size={13} /></button></footer>
      </main>
    </div>
  );
}
