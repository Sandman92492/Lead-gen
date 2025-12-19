export const copy = {
  productName: 'Lead Wallet',
  productShortName: 'Lead Wallet',

  nav: {
    leads: 'Leads',
    campaigns: 'Campaigns',
    qr: 'QR',
    settings: 'Settings',
    // Backward-compat (legacy keys)
    credential: 'QR',
    guests: 'Campaigns',
    offers: 'Leads',
    help: 'Settings',
  },

  landing: {
    title: 'Lead Wallet',
    subtitle: 'Campaigns • QR • WhatsApp follow-up',
    signIn: 'Sign in',
    staffLink: 'Admin',
  },

  // Backward-compat (legacy copy used by unused components)
  credential: {
    title: 'QR',
    guestTitle: 'Benefit Pass',
    subtitle: 'Show this to claim your offer.',
    codeLabel: 'QR Code',
    codeSubtitle: 'Scan to claim',
    lastVerifiedLabel: 'Last activity',
    memberLabel: 'Reference',
    validFromLabel: 'Valid from',
    validToLabel: 'Valid until',
    status: {
      active: 'ACTIVE',
      expiringSoon: 'EXPIRING SOON',
      notYetValid: 'NOT YET VALID',
      expired: 'EXPIRED',
      inactive: 'INACTIVE',
      guest: 'PASS',
      invalid: 'INVALID',
    },
  },

  guests: {
    title: 'Campaigns',
    subtitle: 'Create a campaign link.',
    createCta: 'Create campaign',
    form: {
      guestNameLabel: 'Name',
      startLabel: 'Start',
      endLabel: 'End',
      submit: 'Create link',
      submitting: 'Creating…',
    },
    share: {
      title: 'Share link',
      copy: 'Copy link',
      copied: 'Copied',
      whatsapp: 'Share on WhatsApp',
    },
  },

  help: {
    title: 'Help & Profile',
    subtitle: 'Account, device, support.',
    accountSectionTitle: 'Account',
    installSectionTitle: 'Add to Home Screen',
    supportSectionTitle: 'Support',
    signOut: 'Sign out',
    installButton: 'Add to Home Screen',
    installIos: 'iPhone/iPad: Share → Add to Home Screen',
    installAndroid: 'Android: Browser menu → Add to Home screen',
    supportEmailLabel: 'Email',
    supportWhatsappLabel: 'WhatsApp',
  },

  verifier: {
    title: 'Verifier Mode',
    subtitle: 'Unlock, then verify codes.',
    pinTitle: 'Staff PIN',
    pinHint: 'Enter 4 digits',
    unlock: 'Unlock',
    unlocking: 'Unlocking…',
    checkpointLabel: 'Checkpoint',
    codeLabel: 'Enter 6-digit code',
    verify: 'Verify',
    verifying: 'Verifying…',
    verifyNext: 'Verify next',
    lockedHint: 'Sign in to unlock verifier mode.',
  },

  admin: {
    title: 'Admin',
    tabs: {
      credentials: 'Credentials',
      staff: 'Staff',
      checkpoints: 'Checkpoints',
      logs: 'Logs',
    },
    importMembers: {
      title: 'Import Members (CSV)',
      hint: 'Upload a CSV to create/update credentials. Wiring comes next.',
      fieldHint: 'Expected columns: displayName, memberNo, unitNo, validFrom, validTo, credentialType',
      action: 'Choose CSV file',
    },
  },

  support: {
    email: 'support@example.com',
    whatsappNumberE164: '27799569040',
  },
} as const;
