export const copy = {
  productName: 'Estate Pass',
  productShortName: 'Estate',

  nav: {
    credential: 'My Pass',
    guests: 'Guest Passes',
    offers: 'Benefits',
    help: 'Account',
  },

  landing: {
    title: 'Estate Pass',
    subtitle: 'Access • Guests • Verification',
    signIn: 'Sign in',
    staffLink: 'Verifier mode',
  },

  credential: {
    title: 'Credential',
    guestTitle: 'Guest Pass',
    subtitle: 'Show at checkpoint.',
    codeLabel: 'Rotating Code',
    codeSubtitle: 'Changes every 30 seconds',
    lastVerifiedLabel: 'Last verified',
    memberLabel: 'Member / Unit',
    validFromLabel: 'Valid from',
    validToLabel: 'Valid until',
    status: {
      active: 'ACTIVE',
      expiringSoon: 'EXPIRING SOON',
      notYetValid: 'NOT YET VALID',
      expired: 'EXPIRED',
      inactive: 'INACTIVE',
      guest: 'GUEST',
      invalid: 'INVALID',
    },
  },

  guests: {
    title: 'Guests',
    subtitle: 'Create a time-bound link.',
    createCta: 'Create link',
    form: {
      guestNameLabel: 'Name (optional)',
      startLabel: 'Start date/time',
      endLabel: 'End date/time',
      submit: 'Create pass link',
      submitting: 'Creating…',
    },
    share: {
      title: 'Share pass',
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
