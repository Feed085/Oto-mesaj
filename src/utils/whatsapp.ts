import { normalizePhone } from "./phone";

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalizedPhone = normalizePhone(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

export function openWhatsApp(phone: string, message: string): void {
  const url = buildWhatsAppUrl(phone, message);
  window.open(url, "_blank", "noopener,noreferrer");
}
