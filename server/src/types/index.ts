export interface Company {
  id: string;
  name: string;
  phone: string;
  rawPhone: string;
  message: string;
  sent: boolean;
  createdAt: number;
}

export interface ParseResult {
  companies: Company[];
  totalPages: number;
  totalLines: number;
  parsedLines: number;
  errors: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
