import { useState, useCallback, useMemo } from "react";
import type { Company, FilterType } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { generateMessage } from "@/utils/message";

export function useCompanies() {
  const [companies, setCompanies] = useLocalStorage<Company[]>(
    "oto-mesaj-companies",
    []
  );
  const [template, setTemplate] = useLocalStorage<string>(
    "oto-mesaj-template",
    "Merhaba {ad},\n\nSize nasıl yardımcı olabiliriz?"
  );
  const [sentStatus, setSentStatus] = useLocalStorage<Record<string, boolean>>(
    "oto-mesaj-sent",
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const companiesWithMessages = useMemo(() => {
    return companies.map((c) => ({
      ...c,
      message: generateMessage(template, c.name),
      sent: sentStatus[c.id] ?? false,
    }));
  }, [companies, template, sentStatus]);

  const filteredCompanies = useMemo(() => {
    let result = companiesWithMessages;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query)
      );
    }

    if (filter === "sent") {
      result = result.filter((c) => c.sent);
    } else if (filter === "pending") {
      result = result.filter((c) => !c.sent);
    }

    return result;
  }, [companiesWithMessages, searchQuery, filter]);

  const stats = useMemo(() => {
    const total = companiesWithMessages.length;
    const sent = companiesWithMessages.filter((c) => c.sent).length;
    const pending = total - sent;
    const percentage = total > 0 ? Math.round((sent / total) * 100) : 0;
    return { total, sent, pending, percentage };
  }, [companiesWithMessages]);

  const uploadPdf = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("pdf", file);

        const response = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "PDF işlenirken hata oluştu.");
        }

        const newCompanies: Company[] = data.data.companies.map(
          (c: { id: string; name: string; phone: string; rawPhone: string }) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            rawPhone: c.rawPhone,
            message: generateMessage(template, c.name),
            sent: false,
            createdAt: Date.now(),
          })
        );

        setCompanies((prev) => [...prev, ...newCompanies]);

        return {
          totalPages: data.data.totalPages,
          totalLines: data.data.totalLines,
          parsedLines: data.data.parsedLines,
          errors: data.data.errors,
          newCount: newCompanies.length,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Bilinmeyen hata oluştu.";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [template, setCompanies]
  );

  const toggleSent = useCallback(
    (id: string) => {
      setSentStatus((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    },
    [setSentStatus]
  );

  const markAllSent = useCallback(() => {
    const updates: Record<string, boolean> = {};
    filteredCompanies.forEach((c) => {
      updates[c.id] = true;
    });
    setSentStatus((prev) => ({ ...prev, ...updates }));
  }, [filteredCompanies, setSentStatus]);

  const clearAll = useCallback(() => {
    setCompanies([]);
    setSentStatus({});
  }, [setCompanies, setSentStatus]);

  return {
    companies: filteredCompanies,
    allCompanies: companiesWithMessages,
    stats,
    template,
    setTemplate,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    isLoading,
    error,
    setError,
    uploadPdf,
    toggleSent,
    markAllSent,
    clearAll,
  };
}
