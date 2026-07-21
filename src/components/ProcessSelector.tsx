import { useState, useEffect } from "react";
import { FolderPlus, ChevronDown, Trash2, Plus, X } from "lucide-react";
import type { Process } from "@/types";
import { ProcessForm } from "./ProcessForm";

interface ProcessSelectorProps {
  processes: Process[];
  activeProcessId: string | null;
  onSelectProcess: (processId: string | null) => void;
  onCreateProcess: (name: string, description: string) => Promise<string>;
  onDeleteProcess: (processId: string) => void;
}

export function ProcessSelector({
  processes,
  activeProcessId,
  onSelectProcess,
  onCreateProcess,
  onDeleteProcess,
}: ProcessSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [isCreatingProcess, setIsCreatingProcess] = useState(false);

  const activeProcess = processes.find((p) => p.id === activeProcessId);

  const handleCreateProcess = async (name: string, description: string) => {
    setIsCreatingProcess(true);
    try {
      await onCreateProcess(name, description);
      setShowProcessForm(false);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to create process:", err);
    } finally {
      setIsCreatingProcess(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-colors w-full sm:w-auto"
      >
        <FolderPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {activeProcess ? activeProcess.name : "İşlem Seçin"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activeProcess ? activeProcess.description || "Açıklama yok" : "Müşteri listesi için işlem seçin"}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={() => {
                  setShowProcessForm(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Yeni İşlem Oluştur
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Yeni müşteri listesi için işlem
                  </p>
                </div>
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {processes.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Henüz işlem oluşturulmadı
                </div>
              ) : (
                processes.map((process) => (
                  <div
                    key={process.id}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <button
                      onClick={() => {
                        onSelectProcess(process.id);
                        setIsOpen(false);
                      }}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <div className={`p-2 rounded-lg ${activeProcessId === process.id ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-700"}`}>
                        <FolderPlus className={`w-4 h-4 ${activeProcessId === process.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${activeProcessId === process.id ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200"}`}>
                          {process.name}
                        </p>
                        {process.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {process.description}
                          </p>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProcess(process.id);
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      title="İşlemi sil"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {showProcessForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Yeni İşlem Oluştur
                </h2>
                <button
                  onClick={() => setShowProcessForm(false)}
                  disabled={isCreatingProcess}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <ProcessForm
                onSubmit={handleCreateProcess}
                onCancel={() => setShowProcessForm(false)}
                isLoading={isCreatingProcess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
