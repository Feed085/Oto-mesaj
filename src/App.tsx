import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileUpload } from "@/components/FileUpload";
import { StatsCards } from "@/components/StatsCards";
import { MessageTemplate } from "@/components/MessageTemplate";
import { SearchBar } from "@/components/SearchBar";
import { FilterTabs } from "@/components/FilterTabs";
import { DataTable } from "@/components/DataTable";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ProcessSelector } from "@/components/ProcessSelector";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function App() {
  const { user, token, isLoading: authLoading, login, register, logout } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const {
    companies,
    allCompanies,
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
  } = useCompanies();

  const filterCounts = {
    all: allCompanies.length,
    sent: allCompanies.filter((c) => c.sent).length,
    pending: allCompanies.filter((c) => !c.sent).length,
  };

  const handleLogin = async (data: any) => {
    setIsAuthLoading(true);
    try {
      await login(data);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    setIsAuthLoading(true);
    try {
      await register(data);
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return isLoginView ? (
      <LoginForm onSubmit={handleLogin} isLoading={isAuthLoading} onSwitchToRegister={() => setIsLoginView(false)} />
    ) : (
      <RegisterForm onSubmit={handleRegister} isLoading={isAuthLoading} onSwitchToLogin={() => setIsLoginView(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      {isLoading && <LoadingOverlay />}

      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <ProcessSelector
              processes={processes}
              activeProcessId={activeProcessId}
              onSelectProcess={setActiveProcessId}
              onCreateProcess={createProcess}
              onDeleteProcess={deleteProcess}
            />
          </div>
        </div>

        {activeProcessId && (
          <FileUpload 
            onUpload={uploadPdf} 
            processId={activeProcessId} 
            processName={processes.find(p => p.id === activeProcessId)?.name}
            isLoading={isLoading} 
          />
        )}

        <StatsCards
          total={stats.total}
          sent={stats.sent}
          pending={stats.pending}
          percentage={stats.percentage}
        />

        {allCompanies.length > 0 && (
          <MessageTemplate
            template={template}
            onChange={setTemplate}
          />
        )}

        {allCompanies.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  totalCount={allCompanies.length}
                  filteredCount={companies.length}
                />
              </div>
              <FilterTabs
                active={filter}
                onChange={setFilter}
                counts={filterCounts}
              />
            </div>

            <DataTable
              companies={companies}
              template={template}
              onToggleSent={toggleSent}
              onMarkAllSent={markAllSent}
              onClearAll={clearAll}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
