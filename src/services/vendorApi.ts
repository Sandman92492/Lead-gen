export interface VendorSummary {
  vendorId: string;
  name: string;
}

export interface VendorLoginResult {
  success: boolean;
  error?: string;
  sessionId?: string;
  vendor?: VendorSummary;
  expiresAt?: string;
}

export interface VendorCustomerInfo {
  name: string;
  email: string;
  photoURL?: string;
}

export interface VendorRedemptionRow {
  redeemedAt: string;
  dealName: string;
  passId: string;
  userId: string;
  customer: VendorCustomerInfo;
}

export interface VendorRedemptionsResult {
  success: boolean;
  error?: string;
  vendorId?: string;
  redemptions?: VendorRedemptionRow[];
}

const safeJson = async (response: Response): Promise<any> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const vendorLogin = async (vendorId: string, pin: string): Promise<VendorLoginResult> => {
  try {
    const response = await fetch('/.netlify/functions/vendor-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, pin }),
    });

    const data = await safeJson(response);
    if (!response.ok || !data?.ok) {
      return { success: false, error: data?.error || 'Login failed' };
    }

    return {
      success: true,
      sessionId: String(data.sessionId || ''),
      vendor: {
        vendorId: String(data.vendor?.vendorId || vendorId),
        name: String(data.vendor?.name || vendorId),
      },
      expiresAt: String(data.expiresAt || ''),
    };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const getVendorRedemptions = async (
  sessionId: string,
  params?: { from?: string; to?: string; limit?: number }
): Promise<VendorRedemptionsResult> => {
  try {
    const response = await fetch('/.netlify/functions/vendor-redemptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        from: params?.from,
        to: params?.to,
        limit: params?.limit,
      }),
    });

    const data = await safeJson(response);
    if (!response.ok || !data?.ok) {
      return { success: false, error: data?.error || 'Could not load redemptions' };
    }

    const rows: VendorRedemptionRow[] = Array.isArray(data.redemptions)
      ? data.redemptions.map((r: any) => ({
        redeemedAt: String(r.redeemedAt || ''),
        dealName: String(r.dealName || ''),
        passId: String(r.passId || ''),
        userId: String(r.userId || ''),
        customer: {
          name: String(r.customer?.name || ''),
          email: String(r.customer?.email || ''),
          photoURL: r.customer?.photoURL ? String(r.customer.photoURL) : undefined,
        },
      }))
      : [];

    return {
      success: true,
      vendorId: String(data.vendorId || ''),
      redemptions: rows,
    };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

