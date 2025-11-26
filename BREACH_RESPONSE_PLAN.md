# Data Breach Response Plan - Holiday Pass

**Effective Date:** November 25, 2025  
**Compliance:** POPIA Section 22 (Notification of Security Breaches)  
**Status:** Active (Pre-Launch)

---

## 1. Overview

This document outlines Holiday Pass's procedures for detecting, responding to, and reporting data security breaches as required by the Protection of Personal Information Act (POPIA), Section 22.

**Key Requirement:** Notify Information Regulator + affected users within 30 days of breach discovery.

---

## 2. Breach Definition

A **security breach** includes:
- Unauthorized access to personal data (e.g., hacked Firebase account)
- Loss of data (e.g., database deleted, backup failure)
- Data corruption or destruction
- Disclosure of data to unauthorized parties
- Loss of encryption keys or credentials
- Ransomware affecting user data

**Does NOT include:**
- Spam emails or phishing attempts (no actual breach)
- Forgotten passwords (user error, not breach)
- Accidental clicks on security emails (if not compromised)

---

## 3. Detection & Response Timeline

### Phase 1: Detection & Assessment (Within 24 hours)

**Who:** Technical team + founder  
**Action items:**

1. **Confirm the breach:** Is personal data actually compromised?
   - Check Firebase authentication logs for unusual access
   - Review Firestore audit logs for data access/modification
   - Check for data exfiltration signs
   - Review payment processor (Yoco) notifications

2. **Document findings:**
   - Date/time of detection
   - How breach was discovered
   - Type of data compromised (names, emails, passes, payment info?)
   - Estimated number of affected users
   - Severity assessment (critical/high/medium/low)

3. **Containment:**
   - Change Firebase admin credentials immediately
   - Enable 2FA on all admin accounts
   - Review access logs for past 30 days
   - Rotate API keys if compromised
   - Enable IP restrictions if available
   - Disable compromised accounts/API keys

4. **Evidence preservation:**
   - Screenshot logs before any cleanup
   - Export audit logs to external storage
   - Document all investigation steps
   - Keep backups of original logs

### Phase 2: Notification (Within 30 days of discovery)

**Required notifications:**

#### A. Information Regulator (South African Government)
- **Contact:** The Information Regulator  
- **Method:** Email to compliance@inforegulator.org.za
- **Required info:**
  - Breach discovery date
  - Description of breach (what happened)
  - Type of data compromised
  - Number of users affected
  - Your company name + contact info
  - Actions taken to contain breach
  - Future prevention measures

**Template email:**
```
Subject: Data Breach Notification - POPIA Section 22

To: The Information Regulator

Dear Information Regulator,

Holiday Pass is notifying you of a data security breach discovered on [DATE].

BREACH DETAILS:
- Date discovered: [DATE]
- Type of data: [names, emails, passes, etc.]
- Number of affected users: [X]
- Cause: [Brief description]

CONTAINMENT ACTIONS TAKEN:
- [Action 1]
- [Action 2]
- [Action 3]

PREVENTION MEASURES:
- [Future action 1]
- [Future action 2]

Contact: portalfredholidaypass@gmail.com | WhatsApp: 065 806 2198

Regards,
[Your Name]
Holiday Pass
```

#### B. Affected Users
- **Contact method:** Email to registered accounts
- **Timeline:** Same day or within 48 hours
- **Required content:**
  - What happened (in simple language)
  - What data was compromised
  - When it happened
  - What you're doing to fix it
  - What users should do (e.g., change password)
  - Support contact

**Template email:**
```
Subject: Important Security Notice - Holiday Pass Account

Dear Holiday Pass User,

We're writing to inform you that on [DATE], we discovered a security issue 
affecting your Holiday Pass account. We take this very seriously.

WHAT HAPPENED:
[Simple explanation of breach]

WHAT DATA WAS AFFECTED:
- Your name and email address
- [Other data types if applicable]
- Payment information was NOT affected (processed by Yoco)

WHAT WE'VE DONE:
- Secured our systems immediately
- Investigated the breach thoroughly
- Reported to South African authorities

WHAT YOU SHOULD DO:
1. Change your Holiday Pass password immediately
2. Check your email for suspicious activity
3. Monitor your bank statements
4. Contact us if you notice anything unusual

NEED HELP?
Email: portalfredholidaypass@gmail.com
WhatsApp: 065 806 2198

Thank you for being a Holiday Pass user.

Regards,
Holiday Pass Team
```

### Phase 3: Investigation & Root Cause (Within 30-60 days)

**Investigate:**
- How did attacker gain access? (weak password, phishing, vulnerability?)
- How long did they have access?
- What systems/data were accessed?
- Were there early warning signs we missed?

**Document findings in:**
- Internal incident report (keep in secure folder)
- Share findings with team for learning

**Publish findings to users:**
- Email users a follow-up with findings
- What we learned
- How we're preventing it in future

---

## 4. Prevention Measures (Ongoing)

### Current Security Practices
- ✅ Firebase authentication (Google-managed)
- ✅ Firestore encryption at rest
- ✅ HTTPS/SSL for all connections
- ✅ Environment variables for secrets (not hardcoded)
- ✅ Yoco handles payment data (PCI compliant)

### To Implement
- [ ] Enable Firebase 2FA on admin account
- [ ] Set up Firebase audit logging alerts
- [ ] Monthly security review of access logs
- [ ] Backup Firestore data weekly
- [ ] Regular password rotation (admin accounts)
- [ ] IP whitelisting for admin access
- [ ] Security update monitoring (dependencies)

---

## 5. Contact Information

**Founder/Data Owner:**
- Name: [Your Name]
- Email: portalfredholidaypass@gmail.com
- WhatsApp: 065 806 2198
- Address: [Your Port Alfred Address]

**Information Regulator (Report To):**
- Email: compliance@inforegulator.org.za
- Website: https://www.inforegulator.org.za/

**Payment Processor (Yoco) - Report If Affected:**
- Contact: security@yoco.com
- (Only if payment data was accessed)

---

## 6. User Communication Template

Save this template for quick response:

### Incident Type: Unauthorized Access (No data exfiltration)
**Severity:** Medium  
**User message:** We detected suspicious activity but data was not compromised. We've secured the system.

### Incident Type: Personal Data Exposed
**Severity:** High  
**User message:** Names/emails were exposed. Change your password immediately. No payment info was affected.

### Incident Type: Password Database Compromised
**Severity:** Critical  
**User message:** Password database was accessed. Change your password immediately on Holiday Pass and any other services using same password.

---

## 7. Post-Incident Review (After 60 days)

- [ ] Was response timeline met? (30 days)
- [ ] Did we notify all required parties?
- [ ] Did we learn how breach occurred?
- [ ] Did we fix the vulnerability?
- [ ] Are new security measures in place?
- [ ] Should we conduct security audit?

---

## 8. Compliance Checklist

| Requirement | Status | Notes |
|---|---|---|
| Breach detection system | ⚠️ Manual | Monitoring logs regularly |
| 30-day notification timeline | ✅ Defined | In this document |
| Information Regulator contact | ✅ Defined | compliance@inforegulator.org.za |
| User notification process | ✅ Defined | Email + WhatsApp support |
| Root cause investigation | ✅ Defined | 30-60 day investigation |
| Prevention measures | ⚠️ Partial | Implementing now (see Section 4) |
| Documentation | ✅ This doc | All procedures documented |

---

## 9. Scenario Drills

**Scenario 1: Firebase account hacked**
- Response: Change password, rotate keys, check logs, notify users of "suspicious login attempt"

**Scenario 2: Firestore data deleted**
- Response: Restore from backup, contact Firebase support, notify users of data recovery, investigate cause

**Scenario 3: Payment data accessed**
- Response: Contact Yoco immediately, freeze account temporarily, notify users, contact Information Regulator

---

## 10. Annual Review

This plan will be reviewed annually or after any security incident. Updates will be made to:
- Contact information
- System architecture (as it changes)
- Security measures
- Regulatory requirements

**Last reviewed:** November 25, 2025  
**Next review:** November 2026

---

## Appendix: Information Regulator Filing

When you need to file with Information Regulator:

1. Go to: https://www.inforegulator.org.za/
2. Look for "Report a breach" or "Complaints" section
3. Fill out form OR email compliance@inforegulator.org.za
4. Reference this document + incident report
5. Keep copy of submission for records

**Filing fee:** None (government agency)  
**Processing time:** 30+ days (expect follow-up questions)

---

**Document Version:** 1.0  
**Status:** Active - Implement before launch  
**Owner:** [Your Name]  
**Next Update:** November 2026
