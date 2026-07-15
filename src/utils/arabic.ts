const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_CHAR_RANGE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

export function hasArabic(text: string): boolean {
  return ARABIC_CHAR_REGEX.test(text);
}

export function getArabicRatio(text: string): number {
  const matches = text.match(ARABIC_CHAR_RANGE);
  if (!matches) return 0;
  return matches.length / text.length;
}

export function fixArabicText(text: string): string {
  if (!hasArabic(text)) return text;

  const ratio = getArabicRatio(text);
  if (ratio < 0.2) return text;

  const words = text.split(/(\s+)/);
  const reversed = words.map((word) => {
    if (/^\s+$/.test(word)) return word;
    if (hasArabic(word)) {
      return word.split("").reverse().join("");
    }
    return word;
  });

  return reversed.join("");
}

export function getTextDirection(text: string): "rtl" | "ltr" {
  if (hasArabic(text)) {
    const ratio = getArabicRatio(text);
    if (ratio > 0.3) return "rtl";
  }
  return "ltr";
}
