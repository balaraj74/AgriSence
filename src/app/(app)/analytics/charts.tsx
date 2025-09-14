
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import type { ExpenseCategory } from "@/types";

const COLORS = ["#74B72E", "#D6AD60", "#3b82f6", "#f97316", "#8b5cf6", "#14b8a6"];
const categoryColors: { [key in ExpenseCategory]: string } = {
  Seeds: "#16a34a",
  Fertilizer: "#ca8a04",
  Labor: "#2563eb",
  Equipment: "#ea580c",
  Other: "#9ca3af",
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
        <div className="p-2 bg-background/80 border rounded-md shadow-lg backdrop-blur-sm">
            <p className="font-bold">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>
                    {`${p.name}: ${p.value.toLocaleString()} ${p.unit || ''}`}
                </p>
            ))}
        </div>
        );
    }

    return null;
};

export const AnalyticsBarChart = ({ data }: { data: { name: string; yield: number }[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="yield" fill="#74B72E" name="Yield" unit="kg" />
    </BarChart>
  </ResponsiveContainer>
);

export const AnalyticsPieChart = ({ data }: { data: { name: string; value: number }[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsPieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={categoryColors[entry.name as ExpenseCategory] || COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
      <Legend />
    </RechartsPieChart>
  </ResponsiveContainer>
);
