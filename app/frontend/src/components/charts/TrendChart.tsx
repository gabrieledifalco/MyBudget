import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useCurrency } from "@/features/settings/CurrencyContext";
import type { TrendGranularity, TrendPoint } from "@/types/domain";

export function TrendChart({
  data,
  granularity = "month",
}: {
  data: TrendPoint[];
  granularity?: TrendGranularity;
}) {
  const { format } = useCurrency();

  const tooltipProps = {
    cursor: granularity === "day" ? { stroke: "var(--border)" } : false,
    contentStyle: {
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: 8,
    },
    labelStyle: { color: "var(--text)" },
    itemStyle: { color: "var(--text)" },
    formatter: (value: number) => format(value),
  };

  // Vista giornaliera: andamento continuo, pi\u00f9 leggibile a linee che a colonne.
  if (granularity === "day") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} />
          <Tooltip {...tooltipProps} />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            name="Entrate"
            stroke="var(--income)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Uscite"
            stroke="var(--expense)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={-28} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <Tooltip {...tooltipProps} />
        <Legend />
        <Bar
          dataKey="income"
          name="Entrate"
          fill="var(--income)"
          fillOpacity={0.65}
          barSize={28}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          name="Uscite"
          fill="var(--expense)"
          fillOpacity={0.65}
          barSize={28}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
