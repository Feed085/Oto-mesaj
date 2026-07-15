import { FileText, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Oto Mesaj
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            ile yapıldı
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>React + TypeScript + TailwindCSS</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>Node.js + Express + pdf.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
