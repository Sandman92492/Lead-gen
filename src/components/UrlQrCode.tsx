import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type UrlQrCodeProps = {
  value: string;
  sizePx?: number;
  className?: string;
  onDataUrl?: (dataUrl: string) => void;
};

const UrlQrCode: React.FC<UrlQrCodeProps> = ({ value, sizePx = 320, className = '', onDataUrl }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setDataUrl(null);
    void (async () => {
      try {
        const next = await QRCode.toDataURL(value, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: Math.max(512, sizePx * 2),
          color: { dark: '#0B1220', light: '#FFFFFF' },
        });
        if (!mounted) return;
        setDataUrl(next);
        onDataUrl?.(next);
      } catch {
        if (!mounted) return;
        setDataUrl(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [onDataUrl, sizePx, value]);

  if (!dataUrl) {
    return (
      <div className={`grid place-items-center rounded-2xl border border-border-subtle bg-bg-primary ${className}`} style={{ width: sizePx, height: sizePx }}>
        <div className="text-xs font-semibold text-text-secondary">Generating QR…</div>
      </div>
    );
  }

  return <img src={dataUrl} alt="QR code" className={className} width={sizePx} height={sizePx} />;
};

export default UrlQrCode;

