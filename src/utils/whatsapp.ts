export const normalizeWhatsappNumber = (value: string): string => String(value || '').replace(/\D/g, '');

export const renderWhatsappTemplate = (
  template: string,
  vars: { name: string; suburb: string; campaign: string; serviceType?: string }
): string => {
  const t = String(template || '');
  return t
    .split('{name}').join(vars.name)
    .split('{suburb}').join(vars.suburb)
    .split('{campaign}').join(vars.campaign)
    .split('{serviceType}').join(vars.serviceType || '');
};

export const buildWaMeLink = (whatsappNumberDigits: string, message: string): string => {
  const number = normalizeWhatsappNumber(whatsappNumberDigits);
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
};

export const buildWhatsAppShareLink = (message: string): string => {
  const text = encodeURIComponent(message);
  return `https://wa.me/?text=${text}`;
};
