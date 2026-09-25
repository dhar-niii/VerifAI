export type VerificationStatus = 'verified' | 'suspicious' | 'invalid';

export type PipelineStepId = 'ocr' | 'ela' | 'biometric';

export interface ForensicMetrics {
  /** Authenticity confidence 0–100 per detector channel. */
  aiGenerated: number;
  photoshop: number;
  elaVariance: number;
  stampSeal: number;
  metadata: number;
  mrzChecksum: number;
  biometric: number;
}

export interface ElaRegion {
  id: string;
  /** Percent-based bounding box on the document preview. */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  severity: 'high' | 'medium' | 'low';
}

export interface BiometricResult {
  /** 1:1 cosine similarity between passport portrait and live frame, 0–100. */
  similarity: number;
  /** dlib/OpenCV liveness score, 0–100. */
  liveness: number;
  verdict: 'match' | 'impostor' | 'low-quality';
  note: string;
}

export interface MrzCheckPair {
  printed: string;
  expected: string;
  valid: boolean;
}

export interface ParsedMrz {
  documentType: string;
  issuedCountry: string;
  surname: string;
  givenNames: string;
  /** Raw 9-char MRZ document number field (includes '<' filler). */
  docNumberRaw: string;
  docNumber: string;
  nationality: string;
  dob: string;
  sex: string;
  expiry: string;
  personalNumber: string;
  checks: {
    doc: MrzCheckPair;
    dob: MrzCheckPair;
    expiry: MrzCheckPair;
    composite: MrzCheckPair;
  };
  valid: boolean;
}

export interface ForensicFinding {
  id: string;
  title: string;
  engine: string;
  score: number;
  status: VerificationStatus;
  explanation: string;
}

export interface DocumentData {
  holderName: string;
  docNumber: string;
  dob: string;
  sex: string;
  expiry: string;
  personalNumber: string;
  issued: string;
  /** Seed used to render the synthetic portrait. */
  photoSeed: number;
  /** Non-MRZ printed birth date, when it disagrees with the MRZ (tamper case). */
  printedDob?: string;
}

export interface VerificationRecord {
  id: string;
  travelerName: string;
  documentType: string;
  docNumber: string;
  nationality: string;
  submittedAt: string;
  operator: string;
  checkpoint: string;
  status: VerificationStatus;
  confidence: number;
  latencyMs: number;
  engine: string;
  metrics: ForensicMetrics;
  /** Printed MRZ strings as extracted by EasyOCR (2 × 44 chars). */
  mrz: { line1: string; line2: string };
  biometric: BiometricResult;
  ela: { tamperPercent: number; regions: ElaRegion[] };
  findings: ForensicFinding[];
  watchlistHit: boolean;
  documentData: DocumentData;
  notes: string[];
  recommendation: string;
  /** Which synthetic preview variant to render. */
  previewStyle: 'genuine' | 'compression' | 'splice';
}

export interface WatchlistEntry {
  id: string;
  passportNumber: string;
  holderAlias: string;
  reason: string;
  addedAt: string;
  origin: string;
}

export interface EngineHealth {
  reachable: boolean;
  url: string;
  latencyMs: number;
  mode: 'live-engine' | 'offline-simulation';
  message: string;
}

export interface Operator {
  fullName: string;
  serviceId: string;
  rank: string;
  email: string;
  badgeId: string;
}

export interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  tone: 'success' | 'warning' | 'error' | 'info';
}
