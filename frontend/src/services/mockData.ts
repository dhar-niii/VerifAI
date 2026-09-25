import type {
  ForensicFinding,
  ForensicMetrics,
  VerificationRecord,
  VerificationStatus,
  WatchlistEntry,
} from '../types';

export const ENGINE_URL = 'http://localhost:8000';
export const ENGINE_API = `${ENGINE_URL}/api`;

/** Aggregated checkpoint totals (includes archived records beyond this session). */
export const DASHBOARD_STATS = {
  total: 1428,
  verified: 1312,
  suspicious: 84,
  rejected: 32,
};

export function scoreStatus(score: number): VerificationStatus {
  if (score >= 90) return 'verified';
  if (score >= 60) return 'suspicious';
  return 'invalid';
}

const EXPLANATIONS: Record<
  keyof ForensicMetrics,
  { pass: string; warn: string; fail: string }
> = {
  photoshop: {
    pass: 'CNN activation maps are flat across the portrait frame and MRZ band — no splice boundary detected.',
    warn: 'Block-discontinuity residual sits slightly above baseline near the photo window; manual zoom recommended.',
    fail: 'CNN detects a hard luminance discontinuity at the portrait/photo-page junction — signature of a cut-and-paste splice.',
  },
  aiGenerated: {
    pass: 'No GAN fingerprints or frequency-lattice artefacts were found in the scanned facial region.',
    warn: 'Weak spectral lattice in smooth background regions; consistent with mild upscaling of a synthetic portrait.',
    fail: 'Frequency lattice plus pore-less skin texture confirm a diffusion/GAN-generated facial region.',
  },
  elaVariance: {
    pass: 'ELA variance is within tolerance for a single-pass authentic scan — no localized re-compression blocks.',
    warn: 'Elevated ELA residue around the photograph corner suggests the page was re-saved after capture.',
    fail: 'Severe ELA hotspot over an altered text block — that region was re-encoded at a different JPEG quality factor.',
  },
  stampSeal: {
    pass: 'Embossing ink compression is uniform with the surrounding page; stamp edges show natural feathering.',
    warn: 'Slight compression asymmetry on the entry stamp — probable scanner glare, verify under oblique light.',
    fail: 'Stamp ring shows uniform JPEG blocking inconsistent with physical ink — suspected digital overlay.',
  },
  metadata: {
    pass: 'EXIF header carries only the expected scanner signatures; no editing-suite writer markers present.',
    warn: 'Editing-software marker present in EXIF but timestamped before scan ingestion; flagged for review.',
    fail: 'EXIF writer signature points to a photo-editing suite and capture timestamps are internally inconsistent.',
  },
  mrzChecksum: {
    pass: 'All four ICAO 9303 7-3-1 check-digits were recalculated locally and match the printed characters.',
    warn: 'Check-digits match, but OCR confidence on the second MRZ line is degraded by glare (manual read advised).',
    fail: 'A recalculated 7-3-1 check-digit disagrees with the printed character — the machine-readable zone was edited.',
  },
  biometric: {
    pass: '128-d VGG-Face cosine similarity and dlib liveness both clear the operational thresholds.',
    warn: 'Similarity passes, but liveness tracking lost micro-movement frames due to low light or motion blur.',
    fail: 'Cosine similarity collapses below the impostor threshold — the live traveler is not the portrait holder.',
  },
};

export function buildFindings(metrics: ForensicMetrics): ForensicFinding[] {
  const spec: Array<{ id: string; title: string; engine: string; key: keyof ForensicMetrics }> = [
    { id: 'photoshop', title: 'Photoshop Manipulation', engine: 'tampering_model.h5 CNN', key: 'photoshop' },
    { id: 'ai', title: 'AI Generated Content', engine: 'GAN / Diffusion Artifact Detector', key: 'aiGenerated' },
    { id: 'ela', title: 'Pixel Compression Analysis', engine: 'OpenCV ELA (q=75 → 90)', key: 'elaVariance' },
    { id: 'meta', title: 'Metadata Analysis', engine: 'EXIF Header Signature Check', key: 'metadata' },
    { id: 'stamp', title: 'Stamp / Seal Detection', engine: 'Ink Compression Consistency', key: 'stampSeal' },
    { id: 'mrz', title: 'Text & MRZ Consistency', engine: 'EasyOCR + ICAO Doc 9303 7-3-1', key: 'mrzChecksum' },
    { id: 'bio', title: 'Image & Biometric Consistency', engine: 'DeepFace VGG-Face 128-d + dlib', key: 'biometric' },
  ];

  return spec.map(({ id, title, engine, key }) => {
    const score = metrics[key];
    const status = scoreStatus(score);
    const copy = EXPLANATIONS[key];
    return {
      id,
      title,
      engine,
      score,
      status,
      explanation: status === 'verified' ? copy.pass : status === 'suspicious' ? copy.warn : copy.fail,
    };
  });
}

interface Seed {
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
  metrics: ForensicMetrics;
  mrz: { line1: string; line2: string };
  biometric: VerificationRecord['biometric'];
  ela: VerificationRecord['ela'];
  watchlistHit: boolean;
  documentData: VerificationRecord['documentData'];
  notes: string[];
  recommendation: string;
  previewStyle: VerificationRecord['previewStyle'];
}

const OPERATOR = 'Sgt. Vikram Rao • OP-114';
const CHECKPOINT = 'SSB Post 47 — Sunauli Land Border';

const SEEDS: Seed[] = [
  {
    id: 'ES-9042',
    travelerName: 'Arjun Kumar',
    documentType: 'Indian Passport',
    docNumber: 'J8392014',
    nationality: 'IND',
    submittedAt: '2026-09-25T09:14:22',
    operator: OPERATOR,
    checkpoint: CHECKPOINT,
    status: 'verified',
    confidence: 98.6,
    latencyMs: 612,
    metrics: { aiGenerated: 99, photoshop: 99, elaVariance: 97, stampSeal: 98, metadata: 99, mrzChecksum: 100, biometric: 98 },
    mrz: {
      line1: 'P<INDKUMAR<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      line2: 'J8392014<8IND8704120M3108181Z83920147<<1<<82',
    },
    biometric: {
      similarity: 98.6,
      liveness: 97,
      verdict: 'match',
      note: 'Cosine 0.986 on the 128-d VGG-Face embedding; dlib captured 2 blinks and 4 micro-saccades in 3.1s.',
    },
    ela: { tamperPercent: 2.1, regions: [] },
    watchlistHit: false,
    documentData: {
      holderName: 'ARJUN KUMAR',
      docNumber: 'J8392014',
      dob: '12 APR 1987',
      sex: 'M',
      expiry: '18 AUG 2031',
      personalNumber: 'Z83920147<<1',
      issued: 'IND • Ministry of External Affairs',
      photoSeed: 11,
    },
    notes: [
      'EasyOCR line-2 confidence 0.998 — all four check-digits match locally recomputed 7-3-1 residues.',
      'ELA residual variance 2.1%: consistent with a single authentic scanner pass, no re-saved regions.',
      'DeepFace cosine similarity 0.986; dlib blink cadence observed at natural 3.1s intervals.',
      'Passport number absent from the encrypted red-flag watchlist (7,412 offline entries checked).',
    ],
    recommendation: 'CLEAR the traveler — document and biometric both pass the full 3-stage gauntlet.',
    previewStyle: 'genuine',
  },
  {
    id: 'ES-9043',
    travelerName: 'Meera Nair',
    documentType: 'Indian Passport',
    docNumber: 'R1174826',
    nationality: 'IND',
    submittedAt: '2026-09-25T08:47:05',
    operator: OPERATOR,
    checkpoint: CHECKPOINT,
    status: 'verified',
    confidence: 97.1,
    latencyMs: 547,
    metrics: { aiGenerated: 97, photoshop: 98, elaVariance: 95, stampSeal: 96, metadata: 98, mrzChecksum: 100, biometric: 96 },
    mrz: {
      line1: 'P<INDNAIR<<MEERA<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      line2: 'R1174826<4IND9209057F2911227R11748269<<1<<43',
    },
    biometric: {
      similarity: 97.2,
      liveness: 95,
      verdict: 'match',
      note: 'Cosine 0.972 — same individual; head-pose variance within tolerance across 3 tracked frames.',
    },
    ela: { tamperPercent: 3.4, regions: [] },
    watchlistHit: false,
    documentData: {
      holderName: 'MEERA NAIR',
      docNumber: 'R1174826',
      dob: '05 SEP 1992',
      sex: 'F',
      expiry: '22 NOV 2029',
      personalNumber: 'R11748269<<1',
      issued: 'IND • Ministry of External Affairs',
      photoSeed: 23,
    },
    notes: [
      'ICAO 9303 composite checksum verified: printed 3, recalculated 3.',
      'Stamp/Seal module reports uniform ink compression — entry stamp pressed, not printed.',
      'EXIF contains only factory scanner tags; no editing-suite writer marker detected.',
      'Biometric liveness 95% — micro-expression tracking stable under checkpoint lighting.',
    ],
    recommendation: 'CLEAR the traveler — proceed to immigration counters.',
    previewStyle: 'genuine',
  },
  {
    id: 'ES-9044',
    travelerName: 'Farhan Qureshi',
    documentType: 'Indian Passport',
    docNumber: 'Z4481903',
    nationality: 'IND',
    submittedAt: '2026-09-25T08:31:47',
    operator: OPERATOR,
    checkpoint: CHECKPOINT,
    status: 'suspicious',
    confidence: 87.4,
    latencyMs: 806,
    metrics: { aiGenerated: 91, photoshop: 78, elaVariance: 64, stampSeal: 93, metadata: 88, mrzChecksum: 100, biometric: 95 },
    mrz: {
      line1: 'P<INDQURESHI<<FARHAN<<<<<<<<<<<<<<<<<<<<<<<<',
      line2: 'Z4481903<8IND8506302M2803308Z44819031<<4<<38',
    },
    biometric: {
      similarity: 96.4,
      liveness: 91,
      verdict: 'match',
      note: 'Cosine 0.964 — same individual; bright fluorescent glare slightly reduced pupil-response fidelity.',
    },
    ela: {
      tamperPercent: 18.7,
      regions: [
        { id: 'e1', x: 63, y: 15, w: 31, h: 35, label: 'Photo window re-save residue', severity: 'medium' },
        { id: 'e2', x: 7, y: 52, w: 27, h: 19, label: 'Entry stamp compression noise', severity: 'low' },
      ],
    },
    watchlistHit: false,
    documentData: {
      holderName: 'FARHAN QURESHI',
      docNumber: 'Z4481903',
      dob: '30 JUN 1985',
      sex: 'M',
      expiry: '30 MAR 2028',
      personalNumber: 'Z44819031<<4',
      issued: 'IND • Ministry of External Affairs',
      photoSeed: 34,
    },
    notes: [
      'ELA residual elevated to 18.7% around the photograph — page photographed under glare, then re-saved twice.',
      'CNN manipulation score 78%: soft block edges present, but no hard splice boundary across the portrait.',
      'MRZ check-digits are all valid; EasyOCR line-2 confidence dropped to 0.941 because of specular glare.',
      'Biometric match 96.4% — traveler is consistent with the portrait; liveness 91% under bright ambient light.',
    ],
    recommendation: 'REFER to secondary inspection — re-scan under oblique lighting before clearing.',
    previewStyle: 'compression',
  },
  {
    id: 'ES-9045',
    travelerName: 'Dmitri Volkov',
    documentType: 'Russian Passport',
    docNumber: '714839210',
    nationality: 'RUS',
    submittedAt: '2026-09-24T17:12:38',
    operator: 'Insp. Sunita Devi • OP-097',
    checkpoint: CHECKPOINT,
    status: 'suspicious',
    confidence: 84.2,
    latencyMs: 731,
    metrics: { aiGenerated: 72, photoshop: 88, elaVariance: 81, stampSeal: 85, metadata: 74, mrzChecksum: 100, biometric: 89 },
    mrz: {
      line1: 'P<RUSVOLKOV<<DMITRI<<<<<<<<<<<<<<<<<<<<<<<<<',
      line2: '7148392107RUS7901173M3005095790117019<<2<<77',
    },
    biometric: {
      similarity: 89.1,
      liveness: 84,
      verdict: 'match',
      note: 'Cosine 0.891 — identity consistent; scarf occlusion lowered dlib landmark coverage to 71%.',
    },
    ela: {
      tamperPercent: 11.2,
      regions: [
        { id: 'e1', x: 58, y: 14, w: 35, h: 37, label: 'Portrait low-contrast boundary', severity: 'medium' },
      ],
    },
    watchlistHit: true,
    documentData: {
      holderName: 'DMITRI VOLKOV',
      docNumber: '714839210',
      dob: '17 JAN 1979',
      sex: 'M',
      expiry: '09 MAY 2030',
      personalNumber: '790117019<<2',
      issued: 'RUS • Ministry of Foreign Affairs',
      photoSeed: 37,
    },
    notes: [
      'WATCHLIST HIT — passport 714839210 matches red-flag entry WL-0393 (reported stolen, Minsk 2024).',
      'EXIF writer signature indicates re-export from an editing suite 41 days before this scan.',
      'MRZ mathematically intact — forgers routinely preserve the MRZ and alter only the visual page.',
      'AI-artifact channel at 72%: faint spectral lattice over the portrait background.',
    ],
    recommendation: 'HOLD & DETAIN — red-flag watchlist match; escalate to checkpoint commander and seize the document.',
    previewStyle: 'compression',
  },
  {
    id: 'ES-9046',
    travelerName: 'Lina Fernandes',
    documentType: 'Indian Passport',
    docNumber: 'M6620741',
    nationality: 'IND',
    submittedAt: '2026-09-24T15:58:11',
    operator: OPERATOR,
    checkpoint: CHECKPOINT,
    status: 'invalid',
    confidence: 54.1,
    latencyMs: 924,
    metrics: { aiGenerated: 38, photoshop: 24, elaVariance: 31, stampSeal: 76, metadata: 69, mrzChecksum: 100, biometric: 41 },
    mrz: {
      line1: 'P<INDFERNANDES<<LINA<<<<<<<<<<<<<<<<<<<<<<<<',
      line2: 'M6620741<0IND9411287F2612029M66207413<<7<<07',
    },
    biometric: {
      similarity: 41.2,
      liveness: 88,
      verdict: 'impostor',
      note: 'Cosine 0.412 — far below the 0.68 threshold; the live traveler is NOT the portrait holder.',
    },
    ela: {
      tamperPercent: 47.9,
      regions: [
        { id: 'e1', x: 61, y: 13, w: 33, h: 38, label: 'Spliced portrait boundary', severity: 'high' },
        { id: 'e2', x: 8, y: 52, w: 26, h: 20, label: 'Forged MEA seal overlay', severity: 'high' },
        { id: 'e3', x: 14, y: 36, w: 30, h: 11, label: 'Altered date-of-birth block', severity: 'medium' },
      ],
    },
    watchlistHit: false,
    documentData: {
      holderName: 'LINA FERNANDES',
      docNumber: 'M6620741',
      dob: '28 NOV 1994',
      sex: 'F',
      expiry: '02 DEC 2026',
      personalNumber: 'M66207413<<7',
      issued: 'IND • Ministry of External Affairs',
      photoSeed: 51,
    },
    notes: [
      'tampering_model.h5 returns 76% manipulation probability with a hard splice edge at the photo-page junction.',
      'ELA hotspots cover 47.9% of the page — portrait re-encoded at q=60 against a q=90 page background.',
      'GAN frequency lattice detected in the portrait: the photo is machine-generated, not a camera capture.',
      'Live-capture cosine similarity 41.2% → impostor alert; liveness passed, meaning a real human with the wrong face.',
      'MRZ itself is valid — classic "genuine data page with a swapped photo" technique.',
    ],
    recommendation: 'REJECT — seize the document, detain the traveler and export the forensic evidence report.',
    previewStyle: 'splice',
  },
  {
    id: 'ES-9047',
    travelerName: 'Rohan Desai',
    documentType: 'Indian Passport',
    docNumber: 'T9938150',
    nationality: 'IND',
    submittedAt: '2026-09-23T11:26:54',
    operator: 'Insp. Sunita Devi • OP-097',
    checkpoint: CHECKPOINT,
    status: 'invalid',
    confidence: 54.4,
    latencyMs: 688,
    metrics: { aiGenerated: 58, photoshop: 44, elaVariance: 51, stampSeal: 66, metadata: 62, mrzChecksum: 12, biometric: 88 },
    mrz: {
      line1: 'P<INDDESAI<<ROHAN<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      line2: 'T9938150<0IND9002152M3307076T99381505<<3<<82',
    },
    biometric: {
      similarity: 94.8,
      liveness: 93,
      verdict: 'match',
      note: 'Cosine 0.948 — genuine holder. The traveler is real; the document in hand has been altered.',
    },
    ela: {
      tamperPercent: 29.4,
      regions: [
        { id: 'e1', x: 13, y: 36, w: 32, h: 11, label: 'Re-typeset DOB text block', severity: 'high' },
        { id: 'e2', x: 62, y: 16, w: 32, h: 35, label: 'Portrait page re-save', severity: 'medium' },
      ],
    },
    watchlistHit: false,
    documentData: {
      holderName: 'ROHAN DESAI',
      docNumber: 'T9938150',
      dob: '15 FEB 1988',
      sex: 'M',
      expiry: '07 JUL 2033',
      personalNumber: 'T99381505<<3',
      issued: 'IND • Ministry of External Affairs',
      photoSeed: 64,
      printedDob: '15 FEB 1988',
    },
    notes: [
      'ICAO 9303 failure: printed DOB check-digit "2" ≠ locally recalculated "5" (7-3-1 modulo-10).',
      'Composite MRZ checksum cascades — printed "2", recalculated "7" over the edited field.',
      'Data page prints DOB 15 FEB 1988 while the MRZ encodes 900215: the MRZ band was re-typeset.',
      'Biometric confirms the live traveler matches the portrait (94.8%) — genuine holder, forged document.',
    ],
    recommendation: 'REJECT document — MRZ cryptographic failure; detain for fingerprint cross-check.',
    previewStyle: 'splice',
  },
];

export const MOCK_RECORDS: VerificationRecord[] = SEEDS.map((seed) => ({
  ...seed,
  engine: 'localhost:8000',
  findings: buildFindings(seed.metrics),
}));

export const MOCK_WATCHLIST: WatchlistEntry[] = [
  {
    id: 'WL-0393',
    passportNumber: '714839210',
    holderAlias: 'D. VOLKOV / "Mikhail S."',
    reason: 'Stolen passport — reported Minsk 2024',
    addedAt: '2024-11-02',
    origin: 'INTERPOL mirror (offline import)',
  },
  {
    id: 'WL-0417',
    passportNumber: 'K4419283',
    holderAlias: 'Unverified courier identity',
    reason: 'Fraud network — Gulf corridor',
    addedAt: '2025-03-18',
    origin: 'Field HUMINT (SSB 47 Bn)',
  },
  {
    id: 'WL-0451',
    passportNumber: 'P9284011',
    holderAlias: 'Lost-in-transit document',
    reason: 'Lost/stolen TD3 document',
    addedAt: '2025-06-09',
    origin: 'MEA revocation feed (air-gapped)',
  },
  {
    id: 'WL-0466',
    passportNumber: 'X1170042',
    holderAlias: 'Forgery cell cluster B',
    reason: 'Linked to counterfeit workshop',
    addedAt: '2025-08-27',
    origin: 'NIA mirror list',
  },
  {
    id: 'WL-0488',
    passportNumber: 'H6620199',
    holderAlias: 'Duplicate number reuse',
    reason: 'Synthetic identity attempt',
    addedAt: '2026-01-14',
    origin: 'Field HUMINT (SSB 47 Bn)',
  },
  {
    id: 'WL-0499',
    passportNumber: 'E7713820',
    holderAlias: 'Red-team probe',
    reason: 'Training / probe entry',
    addedAt: '2026-04-02',
    origin: 'Operator added (local)',
  },
];

export interface JudgePreset {
  id: string;
  recordId: string;
  label: string;
  tone: 'success' | 'warning' | 'danger';
}

export const JUDGE_PRESETS: JudgePreset[] = [
  { id: 'preset-genuine', recordId: 'ES-9042', label: 'Load Genuine Passport (✓ Verified)', tone: 'success' },
  { id: 'preset-suspicious', recordId: 'ES-9044', label: 'Load Suspicious Compression (⚠ Suspicious)', tone: 'warning' },
  { id: 'preset-forgery', recordId: 'ES-9046', label: 'Load Spliced Forgery (✕ Invalid / Tampered)', tone: 'danger' },
];

export const LOADED_MODELS = [
  { name: 'EasyOCR v1.7', detail: 'EN + MRZ charset · craft_net weights', size: '172 MB', status: 'Loaded' },
  { name: 'tampering_model.h5 CNN', detail: 'ELA heatmap classifier · 4-class softmax', size: '41 MB', status: 'Loaded' },
  { name: 'DeepFace VGG-Face 128-d', detail: 'Cosine 1:1 matcher · threshold 0.68', size: '519 MB', status: 'Loaded' },
  { name: 'dlib 68-Point Liveness', detail: 'Landmark + blink / micro-movement tracker', size: '64 MB', status: 'Loaded' },
];
