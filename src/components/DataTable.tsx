import { memo, useCallback } from "react";
import {
  FixedSizeList as List,
  ListChildComponentProps,
} from "react-window";
import {
  Phone,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Circle,
  Trash2,
  Instagram,
  Music,
} from "lucide-react";
import type { Company } from "@/types";
import { formatPhoneForDisplay } from "@/utils/phone";
import { openWhatsApp } from "@/utils/whatsapp";
import { openInstagramSearch } from "@/utils/instagram";
import { openTikTokSearch } from "@/utils/tiktok";
import { getTextDirection } from "@/utils/arabic";
import { copyToClipboard } from "@/utils/clipboard";

interface DataTableProps {
  companies: Company[];
  template: string;
  onToggleSent: (id: string) => void;
  onMarkAllSent: () => void;
  onClearAll: () => void;
}

interface CompanyRowProps extends ListChildComponentProps {
  data: {
    companies: Company[];
    template: string;
    onToggleSent: (id: string) => void;
  };
}

const CompanyRow = memo(({ index, style, data }: CompanyRowProps) => {
  const company = data.companies[index];
  const template = data.template;
  const onToggleSent = data.onToggleSent;

  const handleWhatsApp = useCallback(() => {
    openWhatsApp(company.phone, company.message);
    if (!company.sent) {
      onToggleSent(company.id);
    }
  }, [company.phone, company.message, company.id, company.sent, onToggleSent]);

  const handleInstagram = useCallback(async () => {
    const message = template.replace(/\{ad\}/g, company.name);
    await copyToClipboard(message);
    openInstagramSearch(company.name);
    if (!company.sent) {
      onToggleSent(company.id);
    }
  }, [company.name, template, company.id, company.sent, onToggleSent]);

  const handleTikTok = useCallback(async () => {
    const message = template.replace(/\{ad\}/g, company.name);
    await copyToClipboard(message);
    openTikTokSearch(company.name);
    if (!company.sent) {
      onToggleSent(company.id);
    }
  }, [company.name, template, company.id, company.sent, onToggleSent]);

  const handleToggle = useCallback(() => {
    onToggleSent(company.id);
  }, [company.id, onToggleSent]);

  const dir = getTextDirection(company.name);

  return (
    <div
      style={style}
      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
    >
      <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[7fr_1fr_auto_auto] gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 items-center h-full">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 min-w-0">
          <div className="flex items-center gap-2 lg:gap-3 min-w-0">
            <div
              className={`
                w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shrink-0
                ${
                  company.sent
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-gray-100 dark:bg-gray-700"
                }
              `}
            >
              <span className="text-sm lg:text-lg">
                {company.sent ? "✓" : "🏢"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="font-semibold text-sm lg:text-base text-gray-800 dark:text-gray-100 truncate"
                dir={dir}
              >
                {company.name}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
              {formatPhoneForDisplay(company.phone)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <button
            onClick={handleToggle}
            className={`
              flex items-center justify-center gap-1 lg:gap-2 px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium
              transition-all duration-200 whitespace-nowrap shrink-0
              ${
                company.sent
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }
            `}
          >
            {company.sent ? (
              <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" />
            ) : (
              <Circle className="w-3 h-3 lg:w-4 lg:h-4" />
            )}
          </button>

          <button
            onClick={handleTikTok}
            className="
              flex items-center justify-center gap-1 lg:gap-2
              bg-black hover:bg-gray-800
              text-white font-semibold
              px-2 lg:px-4 py-1.5 lg:py-3 rounded-lg lg:rounded-xl
              transition-all duration-200
              hover:shadow-lg hover:shadow-black/25
              hover:scale-[1.02]
              active:scale-[0.98]
              whitespace-nowrap
              text-xs lg:text-sm
              shrink-0
            "
          >
            <Music className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>

          <button
            onClick={handleInstagram}
            className="
              flex items-center justify-center gap-1 lg:gap-2
              bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500
              text-white font-semibold
              px-2 lg:px-4 py-1.5 lg:py-3 rounded-lg lg:rounded-xl
              transition-all duration-200
              hover:shadow-lg hover:shadow-pink-500/25
              hover:scale-[1.02]
              active:scale-[0.98]
              whitespace-nowrap
              text-xs lg:text-sm
              shrink-0
            "
          >
            <Instagram className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>

          <button
            onClick={handleWhatsApp}
            className="
              flex items-center justify-center gap-1 lg:gap-2
              bg-whatsapp hover:bg-whatsapp-dark
              text-white font-semibold
              px-2 lg:px-4 py-1.5 lg:py-3 rounded-lg lg:rounded-xl
              transition-all duration-200
              hover:shadow-lg hover:shadow-whatsapp/25
              hover:scale-[1.02]
              active:scale-[0.98]
              whitespace-nowrap
              text-xs lg:text-sm
              shrink-0
            "
          >
            <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

CompanyRow.displayName = "CompanyRow";

export function DataTable({
  companies,
  template,
  onToggleSent,
  onMarkAllSent,
  onClearAll,
}: DataTableProps) {
  if (companies.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 animate-fade-in">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Henüz veri yok
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          PDF dosyası yükleyerek başlayın
        </p>
      </div>
    );
  }

  const rowHeight = 72;
  const maxHeight = Math.min(companies.length * rowHeight, 600);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
      <div className="hidden lg:grid grid-cols-[7fr_1fr_auto_auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <span>Şirket</span>
        <span>Telefon</span>
        <span>Durum</span>
        <span>İşlem</span>
      </div>

      {companies.length <= 100 ? (
        <div>
          {companies.map((company) => (
            <CompanyRowComponent
              key={company.id}
              company={company}
              template={template}
              onToggleSent={onToggleSent}
            />
          ))}
        </div>
      ) : (
        <List
          height={maxHeight}
          itemCount={companies.length}
          itemSize={rowHeight}
          width="100%"
          itemData={{ companies, template, onToggleSent }}
        >
          {CompanyRow}
        </List>
      )}

      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {companies.length} şirket gösteriliyor
        </span>
        <div className="flex gap-2">
          <button
            onClick={onMarkAllSent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" />
            Tümünü Gönderildi İşaretle
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Tümünü Temizle
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyRowComponent({
  company,
  template,
  onToggleSent,
}: {
  company: Company;
  template: string;
  onToggleSent: (id: string) => void;
}) {
  const dir = getTextDirection(company.name);

  return (
    <div className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
      <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[7fr_1fr_auto_auto] gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 items-center">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 min-w-0">
          <div className="flex items-center gap-2 lg:gap-3 min-w-0">
            <div
              className={`
                w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shrink-0
                ${
                  company.sent
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-gray-100 dark:bg-gray-700"
                }
              `}
            >
              <span className="text-sm lg:text-lg">
                {company.sent ? "✓" : "🏢"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="font-semibold text-sm lg:text-base text-gray-800 dark:text-gray-100 truncate"
                dir={dir}
              >
                {company.name}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
              {formatPhoneForDisplay(company.phone)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <button
            onClick={() => onToggleSent(company.id)}
            className={`
              flex items-center justify-center gap-1 lg:gap-2 px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium
              transition-all duration-200 whitespace-nowrap shrink-0
              ${
                company.sent
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }
            `}
          >
            {company.sent ? (
              <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" />
            ) : (
              <Circle className="w-3 h-3 lg:w-4 lg:h-4" />
            )}
          </button>

          <button
            onClick={async () => {
              const message = template.replace(/\{ad\}/g, company.name);
              await copyToClipboard(message);
              openTikTokSearch(company.name);
              if (!company.sent) {
                onToggleSent(company.id);
              }
            }}
            className="
              flex items-center justify-center gap-1 lg:gap-2
              bg-black hover:bg-gray-800
              text-white font-semibold
              px-2 lg:px-4 py-1.5 lg:py-3 rounded-lg lg:rounded-xl
              transition-all duration-200
              hover:shadow-lg hover:shadow-black/25
              hover:scale-[1.02]
              active:scale-[0.98]
              whitespace-nowrap
              text-xs lg:text-sm
              shrink-0
            "
          >
            <Music className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>

          <button
            onClick={async () => {
              const message = template.replace(/\{ad\}/g, company.name);
              await copyToClipboard(message);
              openInstagramSearch(company.name);
              if (!company.sent) {
                onToggleSent(company.id);
              }
            }}
            className="
              flex items-center justify-center gap-1 lg:gap-2
              bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500
              text-white font-semibold
              px-2 lg:px-4 py-1.5 lg:py-3 rounded-lg lg:rounded-xl
              transition-all duration-200
              hover:shadow-lg hover:shadow-pink-500/25
              hover:scale-[1.02]
              active:scale-[0.98]
              whitespace-nowrap
              text-xs lg:text-sm
              shrink-0
            "
          >
            <Instagram className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>

          <button
            onClick={() => {
              openWhatsApp(company.phone, company.message);
              if (!company.sent) {
                onToggleSent(company.id);
              }
            }}
            className="
              flex items-center justify-center gap-1 lg:gap-2
              bg-whatsapp hover:bg-whatsapp-dark
              text-white font-semibold
              px-2 lg:px-4 py-1.5 lg:py-3 rounded-lg lg:rounded-xl
              transition-all duration-200
              hover:shadow-lg hover:shadow-whatsapp/25
              hover:scale-[1.02]
              active:scale-[0.98]
              whitespace-nowrap
              text-xs lg:text-sm
              shrink-0
            "
          >
            <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
