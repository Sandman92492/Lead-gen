# 🚀 Launch Checklist - Compliance Edition

**Target Launch Date:** This Friday (Nov 29, 2025)  
**Time to Complete:** ~15 minutes  
**Build Status:** ✅ Passing (329 modules)

---

## Pre-Launch Compliance Tasks (Do These Now)

### Task 1: Add Your Name & Address to TermsOfService.tsx ⏱️ 5 min

**Find:** Line 49 (Section "1. Acceptance of Terms")  
**Add after it:** New Section 2 with your details

```jsx
<section>
  <h2 className="text-xl font-bold text-accent-primary mb-3">2. About This Service</h2>
  <p className="mb-3">
    Holiday Pass is operated by [YOUR FULL NAME], trading as Holiday Pass (Port Alfred).
  </p>
  <div className="space-y-2 text-sm">
    <p><strong>Contact Information:</strong></p>
    <p>Email: portalfredholidaypass@gmail.com<br/>
       WhatsApp: 065 806 2198<br/>
       Address: [Your Port Alfred Address]</p>
    <p className="text-xs text-text-secondary italic mt-3">
      This is an unregistered trading business. Once annual revenue exceeds 
      R1,000,000, VAT registration will be required and prices will be updated accordingly.
    </p>
  </div>
</section>
```

**Renumber:** Update all section numbers after this from 2→3, 3→4, etc. (13 sections total now)

**Checklist:**
- [ ] File: `src/components/TermsOfService.tsx`
- [ ] Sections: 1, 2 (new), 3-13
- [ ] Your name filled in
- [ ] Your address filled in

---

### Task 2: Add Business Info to PrivacyPolicy.tsx ⏱️ 5 min

**Find:** Line 141 (Section "9. Changes to This Policy")  
**Add before it:** New Section 11 (Business Registration)

```jsx
<section>
  <h2 className="text-xl font-bold text-accent-primary mb-3">
    11. Business Registration & VAT Status
  </h2>
  <p>
    Holiday Pass is currently operated as an unregistered trading business by 
    [YOUR NAME], trading as Holiday Pass (Port Alfred).
  </p>
  <p className="mt-2">
    All data handling complies with POPIA regardless of business registration status.
    Once the business is formally registered as a Close Corporation (expected within 
    3 months), we will provide updated registration details.
  </p>
  <p className="mt-2 text-xs text-text-secondary">
    VAT Registration: Not currently VAT-registered (threshold: R1,000,000 annual revenue). 
    Prices do not include VAT. Once the business reaches the VAT registration threshold, 
    all future prices will include 15% VAT.
  </p>
</section>
```

**Renumber:**
- Section 9: Data Breach Notification (already correct ✅)
- Section 10: Changes to This Policy (already numbered ✅)
- Section 11: Business Registration & VAT (new - you add this)
- Section 12: Contact Us (update "10. Contact Us" → "12. Contact Us")

**Checklist:**
- [ ] File: `src/components/PrivacyPolicy.tsx`
- [ ] Your name filled in (appears twice)
- [ ] Sections numbered 1-12 correctly

---

### Task 3: Test & Build ⏱️ 5 min

```bash
# Run build
npm run build

# Expected output: ✓ built in ~1.5s (329 modules)
```

**On your phone/browser:**
- [ ] Open app in fresh incognito window
- [ ] See cookie banner after 1 second
- [ ] Click "Cookie Policy" - modal opens
- [ ] Click "Reject Analytics" - banner disappears
- [ ] Reload page - banner should NOT appear
- [ ] Read TermsOfService - see Section 2 (your info)
- [ ] Read PrivacyPolicy - see Section 11 (VAT status)
- [ ] Check footer - WhatsApp shows 065 806 2198

---

## What's Already Done ✅

| Item | Status | File |
|------|--------|------|
| Cookie Policy modal | ✅ | `src/components/CookiePolicy.tsx` |
| Cookie Consent Banner | ✅ | `src/components/CookieConsentBanner.tsx` |
| Breach Response Plan | ✅ | `BREACH_RESPONSE_PLAN.md` |
| ECTA Cooling-Off Period | ✅ | `src/components/TermsOfService.tsx` (Section 5) |
| Breach Notification notice | ✅ | `src/components/PrivacyPolicy.tsx` (Section 9) |
| Contact info fixes | ✅ | Updated WhatsApp in 2 files |
| App.tsx integration | ✅ | CookieConsentBanner imported + rendered |

---

## Launch Readiness

**Before Friday:**
- [ ] Complete Task 1 (5 min)
- [ ] Complete Task 2 (5 min)
- [ ] Complete Task 3 (5 min)
- [ ] Verify build passes
- [ ] Test on mobile
- [ ] Do final review of TOS + Privacy Policy

**Compliance Status:**
✅ POPIA Section 12 (Cookies) - READY  
✅ POPIA Section 22 (Breach) - READY  
✅ ECTA Section 25 (Cooling-Off) - READY  
✅ Unregistered Business Info - NEEDS YOUR INPUT (Task 1 & 2)

---

## Quick Reference

### Your Personal Info Needed
- Full name: ________________
- Port Alfred address: ________________

### File Locations
1. `src/components/TermsOfService.tsx` - Add Section 2
2. `src/components/PrivacyPolicy.tsx` - Add Section 11
3. Run `npm run build` to verify

### Files You Don't Need to Edit
- ✅ `src/components/CookiePolicy.tsx` - Done
- ✅ `src/components/CookieConsentBanner.tsx` - Done
- ✅ `src/App.tsx` - Done
- ✅ `BREACH_RESPONSE_PLAN.md` - Done

---

## After Launch

**Month 1-2:** Register as Close Corporation  
**Month 3:** Update TOS with CC number  
**When hitting R1M revenue:** Register for VAT + update pricing

**For now:** You're compliant as unregistered startup. ✅

---

## Need Help?

Refer to:
- `COMPLIANCE_IMPLEMENTATION_COMPLETE.md` - Detailed implementation notes
- `COMPLIANCE_STARTUP_VERSION.md` - Original compliance strategy
- `BREACH_RESPONSE_PLAN.md` - What to do if security incident occurs

---

**Status:** READY FOR LAUNCH 🎉  
**Time to Finish:** 15 minutes  
**Build Status:** ✅ Passing  
**Compliance:** ✅ Complete (once you add your info)
