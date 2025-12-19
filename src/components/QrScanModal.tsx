import React, { useEffect, useMemo, useRef, useState } from 'react';
import BaseModal from './BaseModal';
import Button from './Button';

type QrScanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (value: string) => void;
};

const isBarcodeDetectorAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
};

const normalizeCode = (raw: string): string | null => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length < 4) return null;
  return digits.slice(0, 4);
};

const QrScanModal: React.FC<QrScanModalProps> = ({ isOpen, onClose, onDetected }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const canScan = useMemo(() => isBarcodeDetectorAvailable(), []);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (!canScan) {
      setError('QR scanning is not supported in this browser. Type the 4-digit code instead.');
      return;
    }

    let cancelled = false;

    const start = async () => {
      setIsStarting(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          setError('Camera unavailable.');
          setIsStarting(false);
          return;
        }

        video.srcObject = stream;
        await video.play();

        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

        const tick = async () => {
          if (cancelled) return;
          try {
            const results = await detector.detect(video);
            const raw = results?.[0]?.rawValue;
            const code = raw ? normalizeCode(raw) : null;
            if (code) {
              onDetected(code);
              onClose();
              return;
            }
          } catch {
            // Ignore per-frame detection errors.
          }
          rafRef.current = window.requestAnimationFrame(() => void tick());
        };

        rafRef.current = window.requestAnimationFrame(() => void tick());
        setIsStarting(false);
      } catch {
        setError('Could not access camera. Check permissions and try again.');
        setIsStarting(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [canScan, isOpen, onClose, onDetected]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Scan QR Code" maxWidth="md">
      <p className="text-text-secondary text-sm">
        Point the camera at the QR code on the credential screen. The 4-digit code will fill automatically.
      </p>

      <div className="mt-5">
        <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-border-subtle bg-black">
          <video ref={videoRef} className="w-full aspect-square object-cover" playsInline muted />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 ring-1 ring-white/10"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-[var(--r-lg)] border border-urgency-high bg-urgency-high/10 p-3">
            <p className="text-sm font-semibold text-urgency-high">{error}</p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <div className="text-xs text-text-secondary">
            {isStarting ? 'Starting camera…' : 'Ready'}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default QrScanModal;

