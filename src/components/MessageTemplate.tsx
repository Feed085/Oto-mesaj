import { MessageSquare } from "lucide-react";

interface MessageTemplateProps {
  template: string;
  onChange: (template: string) => void;
  previewName?: string;
}

export function MessageTemplate({
  template,
  onChange,
  previewName = "Örnek Şirket",
}: MessageTemplateProps) {
  const preview = template.replace(/\{ad\}/g, previewName);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-500 p-2 rounded-xl">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            Mesaj Şablonu
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {"{ad}"} ile şirket adını ekleyin
          </p>
        </div>
      </div>

      <textarea
        value={template}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Merhaba {ad},&#10;&#10;Size yardımcı olmak isteriz.&#10;&#10;İyi çalışmalar."
        className="
          w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
          bg-gray-50 dark:bg-gray-900
          text-gray-800 dark:text-gray-200
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-all duration-200 resize-none
          font-medium leading-relaxed
        "
      />

      {template.trim() && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Önizleme
          </p>
          <p
            className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
            dir="auto"
          >
            {preview}
          </p>
        </div>
      )}
    </div>
  );
}
