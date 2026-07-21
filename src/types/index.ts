export interface Company {
  id: string;
  name: string;
  phone: string;
  rawPhone: string;
  message: string;
  sent: boolean;
  createdAt: number;
  processId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
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

export interface Process {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  pdfFile?: string;
}

export type Theme = "light" | "dark";
