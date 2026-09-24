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
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
        <XAxis dataKey="month" stroke="#a2a8c3" fontSize={12} />
        <YAxis stroke="#a2a8c3" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "#191d31",
            border: "1px solid #ffffff1f",
            borderRadius: 8,
          }}
          labelStyle={{ color: "#f4f5fb" }}
          formatter={(value: number) => format(value)}
        />
        <Legend />
        <Bar
          dataKey="income"
          name="Entrate"
          fill="#4ade80"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          name="Uscite"
          fill="#f87171"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
