import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function SearchBar({
  value,
  onChange,
  totalCount,
  filteredCount,
}: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Şirket adı veya telefon ile ara..."
        className="
          w-full pl-12 pr-12 py-3.5
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl
          text-gray-800 dark:text-gray-200
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          shadow-sm dark:shadow-none
        "
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {value && (
        <div className="absolute right-12 inset-y-0 flex items-center pr-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            {filteredCount}/{totalCount}
          </span>
        </div>
      )}
    </div>
  );
}
