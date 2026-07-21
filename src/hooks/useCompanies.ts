import { useState, useCallback, useMemo, useEffect } from "react";
import type { Company, FilterType, Process } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { generateMessage } from "@/utils/message";

export function useCompanies() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [template, setTemplate] = useState("Merhaba {ad},\n\nSize nasıl yardımcı olabiliriz?");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null);

  // Fetch companies and processes on mount or when token changes
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [companiesRes, processesRes] = await Promise.all([
          fetch("/api/companies", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/processes", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const companiesData = await companiesRes.json();
        const processesData = await processesRes.json();

        if (companiesData.success) {
          setCompanies(companiesData.data);
        }

        if (processesData.success) {
          setProcesses(processesData.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [token]);

  const companiesWithMessages = useMemo(() => {
    return companies.map((c) => ({
      ...c,
      message: generateMessage(template, c.name),
    }));
  }, [companies, template]);

  const filteredCompanies = useMemo(() => {
    let result = companiesWithMessages;

    // Filter by active process
    if (activeProcessId) {
      result = result.filter((c) => c.processId === activeProcessId);
    }

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
  }, [companiesWithMessages, searchQuery, filter, activeProcessId]);

  const stats = useMemo(() => {
    let result = companiesWithMessages;

    // Filter by active process for stats
    if (activeProcessId) {
      result = result.filter((c) => c.processId === activeProcessId);
    }

    const total = result.length;
    const sent = result.filter((c) => c.sent).length;
    const pending = total - sent;
    const percentage = total > 0 ? Math.round((sent / total) * 100) : 0;
    return { total, sent, pending, percentage };
  }, [companiesWithMessages, activeProcessId]);

  const createProcess = useCallback(
    async (name: string, description: string) => {
      try {
        const response = await fetch("/api/processes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, description }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "İşlem oluşturulurken hata oluştu.");
        }

        setProcesses((prev) => [...prev, data.data]);
        setActiveProcessId(data.data.id);
        return data.data.id;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Bilinmeyen hata oluştu.";
        setError(message);
        throw err;
      }
    },
    [token]
  );

  const deleteProcess = useCallback(
    async (processId: string) => {
      try {
        const response = await fetch(`/api/processes/${processId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "İşlem silinirken hata oluştu.");
        }

        setProcesses((prev) => prev.filter((p) => p.id !== processId));
        
        // If deleted process was active, clear it
        if (activeProcessId === processId) {
          setActiveProcessId(null);
        }

        // Remove companies associated with this process
        setCompanies((prev) => prev.filter((c) => c.processId !== processId));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Bilinmeyen hata oluştu.";
        setError(message);
        throw err;
      }
    },
    [activeProcessId, token]
  );

  const uploadPdf = useCallback(
    async (file: File, processId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("pdf", file);
        formData.append("processId", processId);

        const response = await fetch("/api/parse-pdf", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "PDF işlenirken hata oluştu.");
        }

        // Refresh companies from server
        const companiesRes = await fetch("/api/companies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const companiesData = await companiesRes.json();
        if (companiesData.success) {
          setCompanies(companiesData.data);
        }

        return {
          totalPages: data.data.totalPages,
          totalLines: data.data.totalLines,
          parsedLines: data.data.parsedLines,
          errors: data.data.errors,
          newCount: data.data.companies.length,
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
    [token, template]
  );

  const toggleSent = useCallback(
    async (id: string) => {
      const company = companies.find((c) => c.id === id);
      if (!company) return;

      const newSentStatus = !company.sent;

      try {
        const response = await fetch(`/api/companies/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sent: newSentStatus }),
        });

        const data = await response.json();

        if (data.success) {
          setCompanies((prev) =>
            prev.map((c) => (c.id === id ? { ...c, sent: newSentStatus } : c))
          );
        }
      } catch (err) {
        console.error("Failed to update company:", err);
      }
    },
    [companies, token]
  );

  const markAllSent = useCallback(async () => {
    const updates = filteredCompanies.map(async (c) => {
      try {
        await fetch(`/api/companies/${c.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sent: true }),
        });
      } catch (err) {
        console.error("Failed to update company:", err);
      }
    });

    await Promise.all(updates);

    // Refresh companies
    const companiesRes = await fetch("/api/companies", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const companiesData = await companiesRes.json();
    if (companiesData.success) {
      setCompanies(companiesData.data);
    }
  }, [filteredCompanies, token]);

  const clearAll = useCallback(async () => {
    if (!activeProcessId) return;

    try {
      await fetch(`/api/companies/process/${activeProcessId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCompanies((prev) => prev.filter((c) => c.processId !== activeProcessId));
    } catch (err) {
      console.error("Failed to clear companies:", err);
    }
  }, [activeProcessId, token]);

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
    createProcess,
    deleteProcess,
    processes,
    activeProcessId,
    setActiveProcessId,
    toggleSent,
    markAllSent,
    clearAll,
  };
}
