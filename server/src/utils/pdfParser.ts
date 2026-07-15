import * as pdfjsLib from "pdfjs-dist";
import { normalizePhone } from "./phoneNormalizer.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  "https://unpkg.com"
).href;

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const ARABIC_CHAR_RANGE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

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

const LINE_PATTERNS = [
  /^(.+?)\s*[-–—]\s*([+]?[\d][\d\s\-()]{6,})\s*$/,
  /^(.+?)\s+([+]?[\d][\d\s\-()]{6,})\s*$/,
];

function extractDigits(phone: string): string {
  return phone.replace(/[^\d]/g, "");
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

  for (const pattern of LINE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      let name = match[1].trim();
      const phoneRaw = match[2].trim();

      name = reverseArabicText(name);

      const digits = extractDigits(phoneRaw);
      if (digits.length < 7 || digits.length > 15) continue;

      const normalized = normalizePhone(phoneRaw);
      if (normalized.length < 9) continue;

      const trimmedDigits = trimPhoneDigits(normalized);
      if (trimmedDigits !== normalized) {
        const code = Object.keys(COUNTRY_CODE_MAX_DIGITS).find((c) =>
          normalized.startsWith(c)
        );
        if (code) {
          const localPart = trimmedDigits.slice(code.length);
          const fixed = normalizePhone(code + localPart);
          if (fixed.length >= 9) {
            return {
              name,
              phone: fixed,
              rawLine: trimmed,
            };
          }
        }
        return {
          name,
          phone: trimmedDigits,
          rawLine: trimmed,
        };
      }

      return {
        name,
        phone: normalized,
        rawLine: trimmed,
      };
    }
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

        pageText += item.str;
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
