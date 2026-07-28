import * as pdfjsLib from "pdfjs-dist";
import { normalizePhone } from "./phoneNormalizer.js";
import { createRequire } from "module";
import { pathToFileURL } from "url";

const require = createRequire(import.meta.url);
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  require.resolve("pdfjs-dist/build/pdf.worker.mjs")
).href;

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const ARABIC_CHAR_RANGE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

/**
 * PDF'den çıkarılan metinde Azerbaycan diline özgü karakterlerin
 * hatalı encoding nedeniyle bozulmasını düzeltir.
 *
 * pdfjs-dist bazı PDF'lerdeki ə (\u0259) ve Ə (\u018F) gibi
 * Azerbaycan harflerini farklı Unicode noktaları veya glyph
 * eşlemeleri ile çıkarabilir. Bu fonksiyon bilinen hatalı
 * eşlemeleri doğru karakterlerle değiştirir.
 */
function normalizeAzerbaijaniChars(text: string): string {
  return (
    text
      // --- ə (küçük schwa) için yanlış glyph eşlemeleri ---
      // Bazı PDF fontları ə için \u00E6 (æ) kullanır
      .replace(/\u00E6/g, "ə")
      // Bazı PDF fontları ə için \u00F6 (ö) kullanır (Azerbaycan fontlarında)
      // NOT: ö gerçekten ö olabilir; bu satırı yalnızca
      // Azerbaycan-spesifik fontlarda etkinleştirin
      // .replace(/\u00F6/g, 'ə')
      // Bazı fontlar ə yerine Latin Small Schwa (\u0259) üretir — zaten doğru
      // Bazı fontlar ə yerine \uFB01 (fi ligature) benzeri özel kodlar kullanır
      .replace(/\uFB01/g, "fi") // fi ligature → fi (bunu düzelt)
      .replace(/\uFB02/g, "fl") // fl ligature → fl (bunu düzelt)
      // --- Ə (büyük schwa) için yanlış glyph eşlemeleri ---
      .replace(/\u00C6/g, "Ə") // Æ → Ə
      // --- Diğer Azerbaycan harfleri ---
      // ğ için olası bozulmalar
      .replace(/\u011F/g, "ğ") // zaten ğ, kontrol amaçlı
      // ş için olası bozulmalar
      .replace(/\u015F/g, "ş") // zaten ş, kontrol amaçlı
      // ı (noktasız i) için olası bozulmalar
      .replace(/\u0131/g, "ı") // zaten ı, kontrol amaçlı
      // İ (noktalı I) için olası bozulmalar
      .replace(/\u0130/g, "İ") // zaten İ, kontrol amaçlı
      // ç için olası bozulmalar
      .replace(/\u00E7/g, "ç") // zaten ç, kontrol amaçlı
      // Ç için olası bozulmalar
      .replace(/\u00C7/g, "Ç") // zaten Ç, kontrol amaçlı
      // --- Bazı PDF'lerde ə glyph'i yanlış private-use alanına düşer ---
      // Windows-1252 / Mac-Roman bozulmaları için:
      .replace(/\u008E/g, "Ş") // Windows-1252 0x8E → Ş
      .replace(/\u009E/g, "ş") // Windows-1252 0x9E → ş
      .replace(/\u008A/g, "Š") // Windows-1252 0x8A → S (ş benzeri)
      // Yanlış kodlanan ə: bazı fontlarda \u0065\u0300 (e + birleşik grave) olarak gelir
      .replace(/e\u0300/g, "ə")
      .replace(/E\u0300/g, "Ə")
      // Bazı fontlarda ə \u01DD (turned e) olarak gelir
      .replace(/\u01DD/g, "ə")
  );
}

function hasArabic(text: string): boolean {
  return ARABIC_CHAR_REGEX.test(text);
}

function getArabicRatio(text: string): number {
  const matches = text.match(ARABIC_CHAR_RANGE);
  if (!matches) return 0;
  return matches.length / text.length;
}

function reverseArabicText(text: string): string {
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

export interface ParsedLine {
  name: string;
  phone: string;
  rawLine: string;
}


const COUNTRY_CODE_MAX_DIGITS: Record<string, number> = {
  "994": 12,
  "93": 11,
  "7": 11,
  "90": 11,
  "77": 9,
  "998": 12,
  "996": 12,
  "992": 12,
  "993": 12,
};

function trimPhoneDigits(digits: string): string {
  for (const [code, maxLen] of Object.entries(COUNTRY_CODE_MAX_DIGITS)) {
    if (digits.startsWith(code) && digits.length > maxLen) {
      return digits.slice(0, maxLen);
    }
  }
  if (digits.length > 15) {
    return digits.slice(0, 15);
  }
  return digits;
}

export function parseLine(line: string): ParsedLine | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 3) return null;

  // Broad pattern starting with a plus, digit, or opening parenthesis
  const PHONE_REGEX = /[+(\d][\d\s\-().+]{5,}/g;

  let bestMatch: { phone: string; name: string } | null = null;
  let match;
  PHONE_REGEX.lastIndex = 0;

  while ((match = PHONE_REGEX.exec(trimmed)) !== null) {
    const rawMatch = match[0];
    
    // Split by consecutive spaces to avoid grabbing adjacent columns
    const segments = rawMatch.split(/\s{2,}/);
    const candidateRaw = segments[0].trim();

    // Clean phone candidate: if it has '+' in the middle or end, move it to the front
    let cleanPhone = candidateRaw;
    if (cleanPhone.includes("+")) {
      cleanPhone = "+" + cleanPhone.replace(/\+/g, "");
    }

    const digits = cleanPhone.replace(/[^\d]/g, "");

    if (digits.length >= 7 && digits.length <= 15) {
      const normalized = normalizePhone(cleanPhone);
      if (normalized.length >= 9) {
        const phoneIndex = match.index;
        let namePart = trimmed.substring(0, phoneIndex).trim();
        
        // Clean trailing name separators (multiple consecutive separators allowed)
        namePart = namePart.replace(/[\s-–—,:(]+$/, "").trim();

        // Handle cases where the line number might be at the start of the name, e.g., "39   Trecey's"
        namePart = namePart.replace(/^\d+\s+/, "").trim();

        if (namePart.length > 0) {
          namePart = reverseArabicText(namePart);
          bestMatch = {
            name: namePart,
            phone: normalized,
          };
          break;
        }
      }
    }
  }

  if (bestMatch) {
    const normalized = bestMatch.phone;
    const trimmedDigits = trimPhoneDigits(normalized);
    let finalPhone = normalized;

    if (trimmedDigits !== normalized) {
      const code = Object.keys(COUNTRY_CODE_MAX_DIGITS).find((c) =>
        normalized.startsWith(c)
      );
      if (code) {
        const localPart = trimmedDigits.slice(code.length);
        const fixed = normalizePhone(code + localPart);
        if (fixed.length >= 9) {
          finalPhone = fixed;
        } else {
          finalPhone = trimmedDigits;
        }
      } else {
        finalPhone = trimmedDigits;
      }
    }

    return {
      name: bestMatch.name,
      phone: finalPhone,
      rawLine: trimmed,
    };
  }

  return null;
}

function computeLineBreakThreshold(items: any[]): number {
  const yValues: number[] = [];
  for (const item of items) {
    if ("str" in item && item.str.trim().length > 0) {
      yValues.push(item.transform[5]);
    }
  }
  if (yValues.length < 2) return 2;
  yValues.sort((a, b) => a - b);
  const spacings: number[] = [];
  for (let i = 1; i < yValues.length; i++) {
    const d = Math.abs(yValues[i] - yValues[i - 1]);
    if (d > 0.5) spacings.push(d);
  }
  if (spacings.length === 0) return 2;
  const median = spacings[Math.floor(spacings.length / 2)];
  return Math.max(median * 0.5, 2);
}

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<{ text: string; totalPages: number }> {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  const totalPages = pdf.numPages;
  const textParts: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lineBreakThreshold = computeLineBreakThreshold(content.items);

    let lastY: number | null = null;
    let pageText = "";

    for (const item of content.items) {
      if ("str" in item) {
        const y = item.transform[5];

        if (lastY !== null && Math.abs(y - lastY) > lineBreakThreshold) {
          pageText += "\n";
        } else if (
          pageText.length > 0 &&
          !pageText.endsWith(" ") &&
          !item.str.startsWith(" ")
        ) {
          pageText += " ";
        }

        pageText += normalizeAzerbaijaniChars(item.str);
        lastY = y;
      }
    }

    textParts.push(pageText);
  }

  return {
    text: textParts.join("\n"),
    totalPages,
  };
}

export interface ParseResult {
  companies: ParsedLine[];
  totalPages: number;
  totalLines: number;
  parsedLines: number;
  errors: string[];
}

export function parseTextToCompanies(text: string, totalPages: number): ParseResult {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const companies: ParsedLine[] = [];
  const errors: string[] = [];
  let parsedLines = 0;

  for (const line of lines) {
    const result = parseLine(line);
    if (result) {
      companies.push(result);
      parsedLines++;
    } else {
      const trimmed = line.trim();
      if (trimmed.length > 2 && /\d{7,}/.test(trimmed)) {
        errors.push(`Ayrıştırılamadı: "${trimmed}"`);
      }
    }
  }

  return {
    companies,
    totalPages,
    totalLines: lines.length,
    parsedLines,
    errors,
  };
}
