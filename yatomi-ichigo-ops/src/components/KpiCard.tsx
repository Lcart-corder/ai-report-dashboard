interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  warning?: boolean;
}

export function KpiCard({ title, value, subtitle, warning }: KpiCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        warning ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${warning ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
