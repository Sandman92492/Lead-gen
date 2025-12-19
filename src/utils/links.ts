export const getBrandedPrefixError = (value: string): string | null => {
  const prefix = String(value || '').trim();
  if (!prefix) return 'Enter a prefix.';
  if (prefix !== prefix.toLowerCase()) return 'Prefix must be lowercase.';
  if (prefix.length < 3 || prefix.length > 32) return 'Prefix must be 3–32 characters.';
  if (!/^[a-z0-9-]+$/.test(prefix)) return 'Only a-z, 0-9, and - allowed.';
  if (prefix.startsWith('-') || prefix.endsWith('-')) return 'Cannot start or end with -.';
  return null;
};

export const getDisplayLink = (opts: {
  slug: string;
  mode: 'classic' | 'branded';
  brandedPrefix: string;
}): string => {
  const safeSlug = String(opts.slug || '').trim();
  const classic = `/c/${safeSlug}`;

  if (opts.mode !== 'branded') return classic;
  const prefixError = getBrandedPrefixError(opts.brandedPrefix);
  if (prefixError) return classic;

  const prefix = String(opts.brandedPrefix || '').trim();
  return `${prefix}.leadwallet.app/c/${safeSlug}`;
};

export const getShareUrl = (opts: { origin: string; slug: string }): string => {
  const origin = String(opts.origin || '').replace(/\/+$/, '');
  const safeSlug = String(opts.slug || '').trim();
  if (!origin) return `/c/${safeSlug}`;
  return `${origin}/c/${safeSlug}`;
};

export const getPublicCaptureUrl = (slug: string): string => {
  const safe = (slug || '').trim();
  if (typeof window === 'undefined') return `/c/${safe}`;
  return getShareUrl({ origin: window.location.origin, slug: safe });
};

export const getPrettyCapturePath = (slug: string): string => `/c/${(slug || '').trim()}`;

