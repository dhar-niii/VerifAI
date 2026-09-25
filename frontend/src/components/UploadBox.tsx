import { useEffect, useRef, useState } from 'react';
import { FileText, Trash2, UploadCloud } from 'lucide-react';
import { cn } from '../utils/format';
import ProgressBar from './ProgressBar';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'application/pdf'];
const ACCEPT_EXT = '.jpg,.jpeg,.png,.pdf';

interface UploadBoxProps {
  file: File | null;
  imageSrc: string | null;
  onFile: (file: File, previewUrl: string | null) => void;
  onClear: () => void;
  onError: (message: string) => void;
  busy?: boolean;
}

function validate(file: File): string | null {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!ACCEPTED.includes(file.type) && !['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
    return 'Please upload a valid document (JPG, PNG, or PDF).';
  }
  if (file.size > MAX_BYTES) {
    return 'File size exceeds the 10 MB limit.';
  }
  return null;
}

export default function UploadBox({ file, imageSrc, onFile, onClear, onError, busy = false }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const ingest = (candidate: File) => {
    const error = validate(candidate);
    if (error) {
      onError(error);
      return;
    }
    // Client-side upload progress simulation (edge node is local, so it's quick).
    setUploading(true);
    setProgress(0);
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    const steps = [18, 42, 67, 86, 100];
    steps.forEach((value, i) => {
      const t = window.setTimeout(() => {
        setProgress(value);
        if (value === 100) {
          const isImage = candidate.type.startsWith('image/');
          const url = isImage ? URL.createObjectURL(candidate) : null;
          setUploading(false);
          onFile(candidate, url);
        }
      }, 130 * (i + 1));
      timers.current.push(t);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) ingest(dropped);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative overflow-hidden rounded-xl border-2 border-dashed p-5 text-center transition-all duration-200',
          dragging
            ? 'animate-borderPulse border-cyber bg-cyber/5'
            : 'border-edge bg-obsidian/60 hover:border-cyber/50',
        )}
      >
        {file ? (
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-edge bg-surface text-cyber">
              {imageSrc ? (
                <img src={imageSrc} alt="" className="h-11 w-11 rounded-lg object-cover" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
              <p className="font-mono text-[10px] text-mist">
                {(file.size / 1024).toFixed(0)} KB · {file.type || 'document'} · staged for ingest
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClear();
                setProgress(0);
              }}
              className="rounded-md p-2 text-mist transition hover:bg-red-500/10 hover:text-red-400"
              aria-label="Remove uploaded document"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud
              className={cn('mx-auto h-9 w-9 transition-colors', dragging ? 'text-cyber' : 'text-mist')}
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-semibold text-ink">
              {dragging ? 'Release to stage document' : 'Drag & drop passport scan'}
            </p>
            <p className="mt-1 text-xs text-mist">
              Supported: JPG, PNG, PDF · Max file size 10 MB
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className={cn(
                'mt-3 inline-flex h-9 items-center rounded-lg border border-edge bg-surface px-4 text-xs font-semibold text-ink transition',
                'hover:border-cyber/60 hover:text-cyber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber/70',
                busy && 'cursor-not-allowed opacity-50',
              )}
            >
              Browse Files
            </button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_EXT}
          className="sr-only"
          aria-label="Upload document file"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            if (picked) ingest(picked);
            e.target.value = '';
          }}
        />

        {uploading && (
          <div className="absolute inset-x-0 bottom-0 bg-obsidian/95 px-5 py-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="mono-label">Transferring to edge node</span>
              <span className="font-mono text-[11px] font-bold text-cyber">{progress}%</span>
            </div>
            <ProgressBar value={progress} tone="cyan" delay={0} ariaLabel="Upload progress" />
          </div>
        )}
      </div>
    </div>
  );
}
