import { describe, expect, it } from 'vitest';
import { getBrandedPrefixError, getDisplayLink } from './links';

describe('getBrandedPrefixError', () => {
  it('requires a prefix', () => {
    expect(getBrandedPrefixError('')).toBeTruthy();
    expect(getBrandedPrefixError('   ')).toBeTruthy();
  });

  it('requires lowercase', () => {
    expect(getBrandedPrefixError('Abc')).toBe('Prefix must be lowercase.');
  });

  it('enforces length 3–32', () => {
    expect(getBrandedPrefixError('ab')).toBe('Prefix must be 3–32 characters.');
    expect(getBrandedPrefixError('a'.repeat(33))).toBe('Prefix must be 3–32 characters.');
    expect(getBrandedPrefixError('abc')).toBeNull();
  });

  it('allows only a-z, 0-9, -', () => {
    expect(getBrandedPrefixError('ab_')).toBe('Only a-z, 0-9, and - allowed.');
    expect(getBrandedPrefixError('ab.')).toBe('Only a-z, 0-9, and - allowed.');
    expect(getBrandedPrefixError('ab!')).toBe('Only a-z, 0-9, and - allowed.');
    expect(getBrandedPrefixError('ab9-')).toBe('Cannot start or end with -.');
  });

  it('cannot start or end with -', () => {
    expect(getBrandedPrefixError('-abc')).toBe('Cannot start or end with -.');
    expect(getBrandedPrefixError('abc-')).toBe('Cannot start or end with -.');
    expect(getBrandedPrefixError('ab-c')).toBeNull();
  });
});

describe('getDisplayLink', () => {
  it('returns classic when mode is classic', () => {
    expect(getDisplayLink({ slug: 'my-slug', mode: 'classic', brandedPrefix: 'valid' })).toBe('/c/my-slug');
  });

  it('returns branded when mode is branded and prefix is valid', () => {
    expect(getDisplayLink({ slug: 'my-slug', mode: 'branded', brandedPrefix: 'mybrand' })).toBe('mybrand.leadwallet.app/c/my-slug');
  });

  it('falls back to classic when mode is branded but prefix is empty', () => {
    expect(getDisplayLink({ slug: 'my-slug', mode: 'branded', brandedPrefix: '' })).toBe('/c/my-slug');
  });

  it('falls back to classic when mode is branded but prefix is invalid', () => {
    expect(getDisplayLink({ slug: 'my-slug', mode: 'branded', brandedPrefix: 'Abc' })).toBe('/c/my-slug');
    expect(getDisplayLink({ slug: 'my-slug', mode: 'branded', brandedPrefix: '-abc' })).toBe('/c/my-slug');
  });
});
