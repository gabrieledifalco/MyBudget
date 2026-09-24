import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useCurrency } from "@/features/settings/CurrencyContext";
import type { TrendPoint } from "@/types/domain";

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const { format } = useCurrency();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
          labelStyle={{ color: "var(--text)" }}
          formatter={(value: number) => format(value)}
        />
        <Legend />
        <Bar
          dataKey="income"
          name="Entrate"
          fill="var(--income)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          name="Uscite"
          fill="var(--expense)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
