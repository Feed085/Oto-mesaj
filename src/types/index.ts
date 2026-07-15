export interface Company {
  id: string;
  name: string;
  phone: string;
  rawPhone: string;
  message: string;
  sent: boolean;
  createdAt: number;
}

export interface PdfParseResponse {
  companies: Array<{
    id: string;
    name: string;
    phone: string;
    rawPhone: string;
  }>;
  totalPages: number;
  totalLines: number;
  parsedLines: number;
  errors: string[];
}

export type FilterType = "all" | "sent" | "pending";

export type Theme = "light" | "dark";
