import { Building2, Send, Clock, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  total: number;
  sent: number;
  pending: number;
  percentage: number;
}

export function StatsCards({ total, sent, pending, percentage }: StatsCardsProps) {
  const cards = [
    {
      label: "Toplam Şirket",
      value: total,
      icon: Building2,
      color: "bg-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Gönderilen",
      value: sent,
      icon: Send,
      color: "bg-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Bekleyen",
      value: pending,
      icon: Clock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Gönderim %",
      value: `${percentage}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`
              ${card.bgColor} rounded-2xl p-5
              transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
              dark:shadow-none shadow-sm
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold mt-1 ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
