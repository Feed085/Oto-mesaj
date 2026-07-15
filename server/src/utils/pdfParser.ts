import * as pdfjsLib from "pdfjs-dist";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { normalizePhone } from "./phoneNormalizer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.resolve(__dirname, "../../../node_modules/pdfjs-dist/build/pdf.worker.mjs")
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
  /^(.+?)\s*[-–—]\s*([+\d][\d\s\-()+ ]+)\s*$/,
  /^(.+?)\s+([+\d][\d\s\-()+ ]+)\s*$/,
];

export function parseLine(line: string): ParsedLine | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 3) return null;

  for (const pattern of LINE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      let name = match[1].trim();
      const phoneRaw = match[2].trim();

      name = reverseArabicText(name);

      const digits = phoneRaw.replace(/[^\d]/g, "");
      if (digits.length < 7 || digits.length > 15) continue;

      const normalized = normalizePhone(phoneRaw);
      if (normalized.length < 9) continue;

      return {
        name,
        phone: normalized,
        rawLine: trimmed,
      };
    }
  }

  return null;
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

    let lastY: number | null = null;
    let pageText = "";

    for (const item of content.items) {
      if ("str" in item) {
        const y = item.transform[5];

        if (lastY !== null && Math.abs(y - lastY) > 2) {
          pageText += "\n";
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
