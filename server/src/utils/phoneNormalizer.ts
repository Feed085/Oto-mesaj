const MAX_DIGITS: [string, number][] = [
  ["994", 12],
  ["93", 11],
  ["7", 11],
  ["90", 11],
  ["77", 9],
  ["998", 12],
  ["996", 12],
  ["992", 12],
  ["993", 12],
];

export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    digits = digits.slice(1);
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("994")) {
    return trimToMax(digits);
  }

  if (digits.startsWith("90")) {
    return trimToMax(digits);
  }

  // Turkish local numbers: 0 + 10 digits = 11 total
  if (digits.startsWith("0") && digits.length === 11) {
    return trimToMax("90" + digits.slice(1));
  }

  // Azerbaijani local numbers: 0 + 9 digits = 10 total
  if (digits.startsWith("0") && digits.length === 10) {
    return trimToMax("994" + digits.slice(1));
  }

  // Fallback for other 0-prefixed numbers
  if (digits.startsWith("0")) {
    return trimToMax("994" + digits.slice(1));
  }

  if (digits.length === 9) {
    return trimToMax("994" + digits);
  }

  return trimToMax(digits);
}

function trimToMax(digits: string): string {
  for (const [code, maxLen] of MAX_DIGITS) {
    if (digits.startsWith(code) && digits.length > maxLen) {
      return digits.slice(0, maxLen);
    }
  }
  if (digits.length > 15) {
    return digits.slice(0, 15);
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
  const normalized = normalizePhone(phone);
  return "+" + normalized;
}
