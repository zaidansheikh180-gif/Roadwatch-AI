export type LifecycleStatus = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected';
export type VerificationStatus = 'Unverified' | 'Reviewed' | 'Confirmed' | 'Disputed';
export type ScreeningStatus = 'Pending' | 'Completed' | 'Uncertain' | 'Failed' | 'Unavailable';

export interface RoadReport {
  id: string;
  description: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  photoUrl: string;
  lifecycleStatus: LifecycleStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;
  isSample: boolean;
  screeningStatus: ScreeningStatus;
  suggestedDamageType?: string | null;
  suggestedSeverity?: string | null;
  confidenceScore?: number | null;
  trackingCode?: string;
}

export interface SubmitReportInput {
  photo: File;
  latitude: number;
  longitude: number;
  locationLabel: string;
  description: string;
}

export interface SubmitReportResult {
  report: RoadReport;
  trackingCode: string;
}
