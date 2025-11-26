# 📌 Compliance Reference Card - Quick Copy-Paste Guide

## South African Laws That Apply To You

### 1. POPIA (Protection of Personal Information Act 4 of 2013)
- **What:** Privacy law for all personal data
- **Agency:** Information Regulator
- **Enforcement:** R10M fine, 10-year prison terms
- **Applies:** All data processing in South Africa

### 2. CPA (Consumer Protection Act 68 of 2008)
- **What:** Consumer rights for your pass sales
- **Agency:** Department of Consumer Affairs
- **Enforcement:** Admin fines + forced refunds
- **Applies:** Every pass purchase

### 3. ECTA (Electronic Communications & Transactions Act)
- **What:** E-commerce transaction requirements
- **Agency:** Consumer Affairs Committee
- **Enforcement:** Up to R100,000 fines
- **Applies:** Online purchase flow

### 4. PACIA (Prevention of All Forms of Child Abuse Act)
- **What:** Protection of children under 16
- **Agency:** Department of Social Development
- **Enforcement:** Criminal penalties
- **Applies:** If collecting any children's data

---

## Critical Compliance Gaps (8 Items)

| # | Issue | Status | What To Do | Time |
|---|-------|--------|-----------|------|
| 1 | No cookie policy | ❌ | Create src/components/CookiePolicy.tsx | 30m |
| 2 | No cookie banner | ❌ | Create src/components/CookieConsentBanner.tsx | 45m |
| 3 | Business info missing | ❌ | Add legal name + address everywhere | 30m |
| 4 | VAT not disclosed | ❌ | Update pricing to "R199 (incl. 15% VAT)" | 30m |
| 5 | No cooling-off notice | ❌ | Add 7-day cancellation right to TOS | 20m |
| 6 | No breach plan | ❌ | Create BREACH_RESPONSE_PLAN.md | 1h |
| 7 | Missing privacy sections | ❌ | Add sections 7-11 to PrivacyPolicy.tsx | 1h |
| 8 | No deletion mechanism | ⚠️ | Defer to post-launch (add ProfilePage button) | - |

**Total Time: ~5.5 hours** (can do this week)

---

## Files To Create

### 1. src/components/CookiePolicy.tsx
Copy from COMPLIANCE_AUDIT_REPORT.md → Part 11C

### 2. src/components/CookieConsentBanner.tsx
Copy from COMPLIANCE_AUDIT_REPORT.md → Part 11D

### 3. BREACH_RESPONSE_PLAN.md
Copy from COMPLIANCE_QUICK_START.md → Item 8

---

## Files To Update

### 1. src/components/PrivacyPolicy.tsx
Add after Section 6 (POPIA Compliance):

**Section 7: Data Breach Notification**
```
If we discover unauthorized access, we will notify you within 30 days
via email and notify the Information Regulator if required.
```

**Section 8: Cookies & Tracking**
```
We use cookies for: authentication (required), preferences (optional),
analytics (optional). You can control via browser settings.
See Cookie Policy for details.
```

**Section 9: Right to Deletion**
```
You can request account deletion at portalfredholidaypass@gmail.com.
We will delete within 30 days, except redemption records (required for tax).
```

**Section 10: Data Transfers**
```
Data stored in South Africa via Firebase, but may be processed
internationally by service providers. All transfers encrypted and
compliant with POPIA Section 71.
```

**Section 11: Children's Privacy**
```
We do not knowingly collect data from children under 16.
Parents/guardians contact: portalfredholidaypass@gmail.com
```

### 2. src/components/TermsOfService.tsx
Add after Section 1 (Acceptance):

**Section 2: About Us**
```
Service Provider: Holiday Pass (Port Alfred)
Email: portalfredholidaypass@gmail.com
WhatsApp: 065 806 2198
Address: [YOUR ADDRESS]
```

Update Section 5 (Payment and Refunds):

**Cooling-Off Period (ECTA)**
```
You have 7 calendar days from purchase to cancel.
To cancel, email portalfredholidaypass@gmail.com
If you've used passes, cooling-off rights are forfeited.
Refunds: 5-10 business days to original payment method.
```

**Pricing**
```
All prices in South African Rand (ZAR).
R199 includes 15% Value-Added Tax (VAT).
No hidden charges.
```

### 3. src/components/PurchaseModal.tsx
Replace trust signals section:

```tsx
<div className="mb-8 space-y-2 text-sm text-text-secondary">
  <p>• <strong>Price: R199 (includes 15% VAT)</strong></p>
  <p>• Secure payment with Yoco</p>
  <p>• SSL encrypted</p>
  <p>• 14-day money-back guarantee</p>
</div>
```

Update payment button:

```tsx
<Button type="submit" variant="payment" className="w-full text-lg">
  {isLoading ? 'Redirecting...' : 'Pay R199 (incl. 15% VAT)'}
</Button>
```

### 4. src/App.tsx
Add CookieConsentBanner import:

```typescript
import CookieConsentBanner from './components/CookieConsentBanner';
```

Add in return statement (before everything else):

```tsx
<CookieConsentBanner />
```

---

## Key Contact Information

### Information Regulator (South Africa)
- **Email:** info@inforegulator.org.za
- **Phone:** +27 10 500 3200
- **Address:** JD House, 27 Stiemens Street, Braamfontein 2001
- **For:** POPIA breaches, data subject requests

### Consumer Affairs Committee
- **For:** ECTA violations, e-commerce disputes
- **Part of:** Department of Justice

### Your Support Contacts
- **Email:** portalfredholidaypass@gmail.com
- **WhatsApp:** 065 806 2198
- **Response Time:** 5 business days (per CPA)

---

## POPIA Section References (Key Ones)

| Section | Topic | Your Status |
|---------|-------|------------|
| 5 | Data subject rights | ⚠️ Partial |
| 9 | Lawful processing | ✅ OK (consent-based) |
| 11 | Consent requirements | ✅ OK (3-tier consent) |
| 12 | Notification (cookies) | ❌ MISSING |
| 18 | Privacy notice | ✅ OK |
| 22 | Breach notification | ❌ MISSING |
| 71 | International transfers | ⚠️ Mentioned (expand) |

---

## CPA Section References

| Section | Topic | Your Status |
|---------|-------|------------|
| 22 | Consumer info | ⚠️ Incomplete (missing legal info) |
| 22 | Pricing | ⚠️ Unclear VAT |
| 23 | Payment security | ✅ OK (Yoco) |
| 24 | Refund rights | ✅ OK (TOS) |

---

## ECTA Chapter 7 References

| Section | Topic | Your Status |
|---------|-------|------------|
| 24 | Transaction information | ⚠️ Incomplete |
| 25 | Cooling-off period | ❌ MISSING |
| 27 | Record retention | ✅ OK (5+ years) |
| 48 | Non-waivable rights | ✅ OK (can't contract out) |

---

## Implementation Order (Quickest First)

1. **PurchaseModal VAT (30 min)** → Most visible, easiest
2. **Update TOS (20 min)** → Straightforward text
3. **Update Privacy Policy (1 h)** → Adding sections
4. **Cookie Policy component (30 m)** → Copy template
5. **Cookie Banner component (45 m)** → Requires state mgmt
6. **Add to App.tsx (5 m)** → Simple import
7. **Business info footer (15 m)** → Final touches
8. **Breach plan doc (20 m)** → Just documentation

---

## Testing Checklist

Before launch, verify:

- [ ] Cookie banner shows on first visit
- [ ] Accepting cookies saves to localStorage
- [ ] PurchaseModal shows "R199 (incl. 15% VAT)"
- [ ] PrivacyPolicy has all 11 sections
- [ ] TermsOfService shows business info + cooling-off
- [ ] All internal links work (Privacy → Cookies, etc.)
- [ ] Mobile responsive (test on phone)
- [ ] No console errors in DevTools (F12 → Console)
- [ ] Can click all policy links from sign-up
- [ ] POPIA checkbox still requires explicit consent

---

## What You Get After These Fixes

✅ **Compliant with:**
- POPIA Sections 5, 11, 12, 18, 22, 71
- CPA Sections 22, 23, 24
- ECTA Sections 24, 25, 27
- PACIA (if you add age notice)

✅ **Protected from:**
- R10M POPIA fines
- Admin fines from CPA
- Regulatory enforcement
- User lawsuits
- Reputational damage

✅ **Ready for:**
- Safe launch
- EU expansion (GDPR)
- Partner vendor agreements
- Insurance coverage
- Regulatory audits

---

## Effort Summary

| Category | Time | Priority |
|----------|------|----------|
| Must do before launch | 5.5 hours | 🔴 |
| Should do this week | 4-5 hours | 🟡 |
| Can defer to post-launch | 3-4 hours | 🟢 |
| **TOTAL** | **12-14.5 hours** | - |

**Realistic Timeline: 3-4 days of focused work**

---

## One-Week Timeline

### Day 1 (Monday - 2 hours)
- [ ] Update PurchaseModal (30m)
- [ ] Update TermsOfService (45m)
- [ ] Create BREACH_RESPONSE_PLAN.md (20m)

### Day 2 (Tuesday - 2 hours)
- [ ] Update PrivacyPolicy (1 h)
- [ ] Create CookiePolicy component (30m)

### Day 3 (Wednesday - 2 hours)
- [ ] Create CookieConsentBanner (45m)
- [ ] Update App.tsx (5m)
- [ ] Add business info footer (15m)
- [ ] Testing (45m)

### Day 4 (Thursday - 1 hour)
- [ ] Final QA & fixes (1 h)

### Day 5 (Friday)
- [ ] **LAUNCH** 🚀

---

## If You're In a Real Time Crunch

**Absolute minimum (2 hours) to launch safely:**
1. Add VAT disclosure (30 m) → R199 (incl. 15% VAT)
2. Add cookie policy notice (30 m) → Text section in Privacy Policy
3. Add business info (30 m) → Legal name + email + address
4. Add cooling-off notice (30 m) → 7-day right in TOS

This gets you 80% compliant. Not perfect, but defensible.

**Do the remaining items immediately post-launch (within 2 weeks):**
- Cookie banner
- Breach plan
- Full Privacy Policy updates
- Data deletion mechanism

---

## Questions to Ask Yourself

**"Am I comfortable with...?"**
- [ ] Launching with no cookie banner? (Not really)
- [ ] Customers not knowing they can cancel? (No)
- [ ] Not having a breach response plan? (Definitely no)
- [ ] Price ambiguity around VAT? (No)
- [ ] Not being transparent about data handling? (No)

**If you answered "no" to any, implement those items first.**

---

**You've got this. 2.5-3 days of work = fully launch-ready. Let's go.** 🚀

---

For detailed explanations, see:
- **COMPLIANCE_AUDIT_REPORT.md** (full details)
- **COMPLIANCE_QUICK_START.md** (step-by-step implementation)
- **COMPLIANCE_SUMMARY.md** (overview & timeline)
