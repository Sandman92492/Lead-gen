import QRCode from 'qrcode';

export type QrEcl = 'L' | 'M' | 'Q' | 'H';

export const makeNumericQr = (value: string, ecl: QrEcl = 'M'): { size: number; modules: boolean[][] } => {
  const qr = (QRCode as any).create(String(value || ''), { errorCorrectionLevel: ecl });
  const size = qr.modules.size;
  const data = qr.modules.data as unknown as boolean[];

  const modules = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => Boolean(data[row * size + col]))
  );

  return { size, modules };
};

export const generateQrDataUrl = async (value: string, sizePx = 512): Promise<string> => {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: Math.max(512, sizePx * 2),
    color: { dark: '#0B1220', light: '#FFFFFF' },
  });
};
