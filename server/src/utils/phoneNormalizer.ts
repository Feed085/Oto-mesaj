export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    digits = digits.slice(1);
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("994")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return "994" + digits.slice(1);
  }

  if (digits.length === 9) {
    return "994" + digits;
  }

  return digits;
}

export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length === 12 && normalized.startsWith("994")) {
    return `+994 ${normalized.slice(3, 5)} ${normalized.slice(5, 7)} ${normalized.slice(7, 9)} ${normalized.slice(9, 11)}`;
  }
  return "+" + normalized;
}

export function formatPhoneForWhatsApp(phone: string): string {
  return normalizePhone(phone);
}
