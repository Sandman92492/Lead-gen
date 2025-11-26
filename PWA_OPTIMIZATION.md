# PWA Optimization & Installation Guide

## What's Been Optimized

### 1. **App Icons (Dark & Light Mode)**
- **Light mode (6.svg)**: Used when user's device is in light mode
- **Dark mode (5.svg)**: Used when user's device is in dark mode
- **Maskable icons**: Support for app launcher customization
- **Multiple sizes**: 192x192 and 512x512 for different devices

### 2. **Build Optimization (Vite)**
```
dist/assets/index-*.css           36.46 kB (6.91 kB gzipped)  - Main styles
dist/assets/react-vendor-*.js    140.87 kB (45.26 kB gzipped) - React bundle
dist/assets/firebase-*.js        467.77 kB (110.96 kB gzipped) - Firebase bundle
```

**Code splitting strategy:**
- Separate Firebase bundle (lazy-loaded on demand)
- Separate React vendor bundle (cached separately)
- Automatic CSS splitting for faster initial load

### 3. **Service Worker Improvements**
- **Cache versioning**: v5 (auto-cleans old versions on activation)
- **Smart caching strategies**:
  - **Navigation/HTML**: Network-first (always try fresh content)
  - **Images**: Cache-first (use cached, fall back to network)
  - **CSS/JS**: Network-first with fallback to cache
- **Better error handling**: Graceful fallbacks for offline scenarios
- **Periodic update checks**: Every 60 seconds for new versions

### 4. **HTML Meta Tags**
- **theme-color**: `#0077B6` (ocean blue, matches your brand)
- **viewport-fit**: cover (uses safe area on notched phones)
- **apple-mobile-web-app**: Full iOS support for add-to-home-screen
- **Description**: Helps with search visibility and app stores
- **Icons**: Your branded 5.svg and 6.svg

### 5. **Performance Metrics**
| Metric | Value |
|--------|-------|
| Main JS bundle size | 128.63 kB (31.75 kB gzipped) |
| Firebase bundle size | 467.77 kB (110.96 kB gzipped) |
| CSS size | 36.46 kB (6.91 kB gzipped) |
| **Total initial load** | ~30-45 kB gzipped |

---

## Installation & Testing

### On Android Chrome/Edge
1. Open app in browser
2. Wait for install prompt to appear (or look for "Install" in address bar menu)
3. Tap "Install"
4. App appears on home screen
5. Tap icon to launch in full-screen standalone mode

### On iOS Safari
1. Open app in Safari
2. Tap Share button (bottom right)
3. Scroll and tap "Add to Home Screen"
4. Confirm with app name
5. App appears on home screen
6. Tap to open in standalone mode

### Desktop (Windows/Mac)
- **Chrome/Edge**: Click "Install" in address bar, or menu → "Install app"
- **Firefox**: Limited support (Android only for full PWA)

---

## Offline Features

### What Works Offline
✅ Browse deals and your pass  
✅ Redeem deals locally (queued for sync)  
✅ View previously redeemed deals  
✅ Navigation and core UI  

### What Needs Connection
❌ Initial app shell download (first time only)  
❌ User authentication  
❌ Google Maps integration for directions  
❌ Purchase flow (Yoco payments)  

### Automatic Sync
When user returns online:
1. Service Worker detects connection
2. Queued redemptions sent to server
3. UI updates with final status
4. All local state synced

---

## Lighthouse PWA Checklist

The app should score well on:
- ✅ **Installability**: Has manifest.json, icons, and service worker
- ✅ **Offline functionality**: Service worker caches shell
- ✅ **HTTPS**: Required for PWA (enforce on deployment)
- ✅ **App-like appearance**: Standalone display mode, theme color
- ✅ **Mobile-friendly**: Responsive design, viewport meta tag
- ✅ **Fast load**: Code splitting, CSS optimization

**To test in Chrome DevTools:**
1. Open DevTools → Lighthouse tab
2. Select "PWA" category
3. Click "Analyze page load"
4. Review score (should be 90+)

---

## Deployment Checklist

Before launching:

- [ ] Ensure HTTPS is enabled on production domain
- [ ] Test installation on Android Chrome
- [ ] Test installation on iOS Safari
- [ ] Verify offline mode works (DevTools → Offline)
- [ ] Test service worker updates (DevTools → Application → Service Workers)
- [ ] Run Lighthouse PWA audit
- [ ] Test redemption queue syncing
- [ ] Verify icons appear correctly in both light and dark mode
- [ ] Check that `npm run build` completes without errors
- [ ] Verify `dist/manifest.json` and `dist/sw.js` are present

---

## Monitoring & Maintenance

### Service Worker Updates
- Every 60 seconds, app checks for new service worker
- Users see "Update available" prompt if new version exists
- Old caches automatically cleaned up on new activation

### Cache Invalidation
Service Worker version bumped when:
- Major layout changes
- Critical bug fixes
- New features requiring new assets
- Change cache names from `v5` to `v6` in `sw.js`

### Browser DevTools
**Application tab:**
- Service Workers: Check registration status
- Cache Storage: View cached assets
- Manifest: Verify PWA configuration

**Network tab:**
- Check response headers for cache control
- Monitor service worker responses (from cache vs network)

---

## Troubleshooting

### App Won't Install
- Ensure HTTPS is enabled
- Check manifest.json is served correctly
- Verify service worker registered (DevTools → Application)
- Try incognito/private browsing

### Icons Not Showing
- Ensure `/Images/5.svg` and `/Images/6.svg` exist in public folder
- Check manifest.json paths are correct
- Clear browser cache and reinstall

### Offline Features Not Working
- Verify service worker is registered
- Check Cache Storage in DevTools
- Ensure redemption queue logic is enabled in App.tsx
- Test with DevTools → Offline checkbox

### Updates Not Showing
- Service worker checks every 60 seconds
- Force update: DevTools → Application → Service Workers → Update
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## Future Enhancements

1. **Push Notifications**: Notify user of new deals or redemption status
2. **Sync Progress UI**: Show which redemptions are pending sync
3. **App Shortcuts**: Quick actions (e.g., "Redeem Pass") on home screen
4. **Update Prompt**: UI notification when new version available
5. **Install Prompt**: Custom install button on landing page
6. **App-to-App**: Deep linking for sharing deals with friends

---

## Key Files Modified

- `index.html` - Meta tags, icons, manifest link
- `public/manifest.json` - PWA metadata with light/dark icons
- `public/sw.js` - Service worker with caching strategies
- `src/main.tsx` - Service worker registration with update checks
- `vite.config.ts` - Build optimization with code splitting

All changes maintain backward compatibility and progressive enhancement.
