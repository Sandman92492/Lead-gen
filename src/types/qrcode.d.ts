declare module 'qrcode' {
  export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

  export type QRCodeToDataURLOptions = {
    errorCorrectionLevel?: ErrorCorrectionLevel;
    margin?: number;
    width?: number;
    color?: { dark?: string; light?: string };
  };

  export const toDataURL: (text: string, options?: QRCodeToDataURLOptions) => Promise<string>;

  const QRCode: {
    toDataURL: typeof toDataURL;
  };

  export default QRCode;
}

