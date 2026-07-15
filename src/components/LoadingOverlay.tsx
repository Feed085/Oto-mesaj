export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            PDF İşleniyor...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Lütfen bekleyin
          </p>
        </div>
      </div>
    </div>
  );
}
