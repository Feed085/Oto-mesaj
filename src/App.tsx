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
import { useCompanies } from "@/hooks/useCompanies";

export default function App() {
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
    toggleSent,
    markAllSent,
    clearAll,
  } = useCompanies();

  const filterCounts = {
    all: allCompanies.length,
    sent: allCompanies.filter((c) => c.sent).length,
    pending: allCompanies.filter((c) => !c.sent).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      {isLoading && <LoadingOverlay />}

      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <FileUpload onUpload={uploadPdf} isLoading={isLoading} />

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
