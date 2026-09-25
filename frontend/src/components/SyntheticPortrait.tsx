import { useMemo } from 'react';
import { cn } from '../utils/format';

interface SyntheticPortraitProps {
  seed: number;
  className?: string;
  /** Overlay the 128-d facial landmark mesh. */
  mesh?: boolean;
  /** Show as grayscale "document photo" style. */
  docStyle?: boolean;
  ariaLabel?: string;
}

/** Deterministic mulberry32 PRNG so a seed always renders the same face. */
function makeRng(seed: number) {
  let a = seed * 1103515245 + 12345;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SKIN = ['#c98d6b', '#a9714f', '#8a5a3e', '#e0b394', '#6f4630', '#b9805e'];
const HAIR = ['#151922', '#2b2018', '#39302a', '#0f1218', '#4a3423'];

/** Landmark points approximating dlib's 68-point map on a 100×120 canvas. */
const JAW = [
  [30, 78], [31, 86], [34, 93], [39, 99], [46, 103], [54, 103], [61, 99], [66, 93], [69, 86], [70, 78],
];
const BROW_L = [[33, 50], [38, 47], [44, 46], [48, 48]];
const BROW_R = [[52, 48], [56, 46], [62, 47], [67, 50]];
const EYE_L = [[35, 57], [39, 55], [44, 55], [47, 57], [44, 60], [39, 60]];
const EYE_R = [[53, 57], [56, 55], [61, 55], [65, 57], [61, 60], [56, 60]];
const NOSE = [[50, 60], [50, 66], [46, 71], [50, 73], [54, 71]];
const MOUTH = [[41, 81], [46, 79], [50, 78], [54, 79], [59, 81], [54, 85], [46, 85]];
const MESH_LINES = [JAW, BROW_L, BROW_R, EYE_L, EYE_R, NOSE, MOUTH];
const ALL_POINTS = [...JAW, ...BROW_L, ...BROW_R, ...EYE_L, ...EYE_R, ...NOSE, ...MOUTH];

export default function SyntheticPortrait({
  seed,
  className,
  mesh = false,
  docStyle = false,
  ariaLabel,
}: SyntheticPortraitProps) {
  const parts = useMemo(() => {
    const rng = makeRng(seed || 1);
    const skin = SKIN[Math.floor(rng() * SKIN.length)];
    const hair = HAIR[Math.floor(rng() * HAIR.length)];
    const hairVariant = Math.floor(rng() * 4);
    const browTilt = (rng() - 0.5) * 6;
    const mouthCurve = (rng() - 0.5) * 4;
    const headW = 23 + rng() * 3;
    const bg = rng() > 0.5 ? ['#101827', '#0c1322'] : ['#0e1524', '#111a2c'];
    return { skin, hair, hairVariant, browTilt, mouthCurve, headW, bg };
  }, [seed]);

  const { skin, hair, hairVariant, browTilt, mouthCurve, headW, bg } = parts;

  const hairPaths = [
    // short cap
    `M26 48 C27 26 40 17 50 17 C60 17 73 26 74 48 C70 36 62 31 50 31 C38 31 30 36 26 48 Z`,
    // buzz
    `M28 46 C29 28 39 20 50 20 C61 20 71 28 72 46 C68 34 60 30 50 30 C40 30 32 34 28 46 Z`,
    // swept
    `M25 50 C24 27 38 16 52 17 C66 18 75 28 74 44 C71 33 64 29 55 28 C45 27 34 33 31 44 C30 47 27 50 25 50 Z`,
    // longer sides
    `M24 62 C23 30 36 16 50 16 C64 16 77 30 76 62 C74 48 72 38 66 32 C60 26 40 26 34 32 C28 38 26 48 24 62 Z`,
  ];

  return (
    <div className={cn('relative overflow-hidden', className)} role="img" aria-label={ariaLabel ?? 'Synthetic traveler portrait'}>
      <svg viewBox="0 0 100 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`bg${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={bg[0]} />
            <stop offset="100%" stopColor={bg[1]} />
          </linearGradient>
          <radialGradient id={`glow${seed}`} cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(6,182,212,0.22)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0)" />
          </radialGradient>
          <linearGradient id={`skin${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skin} stopOpacity="1" />
            <stop offset="100%" stopColor={skin} stopOpacity="0.82" />
          </linearGradient>
        </defs>

        <rect width="100" height="120" fill={`url(#bg${seed})`} />
        <rect width="100" height="120" fill={`url(#glow${seed})`} />
        {/* shoulders */}
        <path d="M8 120 C12 100 28 92 50 92 C72 92 88 100 92 120 Z" fill="#1b2536" />
        <path d="M42 92 L50 104 L58 92 Z" fill="#243249" />
        {/* neck */}
        <rect x="43" y="78" width="14" height="18" rx="6" fill={`url(#skin${seed})`} />
        {/* head */}
        <ellipse cx="50" cy="56" rx={headW} ry="30" fill={`url(#skin${seed})`} />
        {/* ears */}
        <ellipse cx={50 - headW} cy="58" rx="3.4" ry="5" fill={skin} />
        <ellipse cx={50 + headW} cy="58" rx="3.4" ry="5" fill={skin} />
        {/* hair */}
        <path d={hairPaths[hairVariant]} fill={hair} />
        {/* brows */}
        <g stroke={hair} strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d={`M34 ${50 + browTilt} L48 ${48 - browTilt * 0.4}`} />
          <path d={`M52 ${48 - browTilt * 0.4} L66 ${50 + browTilt}`} />
        </g>
        {/* eyes */}
        <g>
          <ellipse cx="41" cy="57" rx="6" ry="3.4" fill="#f4f6f8" />
          <ellipse cx="59" cy="57" rx="6" ry="3.4" fill="#f4f6f8" />
          <circle cx="41.5" cy="57" r="2.3" fill="#26303f" />
          <circle cx="58.5" cy="57" r="2.3" fill="#26303f" />
          <circle cx="41.5" cy="57" r="1" fill="#0b0e14" />
          <circle cx="58.5" cy="57" r="1" fill="#0b0e14" />
          <circle cx="42.4" cy="56.1" r="0.6" fill="#ffffff" opacity="0.9" />
          <circle cx="59.4" cy="56.1" r="0.6" fill="#ffffff" opacity="0.9" />
        </g>
        {/* nose */}
        <path d="M50 60 L47 71 Q50 73.5 53 71" stroke="rgba(0,0,0,0.35)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* mouth */}
        <path
          d={`M41 ${81 + mouthCurve * 0.3} Q50 ${86 + mouthCurve} 59 ${81 - mouthCurve * 0.3}`}
          stroke="#7d3f3f"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* cheek shading */}
        <ellipse cx="34" cy="68" rx="5" ry="7" fill="rgba(0,0,0,0.08)" />
        <ellipse cx="66" cy="68" rx="5" ry="7" fill="rgba(0,0,0,0.08)" />

        {docStyle && <rect width="100" height="120" fill="rgba(120,140,170,0.06)" />}
      </svg>

      {mesh && (
        <svg viewBox="0 0 100 120" className="absolute inset-0 h-full w-full animate-fadeIn" aria-hidden="true">
          <g stroke="rgba(6,182,212,0.75)" strokeWidth="0.6" fill="none">
            {MESH_LINES.map((line, i) => (
              <polyline key={i} points={line.map((p) => p.join(',')).join(' ')} />
            ))}
            <polyline points={JAW.map((p) => p.join(',')).join(' ')} opacity="0.5" />
          </g>
          <g fill="#06B6D4">
            {ALL_POINTS.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r="1.1" opacity="0.95" />
            ))}
          </g>
          {/* corner brackets */}
          <g stroke="#06B6D4" strokeWidth="1.4" fill="none">
            <path d="M6 16 L6 8 L14 8" />
            <path d="M94 16 L94 8 L86 8" />
            <path d="M6 104 L6 112 L14 112" />
            <path d="M94 104 L94 112 L86 112" />
          </g>
        </svg>
      )}
    </div>
  );
}
