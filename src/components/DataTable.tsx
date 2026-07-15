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
} from "lucide-react";
import type { Company } from "@/types";
import { formatPhoneForDisplay } from "@/utils/phone";
import { openWhatsApp } from "@/utils/whatsapp";
import { getTextDirection } from "@/utils/arabic";

interface DataTableProps {
  companies: Company[];
  onToggleSent: (id: string) => void;
  onMarkAllSent: () => void;
  onClearAll: () => void;
}

interface CompanyRowProps extends ListChildComponentProps {
  data: {
    companies: Company[];
    onToggleSent: (id: string) => void;
  };
}

const CompanyRow = memo(({ index, style, data }: CompanyRowProps) => {
  const company = data.companies[index];
  const onToggleSent = data.onToggleSent;

  const handleWhatsApp = useCallback(() => {
    openWhatsApp(company.phone, company.message);
  }, [company.phone, company.message]);

  const handleToggle = useCallback(() => {
    onToggleSent(company.id);
  }, [company.id, onToggleSent]);

  const dir = getTextDirection(company.name);

  return (
    <div
      style={style}
      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_2fr_auto_auto] gap-4 px-6 py-4 items-center h-full">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${
                company.sent
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-gray-100 dark:bg-gray-700"
              }
            `}
          >
            <span className="text-lg">
              {company.sent ? "✓" : "🏢"}
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="font-semibold text-gray-800 dark:text-gray-100 truncate"
              dir={dir}
            >
              {company.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              ID: {company.id.slice(-8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
            {formatPhoneForDisplay(company.phone)}
          </span>
        </div>

        <div className="hidden lg:block min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Mesaj
            </span>
          </div>
          <p
            className="text-sm text-gray-500 dark:text-gray-400 truncate"
            dir="auto"
          >
            {company.message.slice(0, 80)}
            {company.message.length > 80 ? "..." : ""}
          </p>
        </div>

        <div>
          <button
            onClick={handleToggle}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              transition-all duration-200 whitespace-nowrap
              ${
                company.sent
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }
            `}
          >
            {company.sent ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            {company.sent ? "Gönderildi" : "Gönderilmedi"}
          </button>
        </div>

        <button
          onClick={handleWhatsApp}
          className="
            flex items-center justify-center gap-2
            bg-whatsapp hover:bg-whatsapp-dark
            text-white font-semibold
            px-6 py-3 rounded-xl
            transition-all duration-200
            hover:shadow-lg hover:shadow-whatsapp/25
            hover:scale-[1.02]
            active:scale-[0.98]
            whitespace-nowrap
          "
        >
          <ExternalLink className="w-4 h-4" />
          WhatsApp Aç
        </button>
      </div>
    </div>
  );
});

CompanyRow.displayName = "CompanyRow";

export function DataTable({
  companies,
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

  const rowHeight = 80;
  const maxHeight = Math.min(companies.length * rowHeight, 600);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
      <div className="hidden lg:grid grid-cols-[2fr_1fr_2fr_auto_auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <span>Şirket</span>
        <span>Telefon</span>
        <span>Mesaj</span>
        <span>Durum</span>
        <span>İşlem</span>
      </div>

      {companies.length <= 100 ? (
        <div>
          {companies.map((company) => (
            <CompanyRowComponent
              key={company.id}
              company={company}
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
          itemData={{ companies, onToggleSent }}
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
  onToggleSent,
}: {
  company: Company;
  onToggleSent: (id: string) => void;
}) {
  const dir = getTextDirection(company.name);

  return (
    <div className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_2fr_auto_auto] gap-4 px-6 py-4 items-center">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${
                company.sent
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-gray-100 dark:bg-gray-700"
              }
            `}
          >
            <span className="text-lg">
              {company.sent ? "✓" : "🏢"}
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="font-semibold text-gray-800 dark:text-gray-100 truncate"
              dir={dir}
            >
              {company.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate lg:hidden">
              {formatPhoneForDisplay(company.phone)}
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
            {formatPhoneForDisplay(company.phone)}
          </span>
        </div>

        <div className="hidden lg:block min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Mesaj
            </span>
          </div>
          <p
            className="text-sm text-gray-500 dark:text-gray-400 truncate"
            dir="auto"
          >
            {company.message.slice(0, 80)}
            {company.message.length > 80 ? "..." : ""}
          </p>
        </div>

        <div className="flex items-center justify-between lg:justify-start gap-3">
          <button
            onClick={() => onToggleSent(company.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              transition-all duration-200 whitespace-nowrap
              ${
                company.sent
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }
            `}
          >
            {company.sent ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            {company.sent ? "Gönderildi" : "Gönderilmedi"}
          </button>

          <button
            onClick={() => openWhatsApp(company.phone, company.message)}
            className="
              flex items-center justify-center gap-2
              bg-whatsapp hover:bg-whatsapp-dark
              text-white font-semibold
              px-6 py-3 rounded-xl
              transition-all duration-200
              hover:shadow-lg hover:shadow-whatsapp/25
              hover:scale-[1.02]
              active:scale-[0.98]
              whitespace-nowrap
            "
          >
            <ExternalLink className="w-4 h-4" />
            WhatsApp Aç
          </button>
        </div>
      </div>
    </div>
  );
}
