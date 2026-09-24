import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrendPoint } from "@/types/domain";

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
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
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          name="Entrate"
          stroke="#4ade80"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Uscite"
          stroke="#f87171"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="balance"
          name="Saldo"
          stroke="#60a5fa"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
