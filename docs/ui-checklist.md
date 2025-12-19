# Lead Wallet UI checklist (Solar Nightfall)

Use this when adding new screens/components so the app stays premium and fast.

## Layout
- One obvious primary action per screen.
- Mobile-first: 48px tap targets, thumb-friendly spacing, avoid tiny meta text.
- Default spacing: 16–20px inside cards, 12px between list items, 20–24px between sections.
- Keep pages neutral (background/surfaces); accents only where needed.

## Color + hierarchy
- Primary teal (`--primary`) for the main CTA (Create, Save, Download).
- WhatsApp green (`--whatsapp`) only for WhatsApp actions.
- Accent sun (`--accent`) sparingly (badges/counts), not as a general UI tint.
- Body text contrast stays ≥ 4.5:1 on surfaces (avoid low-contrast blur behind text).

## Typography
- No body text smaller than 13px.
- Use Semibold for headings/labels; keep most copy Regular/Medium.
- Prefer short labels: Leads, Campaigns, QR, Settings.

## Components (use first)
- `src/components/AppShell.tsx` for layout + nav.
- `src/components/ui/Card.tsx` for surfaces; `src/components/ui/GlassCard.tsx` sparingly.
- `src/components/Button.tsx` variants: `primary`, `secondary`, `whatsapp`.
- `src/components/ui/FilterChips.tsx` for filters; keep chips short.
- `src/components/ui/StatusPill.tsx` for lead statuses.
- `src/components/ui/EmptyState.tsx` for “nothing here yet”.
- `src/components/ui/Skeleton.tsx` for loading.
- `src/components/ui/BottomSheet.tsx` for lead detail and quick actions.

## Motion
- Subtle only: bottom sheet open/close, chip selection, toast confirmations.
- Avoid page-level heavy animations; respect `prefers-reduced-motion`.

## Performance
- Avoid heavy image assets; prefer SVG icons and solid-color surfaces.
- Don’t render QR codes repeatedly in lists; generate on-demand.

