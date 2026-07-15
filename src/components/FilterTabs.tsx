import type { FilterType } from "@/types";

interface FilterTabsProps {
  active: FilterType;
  onChange: (filter: FilterType) => void;
  counts: {
    all: number;
    sent: number;
    pending: number;
  };
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Hepsi" },
  { key: "sent", label: "Gönderilenler" },
  { key: "pending", label: "Bekleyenler" },
];

export function FilterTabs({ active, onChange, counts }: FilterTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-200
            ${
              active === key
                ? "bg-blue-500 text-white shadow-md shadow-blue-500/25"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }
          `}
        >
          {label}
          <span
            className={`
              ml-2 text-xs px-1.5 py-0.5 rounded-md
              ${
                active === key
                  ? "bg-white/20 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }
            `}
          >
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
