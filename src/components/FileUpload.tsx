import { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File, processId: string) => Promise<{
    totalPages: number;
    totalLines: number;
    parsedLines: number;
    errors: string[];
    newCount: number;
  } | void>;
  processId: string;
  processName?: string;
  isLoading: boolean;
}

export function FileUpload({ onUpload, processId, processName, isLoading }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    message: string;
    type: "success" | "error";
    details?: string[];
  } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setUploadResult({
          message: "Sadece PDF dosyaları kabul edilmektedir.",
          type: "error",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setUploadResult({
          message: "Dosya boyutu 50MB'ı aşamaz.",
          type: "error",
        });
        return;
      }

      try {
        setUploadResult(null);
        const result = await onUpload(file, processId);
        if (result) {
          setUploadResult({
            message: `${result.newCount} şirket bulundu (${result.totalPages} sayfa, ${result.parsedLines} satır ayrıştırıldı)`,
            type: "success",
            details: result.errors.length > 0 ? result.errors : undefined,
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Yükleme hatası oluştu.";
        setUploadResult({ message, type: "error" });
      }
    },
    [onUpload, processId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
          {processName || "Aktif İşlem"}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          PDF yükleme için hazır
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-8
          transition-all duration-300 ease-in-out
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${isLoading ? "pointer-events-none opacity-60" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={`
              p-4 rounded-full transition-colors duration-300
              ${
                isDragOver
                  ? "bg-blue-100 dark:bg-blue-800/30"
                  : "bg-gray-100 dark:bg-gray-800"
              }
            `}
          >
            {isLoading ? (
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload
                className={`w-12 h-12 transition-colors duration-300 ${
                  isDragOver
                    ? "text-blue-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {isLoading
                ? "PDF işleniyor..."
                : "PDF dosyasını sürükle veya tıkla"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Şirket adı ve telefon numaraları otomatik olarak ayrıştırılacak
            </p>
          </div>

          {!isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <FileText className="w-4 h-4" />
              <span>Yalnızca .pdf dosyaları (maks. 50MB)</span>
            </div>
          )}
        </div>
      </div>

      {uploadResult && (
        <div
          className={`
            mt-4 p-4 rounded-xl animate-slide-up
            ${
              uploadResult.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }
          `}
        >
          <div className="flex items-start gap-3">
            {uploadResult.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`font-medium ${
                  uploadResult.type === "success"
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {uploadResult.message}
              </p>
              {uploadResult.details && uploadResult.details.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    Uyarılar:
                  </p>
                  <ul className="mt-1 space-y-1">
                    {uploadResult.details.slice(0, 5).map((d, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-500 dark:text-gray-400"
                      >
                        {d}
                      </li>
                    ))}
                    {uploadResult.details.length > 5 && (
                      <li className="text-xs text-gray-400">
                        ...ve {uploadResult.details.length - 5} uyarı daha
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
