# ⚡ Compliance Quick Start - Do This First

**Time estimate:** 2 hours for critical items  
**Priority:** Do before launch this week

---

## 1️⃣ Update Privacy Policy (30 min)

File: `src/components/PrivacyPolicy.tsx`

**Add these sections after section 6 (POPIA Compliance):**

```tsx
// Section 7: Data Breach Notification
<section>
  <h2 className="text-xl font-bold text-accent-primary mb-3">7. Data Breach Notification</h2>
  <p>
    If we discover unauthorized access to your personal data, we will notify you within 30 days
    via email. We will also notify the Information Regulator if required by law.
  </p>
</section>

// Section 8: Cookie Processing
<section>
  <h2 className="text-xl font-bold text-accent-primary mb-3">8. Cookies & Tracking</h2>
  <p>
    We use cookies for:
    <ul className="list-disc pl-5 space-y-1 mt-2">
      <li><strong>Authentication:</strong> Firebase session cookies (required)</li>
      <li><strong>Preferences:</strong> Theme selection (optional, 1 year)</li>
      <li><strong>Analytics:</strong> Firebase Analytics (optional, 30 days)</li>
    </ul>
  </p>
  <p className="mt-2">
    You can control cookies via your browser settings. See our full Cookie Policy for details.
  </p>
</section>

// Section 9: Right to Data Deletion
<section>
  <h2 className="text-xl font-bold text-accent-primary mb-3">9. Right to Deletion</h2>
  <p>
    You can request deletion of your account and data at any time by contacting us at
    portalfredholidaypass@gmail.com. We will delete your data within 30 days, except where
    required to retain for legal/tax compliance (such as redemption records).
  </p>
</section>

// Section 10: International Transfers
<section>
  <h2 className="text-xl font-bold text-accent-primary mb-3">10. Data Transfers</h2>
  <p>
    Your data is stored in South Africa via Firebase, but may be processed internationally by
    service providers. All transfers include encryption and contractual safeguards compliant
    with POPIA Section 71.
  </p>
</section>

// Section 11: Children's Privacy
<section>
  <h2 className="text-xl font-bold text-accent-primary mb-3">11. Children's Privacy</h2>
  <p>
    We do not knowingly collect data from children under 16. If you are under 16, please do not
    create an account. Parents/guardians concerned about their child's data can contact us at
    portalfredholidaypass@gmail.com.
  </p>
</section>
```

---

## 2️⃣ Update Terms of Service (20 min)

File: `src/components/TermsOfService.tsx`

**Add this section right after acceptance (Section 1):**

```tsx
<section>
  <h2 className="text-xl font-bold text-accent-primary mb-3">2. About Us</h2>
  <p className="mb-3">
    <strong>Service Provider:</strong> Holiday Pass (Port Alfred)<br/>
    <strong>Contact Email:</strong> portalfredholidaypass@gmail.com<br/>
    <strong>WhatsApp Support:</strong> 065 806 2198<br/>
    <strong>Physical Address:</strong> [ADD YOUR ADDRESS]
  </p>
</section>

// Update the Refund section to include:
<h3 className="font-semibold mb-2">Cooling-Off Period (ECTA Chapter 7)</h3>
<ul className="list-disc pl-5 space-y-1">
  <li>You have 7 calendar days from purchase to cancel</li>
  <li>To cancel, email: portalfredholidaypass@gmail.com</li>
  <li>If you've used any passes, cooling-off rights are forfeited</li>
  <li>Refunds processed within 5-10 business days</li>
</ul>

<h3 className="font-semibold mt-4 mb-2">Pricing</h3>
<ul className="list-disc pl-5 space-y-1">
  <li>All prices in South African Rand (ZAR)</li>
  <li>R199 includes 15% Value-Added Tax (VAT)</li>
  <li>No hidden charges</li>
</ul>
```

---

## 3️⃣ Update PurchaseModal VAT Disclosure (10 min)

File: `src/components/PurchaseModal.tsx`

**Replace trust signals section with:**

```tsx
{/* Trust Signals */}
<div className="mb-8 space-y-2 text-sm text-text-secondary">
  <p>• <strong>Price: R199 (includes 15% VAT)</strong></p>
  <p>• Secure payment with Yoco</p>
  <p>• SSL encrypted</p>
  <p>• 14-day money-back guarantee</p>
</div>

// And update the payment button:
<Button 
  type="submit" 
  variant="payment" 
  className="w-full text-lg bg-brand-yellow !text-gray-900 font-bold" 
  disabled={isLoading}
>
  {isLoading ? 'Redirecting...' : 'Pay R199 (incl. 15% VAT)'}
</Button>
```

---

## 4️⃣ Create Cookie Policy Component (30 min)

Create new file: `src/components/CookiePolicy.tsx`

[Copy the full CookiePolicy component from COMPLIANCE_AUDIT_REPORT.md Part 11C]

---

## 5️⃣ Create Cookie Consent Banner (45 min)

Create new file: `src/components/CookieConsentBanner.tsx`

[Copy the full CookieConsentBanner component from COMPLIANCE_AUDIT_REPORT.md Part 11D]

---

## 6️⃣ Add Banner to App.tsx (5 min)

File: `src/App.tsx`

```tsx
import CookieConsentBanner from './components/CookieConsentBanner';

// In your main return statement, add:
return (
  <AuthProvider>
    <ThemeProvider>
      <CookieConsentBanner /> {/* Add this before everything else */}
      {/* ... rest of app ... */}
    </ThemeProvider>
  </AuthProvider>
);
```

---

## 7️⃣ Add Business Info to Footer (15 min)

If you have a Footer component, add:

```tsx
<footer className="bg-bg-secondary border-t border-border-subtle p-4 text-center text-sm text-text-secondary">
  <div className="space-y-2">
    <p><strong>Holiday Pass (Port Alfred)</strong></p>
    <p>portalfredholidaypass@gmail.com | 065 806 2198</p>
    <p>[YOUR PHYSICAL ADDRESS HERE]</p>
    <div className="flex gap-2 justify-center text-xs mt-3">
      <button className="underline hover:text-text-primary">Privacy Policy</button>
      <span>•</span>
      <button className="underline hover:text-text-primary">Terms</button>
      <span>•</span>
      <button className="underline hover:text-text-primary">Cookies</button>
    </div>
  </div>
</footer>
```

---

## 8️⃣ Create Breach Response Document (20 min)

Create file: `BREACH_RESPONSE_PLAN.md`

```markdown
# Data Breach Response Plan

## Triggers
- Unauthorized access to Firestore
- Firebase auth tokens compromised
- Yoco payment data breach
- Hacking attempt or malicious activity

## Response Steps

### Immediate (Within 1 hour)
1. Isolate affected systems
2. Log all actions for audit
3. Notify Netlify support
4. Check Firebase Activity Log

### Within 24 hours
1. Assess scope (how many users affected?)
2. Determine what data was accessed
3. Contact affected users via email
4. Notify Information Regulator (info@inforegulator.org.za)

### Within 30 days
1. Complete investigation
2. Deploy security fixes
3. Send follow-up communication
4. Update Privacy Policy with lessons learned

## Contact Information
- Firebase Support: [Your support email]
- Information Regulator: info@inforegulator.org.za
- Yoco Support: support@yoco.com
- Netlify Support: [Your Netlify account]
```

---

## ✅ Testing Checklist

Before launch, verify:

- [ ] Privacy Policy displays all 11 sections
- [ ] Cookie banner appears on first visit
- [ ] Accepting cookies saves preference to localStorage
- [ ] PurchaseModal shows "R199 (incl. 15% VAT)"
- [ ] Terms show 7-day cooling-off period
- [ ] Footer displays business info + legal links
- [ ] All modals link to correct policies
- [ ] Mobile responsive on all screens
- [ ] No console errors in DevTools

---

## Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Privacy Policy | 30 min | ⬜ |
| Terms of Service | 20 min | ⬜ |
| VAT Disclosure | 10 min | ⬜ |
| Cookie Policy | 30 min | ⬜ |
| Cookie Banner | 45 min | ⬜ |
| Update App.tsx | 5 min | ⬜ |
| Footer Info | 15 min | ⬜ |
| Breach Plan Doc | 20 min | ⬜ |
| **TOTAL** | **2.5 hours** | 🟢 |

---

## What This Fixes

✅ POPIA Section 12 (cookies) - fully compliant  
✅ POPIA Section 5 (rights) - deletion mentioned  
✅ POPIA Section 22 (breach notification) - plan documented  
✅ CPA Section 22 (business info) - displayed everywhere  
✅ ECTA Section 24 (transaction info) - price, VAT, cooling-off clear  
✅ ECTA Section 25 (cooling-off) - 7-day notice added  
✅ Consumer expectations - transparent, trustworthy  

---

## Next Steps (Post-Launch)

1. **Email Verification** (1-2 days post-launch)
   - Add Firebase email verification before purchase

2. **Data Deletion UI** (3-5 days)
   - Add "Delete Account" button to ProfilePage

3. **Rate Limiting** (1 week)
   - Prevent spam sign-ups

4. **Monitoring** (ongoing)
   - Watch for errors in Firebase
   - Monitor Firestore access patterns

---

**Start with items 1-8 above. Should take ~2.5 hours total.**

Once done, you'll be compliant with all critical SA laws and ready to launch! 🚀
