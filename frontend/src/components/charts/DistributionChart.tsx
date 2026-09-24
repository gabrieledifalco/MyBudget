import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { useCurrency } from "@/features/settings/CurrencyContext";
import type { DistributionSlice } from "@/types/domain";

const COLORS: Record<string, string> = {
  HOME: "#60a5fa",
  CAR: "#f4d35e",
  SPORT: "#4ade80",
  FAMILY: "#f97316",
  INVESTMENT: "#a78bfa",
  LEISURE: "#f87171",
  PERSONAL: "#e879f9",
  OTHER: "#a2a8c3",
};

const LABELS: Record<string, string> = {
  HOME: "Casa",
  CAR: "Auto",
  SPORT: "Sport e benessere",
  FAMILY: "Famiglia",
  INVESTMENT: "Investimenti",
  LEISURE: "Tempo libero",
  PERSONAL: "Abitudini personali",
  OTHER: "Altro",
};

export function DistributionChart({ data }: { data: DistributionSlice[] }) {
  const { format } = useCurrency();
  if (data.length === 0)
    return <p className="empty-state">Nessuna uscita registrata.</p>;

  const chartData = data.map((slice) => ({
    ...slice,
    label: LABELS[slice.macroArea] ?? slice.macroArea,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="label"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {chartData.map((slice) => (
            <Cell
              key={slice.macroArea}
              fill={COLORS[slice.macroArea] ?? "#a2a8c3"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
          labelStyle={{ color: "var(--text)" }}
          itemStyle={{ color: "var(--text)" }}
          formatter={(value: number) => format(value)}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
