type Bit = 0 | 1;

export type QrEcl = 'L' | 'M';

export type QrMatrix = {
  size: number;
  modules: Bit[][];
};

const SIZE = 21;
const MASK_PATTERN = 0; // (r + c) % 2 === 0

const DATA_CODEWORDS: Record<QrEcl, number> = { L: 19, M: 16 };
const ECC_CODEWORDS: Record<QrEcl, number> = { L: 7, M: 10 };

const ECL_BITS: Record<QrEcl, number> = {
  // Per QR spec: L=01, M=00
  L: 0b01,
  M: 0b00,
};

const GF_POLY = 0x11d;
const gfExp = new Uint8Array(512);
const gfLog = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    gfExp[i] = x;
    gfLog[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= GF_POLY;
  }
  for (let i = 255; i < 512; i += 1) {
    gfExp[i] = gfExp[i - 255];
  }
})();

const gfMul = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  return gfExp[gfLog[a] + gfLog[b]];
};

const polyMultiply = (p: number[], q: number[]): number[] => {
  const out = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i += 1) {
    for (let j = 0; j < q.length; j += 1) {
      out[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return out;
};

const rsGenerator = (degree: number): number[] => {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    poly = polyMultiply(poly, [1, gfExp[i]]);
  }
  return poly;
};

const rsRemainder = (data: number[], eccLen: number): number[] => {
  const gen = rsGenerator(eccLen); // length eccLen + 1, leading coeff == 1
  const ecc = new Array(eccLen).fill(0);

  for (const byte of data) {
    const factor = byte ^ ecc[0];
    ecc.shift();
    ecc.push(0);
    for (let i = 0; i < eccLen; i += 1) {
      ecc[i] ^= gfMul(gen[i + 1], factor);
    }
  }

  return ecc;
};

const pushBits = (bits: Bit[], value: number, length: number) => {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push(((value >> i) & 1) as Bit);
  }
};

const encodeNumeric = (digits: string): Bit[] => {
  const dataBits: Bit[] = [];

  // Mode indicator: numeric (0001)
  pushBits(dataBits, 0b0001, 4);

  // Character count indicator (version 1): 10 bits
  pushBits(dataBits, digits.length, 10);

  for (let i = 0; i < digits.length; i += 3) {
    const chunk = digits.slice(i, i + 3);
    const n = Number.parseInt(chunk, 10);
    if (chunk.length === 3) pushBits(dataBits, n, 10);
    else if (chunk.length === 2) pushBits(dataBits, n, 7);
    else pushBits(dataBits, n, 4);
  }

  return dataBits;
};

const bitsToBytes = (bits: Bit[]): number[] => {
  const out: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) {
      value = (value << 1) | (bits[i + j] ?? 0);
    }
    out.push(value);
  }
  return out;
};

const bytesToBits = (bytes: number[]): Bit[] => {
  const out: Bit[] = [];
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i -= 1) {
      out.push(((byte >> i) & 1) as Bit);
    }
  }
  return out;
};

const computeFormatBits = (ecl: QrEcl, mask: number): number => {
  const data = ((ECL_BITS[ecl] & 0b11) << 3) | (mask & 0b111); // 5 bits
  let bits = data << 10;
  const generator = 0x537; // 10100110111

  for (let i = 14; i >= 10; i -= 1) {
    if ((bits >> i) & 1) {
      bits ^= generator << (i - 10);
    }
  }

  const bch = bits & 0x3ff;
  return ((data << 10) | bch) ^ 0x5412;
};

const initMatrix = (): (Bit | null)[][] =>
  Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));

const setModule = (m: (Bit | null)[][], r: number, c: number, v: Bit) => {
  if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) return;
  m[r][c] = v;
};

const placeFinder = (m: (Bit | null)[][], top: number, left: number) => {
  const pattern: Bit[][] = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];

  for (let r = 0; r < 7; r += 1) {
    for (let c = 0; c < 7; c += 1) {
      setModule(m, top + r, left + c, pattern[r][c]);
    }
  }

  // Separators (light)
  for (let r = -1; r <= 7; r += 1) {
    setModule(m, top + r, left - 1, 0);
    setModule(m, top + r, left + 7, 0);
  }
  for (let c = -1; c <= 7; c += 1) {
    setModule(m, top - 1, left + c, 0);
    setModule(m, top + 7, left + c, 0);
  }
};

const placeTiming = (m: (Bit | null)[][]) => {
  for (let i = 8; i <= SIZE - 9; i += 1) {
    const v = (i % 2 === 0 ? 1 : 0) as Bit;
    if (m[6][i] === null) setModule(m, 6, i, v);
    if (m[i][6] === null) setModule(m, i, 6, v);
  }
};

const reserveFormatInfo = (m: (Bit | null)[][]) => {
  // Column 8 (top-left + bottom-left copy)
  for (let i = 0; i < 6; i += 1) setModule(m, i, 8, 0);
  setModule(m, 7, 8, 0);
  setModule(m, 8, 8, 0);
  for (let i = SIZE - 7; i < SIZE; i += 1) setModule(m, i, 8, 0); // 14..20

  // Row 8 (top-right + top-left copy, includes (8,6))
  for (let i = 0; i < 8; i += 1) setModule(m, 8, SIZE - 1 - i, 0); // 20..13
  setModule(m, 8, 6, 0);
  for (let i = 0; i < 6; i += 1) setModule(m, 8, i, 0);
};

const applyFormatInfo = (m: (Bit | null)[][], formatBits: number) => {
  for (let i = 0; i < 15; i += 1) {
    const bit = ((formatBits >> i) & 1) as Bit;

    // Vertical (column 8)
    if (i < 6) setModule(m, i, 8, bit);
    else if (i < 8) setModule(m, i + 1, 8, bit);
    else setModule(m, SIZE - 15 + i, 8, bit);

    // Horizontal (row 8)
    if (i < 8) setModule(m, 8, SIZE - i - 1, bit);
    else if (i < 9) setModule(m, 8, 15 - i - 1, bit);
    else setModule(m, 8, 14 - i, bit);
  }

  // Dark module
  setModule(m, SIZE - 8, 8, 1);
};

const isMasked = (mask: number, r: number, c: number): boolean => {
  // Only mask pattern 0 is supported for v1.
  if (mask !== 0) return false;
  return (r + c) % 2 === 0;
};

const fillData = (m: (Bit | null)[][], bits: Bit[]) => {
  let bitIndex = 0;
  let direction = -1;

  for (let col = SIZE - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;

    for (let row = direction === -1 ? SIZE - 1 : 0; row >= 0 && row < SIZE; row += direction) {
      for (let offset = 0; offset < 2; offset += 1) {
        const c = col - offset;
        if (m[row][c] !== null) continue;
        let bit = (bits[bitIndex] ?? 0) as Bit;
        if (isMasked(MASK_PATTERN, row, c)) bit = (bit ^ 1) as Bit;
        m[row][c] = bit;
        bitIndex += 1;
      }
    }

    direction *= -1;
  }
};

export const makeNumericQr = (value: string, ecl: QrEcl = 'M'): QrMatrix => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return { size: SIZE, modules: Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0 as Bit)) };
  }

  const dataBits = encodeNumeric(digits);
  const capacityBits = DATA_CODEWORDS[ecl] * 8;

  // Terminator up to 4 bits
  const remaining = capacityBits - dataBits.length;
  const terminator = Math.max(0, Math.min(4, remaining));
  for (let i = 0; i < terminator; i += 1) dataBits.push(0);

  // Pad to byte boundary
  while (dataBits.length % 8 !== 0) dataBits.push(0);

  const dataBytes = bitsToBytes(dataBits);

  // Pad codewords
  const pads = [0xec, 0x11];
  let padIndex = 0;
  while (dataBytes.length < DATA_CODEWORDS[ecl]) {
    dataBytes.push(pads[padIndex % 2]);
    padIndex += 1;
  }

  const ecc = rsRemainder(dataBytes, ECC_CODEWORDS[ecl]);
  const codewords = [...dataBytes, ...ecc];
  const finalBits = bytesToBits(codewords);

  const matrix = initMatrix();
  placeFinder(matrix, 0, 0);
  placeFinder(matrix, 0, SIZE - 7);
  placeFinder(matrix, SIZE - 7, 0);
  placeTiming(matrix);
  reserveFormatInfo(matrix);

  fillData(matrix, finalBits);
  const formatBits = computeFormatBits(ecl, MASK_PATTERN);
  applyFormatInfo(matrix, formatBits);

  const modules = matrix.map((row) => row.map((cell) => (cell ?? 0) as Bit));
  return { size: SIZE, modules };
};
