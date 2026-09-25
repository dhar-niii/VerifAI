import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Code2, MessageCircle } from 'lucide-react';
import { Logo } from './Navbar';
import Modal from './Modal';

type DocKey = 'privacy' | 'terms' | 'docs' | 'contact' | null;

const DOC_CONTENT: Record<Exclude<DocKey, null>, { title: string; body: string[] }> = {
  privacy: {
    title: 'Privacy Policy',
    body: [
      'VerifAI is engineered for zero cloud egress. Biometric PII, document images and webcam frames never leave the field laptop — inference runs entirely on localhost:8000.',
      'Verification dossiers are stored in the local encrypted SQLite store on the checkpoint terminal and are retained per your unit’s evidentiary retention policy.',
      'The red-flag watchlist is an air-gapped encrypted database synced through signed offline imports only. No analytics, telemetry or crash reporting is transmitted.',
      'All training data for the CNN, OCR and biometric models is synthetic (GAN faces + algorithmic MRZ templates), so no citizen PII was ever used to train the engines.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      'VerifAI outputs are decision-support signals, not legal determinations. Officers must follow unit SOP for secondary inspection, detention and seizure.',
      'Every verdict is accompanied by a forensic dossier; officers remain accountable for the final clearance decision recorded under their service ID.',
      'Deployment of VerifAI at a checkpoint implies acceptance of local data-retention, evidence-handling and audit requirements.',
      'The offline simulation mode exists for training and demonstration; production verdicts must be executed against a signed model-weight manifest.',
    ],
  },
  docs: {
    title: 'Documentation',
    body: [
      'Quick start: run the FastAPI edge engine, open the terminal, authenticate the operator, then stage a scan at /verify.',
      'Module 1 — EasyOCR extracts the TD3 MRZ and the 7-3-1 modulo-10 check-digits are recalculated locally for document number, DOB, expiry and the composite field.',
      'Module 2 — OpenCV generates an ELA heatmap at q=75→90 which the tampering_model.h5 CNN classifies into authentic / spliced / re-encoded / synthetic.',
      'Module 3 — DeepFace computes a 128-d VGG-Face embedding for 1:1 cosine matching while dlib tracks 68 landmarks for blink and micro-movement liveness.',
    ],
  },
  contact: {
    title: 'Contact',
    body: [
      'Field support: verifai-fieldops@secure.local · 24×7 checkpoint hotline for deployment and model-weight verification issues.',
      'Procurement & integration: verifai-integration@secure.local — air-gapped bundle, offline watchlist sync and unit onboarding.',
      'Security disclosures: verifai-psirt@secure.local · PGP key distributed through the unit’s secure channel.',
      'HQ: VerifAI Systems — Edge Forensics Division, deployed alongside Sashastra Seema Bal field checkpoints.',
    ],
  },
};

const PRODUCT = [
  { label: 'Verify Document', to: '/verify' },
  { label: 'Command Dashboard', to: '/dashboard' },
  { label: 'Verification History', to: '/history' },
  { label: 'Sample Dossier', to: '/report/ES-9042' },
  { label: 'Edge Node Settings', to: '/settings' },
];

const ARCH = [
  { label: 'MRZ Cryptographic Engine', to: '/#features' },
  { label: 'ELA & CNN Tamper Scan', to: '/#features' },
  { label: 'DeepFace 1:1 Biometrics', to: '/#features' },
  { label: 'Air-Gapped Architecture', to: '/#security' },
];

export default function Footer() {
  const [doc, setDoc] = useState<DocKey>(null);

  return (
    <footer className="border-t border-edge bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">
              Forensic-grade document &amp; biometric screening at the network edge. 100% offline, zero cloud
              dependency, sub-second verdicts.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {[
                { icon: Code2, label: 'VerifAI on GitHub', href: 'https://github.com' },
                { icon: MessageCircle, label: 'VerifAI on X', href: 'https://x.com' },
                { icon: Briefcase, label: 'VerifAI on LinkedIn', href: 'https://www.linkedin.com' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-surface text-mist transition hover:border-cyber/50 hover:text-cyber"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <h3 className="mono-label text-ink">Product</h3>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-mist transition hover:text-cyber">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Architecture */}
          <nav aria-label="Architecture">
            <h3 className="mono-label text-ink">Architecture</h3>
            <ul className="mt-4 space-y-2.5">
              {ARCH.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-mist transition hover:text-cyber">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/settings" className="text-sm text-mist transition hover:text-cyber">
                  Model Weights &amp; Watchlist
                </Link>
              </li>
            </ul>
          </nav>

          {/* Documentation / Legal */}
          <nav aria-label="Documentation and legal">
            <h3 className="mono-label text-ink">Documentation</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <button type="button" onClick={() => setDoc('docs')} className="text-sm text-mist transition hover:text-cyber">
                  Quick Start &amp; API Reference
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setDoc('privacy')} className="text-sm text-mist transition hover:text-cyber">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setDoc('terms')} className="text-sm text-mist transition hover:text-cyber">
                  Terms of Service
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setDoc('contact')} className="text-sm text-mist transition hover:text-cyber">
                  Contact
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-edge pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-mist">
            © 2026 VerifAI Systems · Edge Forensics Division · Built for air-gapped border terminals
          </p>
          <p className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            All systems nominal · localhost:8000
          </p>
        </div>
      </div>

      <Modal
        open={doc !== null}
        onClose={() => setDoc(null)}
        title={doc ? DOC_CONTENT[doc].title : ''}
        subtitle="VerifAI · edge deployment handbook"
        size="lg"
        footer={
          <button
            type="button"
            onClick={() => setDoc(null)}
            className="h-9 rounded-lg bg-tactical px-4 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            Close
          </button>
        }
      >
        <div className="space-y-3">
          {(doc ? DOC_CONTENT[doc].body : []).map((para) => (
            <p key={para} className="text-sm leading-relaxed text-mist">
              {para}
            </p>
          ))}
        </div>
      </Modal>
    </footer>
  );
}
