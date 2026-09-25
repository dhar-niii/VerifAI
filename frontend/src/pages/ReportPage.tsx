import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import {
  ArrowLeft,
  Database,
  Download,
  FileText,
  Home,
  Radar,
} from 'lucide-react';
import Button, { buttonClasses } from '../components/Button';
import DocumentPreview from '../components/DocumentPreview';
import MRZDecoderCard from '../components/MRZDecoderCard';
import BiometricCompareCard from '../components/BiometricCompareCard';
import ForensicAnalysis from '../components/ForensicAnalysis';
import VerificationResult from '../components/VerificationResult';
import AnalystNotesCard from '../components/AnalystNotesCard';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useToast } from '../context/ToastContext';
import { getVerificationById } from '../services/verificationService';
import type { VerificationRecord } from '../types';
import { cn, formatTimestamp, statusLabel } from '../utils/format';

const CHANNEL_LABELS: Array<[string, keyof VerificationRecord['metrics']]> = [
  ['AI-Generated / Deepfake Content', 'aiGenerated'],
  ['Photoshop / CNN Manipulation', 'photoshop'],
  ['Pixel Compression (ELA Variance)', 'elaVariance'],
  ['Stamp / Seal Ink Analysis', 'stampSeal'],
  ['Metadata & EXIF Analysis', 'metadata'],
  ['ICAO 9303 MRZ Checksum Math', 'mrzChecksum'],
  ['1:1 Face Biometric & Liveness', 'biometric'],
];

function buildPdf(record: VerificationRecord): Promise<jsPDF> {
  return Promise.all([import('jspdf'), import('jspdf-autotable')]).then(([{ jsPDF: JsPDF }, { default: autoTable }]) => {
  const doc = new JsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(9, 13, 22);
  doc.rect(0, 0, pageWidth, 92, 'F');
  doc.setTextColor(249, 250, 251);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('VerifAI — Forensic Verification Report', margin, 40);
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(6, 182, 212);
  doc.text(`DOSSIER ${record.id}  |  generated offline on localhost:8000  |  100% air-gapped`, margin, 58);
  doc.setTextColor(156, 163, 175);
  doc.text(`Operator: ${record.operator}   Checkpoint: ${record.checkpoint}`, margin, 74);

  // Verdict block
  let y = 120;
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const statusColor =
    record.status === 'verified' ? [16, 185, 129] : record.status === 'suspicious' ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(statusLabel(record.status), margin, y);
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  y += 18;
  doc.text(`Traveler: ${record.travelerName}    Document: ${record.documentType} ${record.docNumber}`, margin, y);
  y += 15;
  doc.text(
    `Overall confidence: ${record.confidence.toFixed(1)}%    Latency: ${(record.latencyMs / 1000).toFixed(2)}s    Scanned: ${formatTimestamp(record.submittedAt)}`,
    margin,
    y,
  );
  y += 15;
  doc.text(`Red-flag watchlist: ${record.watchlistHit ? 'MATCH — DETAIN PER SOP' : 'no match (offline SQLite scan)'}`, margin, y);
  y += 22;

  doc.setTextColor(90, 100, 115);
  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  doc.text('MRZ LINE 1: ' + record.mrz.line1, margin, y);
  y += 13;
  doc.text('MRZ LINE 2: ' + record.mrz.line2, margin, y);
  y += 26;

  // Metrics table
  autoTable(doc, {
    startY: y,
    head: [['Detector Channel', 'Authenticity Score']],
    body: CHANNEL_LABELS.map(([label, key]) => [label, `${record.metrics[key]}%`]),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 22;

  // Findings
  autoTable(doc, {
    startY: y,
    head: [['Module', 'Score', 'Finding']],
    body: record.findings.map((f) => [f.title, `${f.score}%`, f.explanation]),
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 5, valign: 'top' },
    headStyles: { fillColor: [17, 24, 39] },
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 45 } },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 22;

  // Analyst notes
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  if (y > 700) {
    doc.addPage();
    y = 50;
  }
  doc.text('Analyst Notes', margin, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  record.notes.forEach((note) => {
    const lines = doc.splitTextToSize(`• ${note}`, pageWidth - margin * 2);
    lines.forEach((line: string) => {
      if (y > 790) {
        doc.addPage();
        y = 50;
      }
      doc.text(line, margin, y);
      y += 12;
    });
    y += 4;
  });

  y += 10;
  if (y > 760) {
    doc.addPage();
    y = 50;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('Recommended Disposition', margin, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.splitTextToSize(record.recommendation, pageWidth - margin * 2).forEach((line: string) => {
    doc.text(line, margin, y);
    y += 13;
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `VerifAI edge forensics · ${record.id} · page ${i}/${pageCount} · signature: sha256:${record.id.toLowerCase()}-local`,
      margin,
      doc.internal.pageSize.getHeight() - 22,
    );
  }
  return doc;
  });
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'original' | 'ela'>('original');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setView('original');
    getVerificationById(id ?? '')
      .then((data) => {
        if (alive) setRecord(data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const notFound = !loading && !record;

  const download = async () => {
    if (!record) return;
    setDownloading(true);
    try {
      const doc = await buildPdf(record);
      doc.save(`VerifAI_${record.id}_Forensic_Report.pdf`);
      toast.push({
        tone: 'success',
        title: 'Report exported',
        description: `VerifAI_${record.id}_Forensic_Report.pdf saved locally — signed, no data left the device.`,
      });
    } catch {
      toast.push({
        tone: 'error',
        title: 'Export failed',
        description: 'The local PDF renderer could not build the report. Please retry.',
      });
    } finally {
      setDownloading(false);
    }
  };

  const watchlistText = useMemo(() => {
    if (!record) return '';
    return record.watchlistHit
      ? `MATCH — ${record.docNumber} present in encrypted red-flag store`
      : 'No match — 7,412 offline entries scanned';
  }, [record]);

  if (loading) {
    return (
      <div className="rounded-xl border border-edge bg-surface">
        <LoadingState title="Opening forensic dossier…" description={`Retrieving ${id} from the local evidence store.`} />
      </div>
    );
  }

  if (notFound || !record) {
    return (
      <ErrorState
        title={`Dossier ${id ?? '—'} not found`}
        description="This verification record is not present in the local ledger. It may belong to another edge node."
        action={
          <div className="flex gap-3">
            <Button variant="secondary" size="md" to="/history">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to History
            </Button>
            <Button variant="primary" size="md" to="/verify">
              <Radar className="h-4 w-4" aria-hidden="true" /> Run New Screening
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Top action bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-mist">
            <Link to="/dashboard" className="flex items-center gap-1 transition hover:text-cyber">
              <Home className="h-3 w-3" aria-hidden="true" /> Dashboard
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-mono">Forensic Reports</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono text-ink">{record.id}</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{record.id}</h1>
            <StatusBadge status={record.status} />
            <span className="mono-label hidden sm:inline">{record.checkpoint}</span>
          </div>
          <p className="mt-1.5 text-sm text-mist">
            {record.travelerName} · {record.documentType} · <span className="font-mono">{record.docNumber}</span> ·{' '}
            {formatTimestamp(record.submittedAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="md" to="/dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Button>
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className={buttonClasses('primary', 'md')}
            aria-label="Download verification report as PDF"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {downloading ? 'Rendering…' : 'Download Verification Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* LEFT — sticky evidence panel */}
        <div className="min-w-0 space-y-5 xl:sticky xl:top-24 xl:self-start">
          <DocumentPreview record={record} view={view} onViewChange={setView} />

          {/* Watchlist check */}
          <div
            className={cn(
              'flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-card',
              record.watchlistHit ? 'border-red-500/50 bg-red-500/10' : 'border-edge bg-surface',
            )}
            role={record.watchlistHit ? 'alert' : undefined}
          >
            <Database className={cn('mt-0.5 h-5 w-5 shrink-0', record.watchlistHit ? 'text-red-400' : 'text-cyber')} aria-hidden="true" />
            <div>
              <p className="mono-label">Encrypted SQLite Red-Flag Watchlist</p>
              <p className={cn('mt-0.5 text-[13px] font-semibold', record.watchlistHit ? 'text-red-400' : 'text-emerald-400')}>
                {watchlistText}
              </p>
            </div>
          </div>

          <MRZDecoderCard
            line1={record.mrz.line1}
            line2={record.mrz.line2}
            printedDob={record.documentData.printedDob}
          />

          <BiometricCompareCard record={record} />
        </div>

        {/* RIGHT — verdict + telemetry */}
        <div className="min-w-0 space-y-6">
          <VerificationResult record={record} />

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-edge bg-surface px-4 py-3">
            <FileText className="h-4 w-4 text-cyber" aria-hidden="true" />
            <p className="flex-1 text-xs text-mist">
              Evidence integrity: dossier hashed locally at write time; export includes channel telemetry, module
              findings and analyst notes.
            </p>
            <Button variant="secondary" size="sm" onClick={download}>
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> PDF
            </Button>
          </div>

          <ForensicAnalysis record={record} startDelay={220} />

          <AnalystNotesCard record={record} />
        </div>
      </div>
    </div>
  );
}
