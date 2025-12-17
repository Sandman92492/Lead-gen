import React, { useMemo } from 'react';
import { makeNumericQr, type QrEcl } from '../utils/qr';

type QrCodeProps = {
  value: string | null;
  ecl?: QrEcl;
  sizePx?: number;
  className?: string;
  label?: string;
};

const QUIET_ZONE = 4; // modules

const QrCode: React.FC<QrCodeProps> = ({ value, ecl = 'M', sizePx = 192, className = '', label = 'QR code' }) => {
  const qr = useMemo(() => makeNumericQr(String(value || ''), ecl), [ecl, value]);
  const total = qr.size + QUIET_ZONE * 2;

  return (
    <svg
      className={className}
      width={sizePx}
      height={sizePx}
      viewBox={`0 0 ${total} ${total}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect x="0" y="0" width={total} height={total} fill="#FFFFFF" />
      {qr.modules.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c + QUIET_ZONE}
              y={r + QUIET_ZONE}
              width="1"
              height="1"
              fill="#0B1220"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export default QrCode;

