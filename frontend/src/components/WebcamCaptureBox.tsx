import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Camera, CameraOff, ImageUp, RotateCcw, UserRound } from 'lucide-react';
import { cn } from '../utils/format';
import SyntheticPortrait from './SyntheticPortrait';

export interface WebcamHandle {
  /** Snapshot the current live frame as a data URL, or null when unavailable. */
  snapshot: () => string | null;
}

interface WebcamCaptureBoxProps {
  selfieSrc: string | null;
  onSelfie: (dataUrl: string | null) => void;
  onError: (message: string) => void;
}

const SIM_SEED = 77;

const WebcamCaptureBox = forwardRef<WebcamHandle, WebcamCaptureBoxProps>(function WebcamCaptureBox(
  { selfieSrc, onSelfie, onError },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [mode, setMode] = useState<'simulated' | 'camera' | 'selfie'>('simulated');

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  useEffect(() => () => stopCamera(), []);

  useImperativeHandle(
    ref,
    () => ({
      snapshot: () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2 || !cameraOn) return null;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          return canvas.toDataURL('image/jpeg', 0.85);
        } catch {
          return null;
        }
      },
    }),
    [cameraOn],
  );

  const toggleCamera = async () => {
    if (cameraOn) {
      stopCamera();
      setMode(selfieSrc ? 'selfie' : 'simulated');
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      setMode('camera');
      // Attach after the element mounts.
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 0);
    } catch {
      setCameraOn(false);
      setMode(selfieSrc ? 'selfie' : 'simulated');
      onError('Camera unavailable — running simulated USB webcam feed.');
    }
  };

  const onSelfiePicked = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('Please upload a valid image for the traveler selfie (JPG or PNG).');
      return;
    }
    if (file.size > MAX_SELFIE) {
      onError('File size exceeds the 10 MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onSelfie(String(reader.result));
      setMode('selfie');
      stopCamera();
    };
    reader.onerror = () => onError('Could not read that image — please try another file.');
    reader.readAsDataURL(file);
  };

  const label =
    mode === 'camera' ? 'USB CAMERA · LIVE 720P' : mode === 'selfie' ? 'UPLOADED TRAVELER SELFIE' : 'SIMULATED USB FEED · 30FPS';

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-edge bg-obsidian">
        {/* Feed */}
        {mode === 'selfie' && selfieSrc ? (
          <img src={selfieSrc} alt="Live traveler capture" className="h-full w-full object-cover" />
        ) : mode === 'camera' ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full -scale-x-100 object-cover"
            aria-label="Live webcam feed"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b1322] to-[#0a0f1b]" />
            <SyntheticPortrait
              seed={SIM_SEED}
              className="absolute inset-0 opacity-95"
              ariaLabel="Simulated live traveler feed"
            />
            <div
              className="absolute inset-x-0 top-0 h-12 animate-scanLine bg-gradient-to-b from-transparent via-cyber/20 to-transparent"
              aria-hidden="true"
            />
          </>
        )}

        {/* Facial alignment bounding box */}
        <div
          className="pointer-events-none absolute left-1/2 top-[46%] h-[58%] w-[52%] -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <div className={cn('h-full w-full rounded-md border border-dashed', cameraOn ? 'border-cyber' : 'border-cyber/70', 'shadow-[0_0_24px_-6px_rgba(6,182,212,0.7)]')}>
            <span className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-cyber" />
            <span className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-cyber" />
            <span className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-cyber" />
            <span className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-cyber" />
          </div>
          <span className="absolute -top-5 left-0 font-mono text-[9px] font-bold tracking-widest text-cyber">
            FACE BOX · 68 LANDMARKS
          </span>
        </div>

        {/* HUD */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-md border border-edge bg-black/65 px-2 py-1 backdrop-blur-sm">
          <span className={cn('h-1.5 w-1.5 rounded-full bg-red-500', cameraOn ? 'animate-blink' : 'opacity-60')} />
          <span className="font-mono text-[9px] font-bold tracking-wider text-ink">{label}</span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 rounded-md border border-edge bg-black/65 px-2 py-1 font-mono text-[9px] text-mist backdrop-blur-sm">
          {mode === 'camera' ? 'CAM_01' : mode === 'selfie' ? 'IMG_UP' : 'SIM_01'} · liveness armed
        </div>

        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleCamera}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition',
            cameraOn
              ? 'border-cyber/50 bg-cyber/10 text-cyber hover:bg-cyber/20'
              : 'border-edge bg-surface text-ink hover:border-cyber/60 hover:text-cyber',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber/70',
          )}
          aria-pressed={cameraOn}
        >
          {cameraOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {cameraOn ? 'Stop Camera' : 'Enable USB Camera'}
        </button>

        <label
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-edge bg-surface px-3 text-xs font-semibold text-ink transition',
            'hover:border-cyber/60 hover:text-cyber focus-within:ring-2 focus-within:ring-cyber/70',
          )}
        >
          <ImageUp className="h-4 w-4" aria-hidden="true" />
          Upload Selfie
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            className="sr-only"
            aria-label="Upload traveler selfie"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onSelfiePicked(f);
              e.target.value = '';
            }}
          />
        </label>

        {selfieSrc && (
          <button
            type="button"
            onClick={() => {
              onSelfie(null);
              setMode('simulated');
            }}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-edge bg-surface px-3 text-xs font-semibold text-mist transition hover:border-red-500/50 hover:text-red-400"
            aria-label="Clear uploaded selfie"
          >
            <RotateCcw className="h-4 w-4" /> Clear
          </button>
        )}

        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] text-mist">
          <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
          1:1 DeepFace matching armed
        </span>
      </div>
    </div>
  );
});

const MAX_SELFIE = 10 * 1024 * 1024;

export default WebcamCaptureBox;
