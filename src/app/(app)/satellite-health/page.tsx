"use client";

import { useEffect, useState } from "react";
import { Satellite } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SatelliteHealthPage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    // Mocking an API call for demonstration purposes
    const fetchData = async () => {
      const mockData = {
        healthTrend: [
          { date: "2023-08-01", ndvi: 0.75 },
          { date: "2023-08-08", ndvi: 0.78 },
          { date: "2023-08-15", ndvi: 0.76 },
          { date: "2023-08-22", ndvi: 0.81 },
          { date: "2023-08-29", ndvi: 0.65 },
          { date: "2023-09-05", ndvi: 0.45 },
          { date: "2023-09-12", ndvi: 0.85 },
        ]
      };
      setAnalysisResult(mockData);
    };
    fetchData();
  }, []);

  const trendData =
    analysisResult?.healthTrend?.map((d: any) => ({
      date: d.date,
      ndvi: d.ndvi,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Satellite className="h-8 w-8 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold font-headline">Satellite Crop Health</h1>
            <p className="text-muted-foreground">Monitor your field's health using satellite data.</p>
        </div>
      </div>

      {/* NDVI Trend Chart */}
      <div className="bg-card shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">NDVI Trend Over Time</h2>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis domain={[0, 1]} stroke="hsl(var(--muted-foreground))" fontSize={12}/>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Line type="monotone" dataKey="ndvi" name="NDVI" stroke="hsl(var(--primary))" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading NDVI data...</p>
          </div>
        )}
      </div>

      {/* Health Status List */}
      <div className="bg-card shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Latest Observations</h2>
        <ul className="space-y-2">
          {trendData.map((item, i) => {
            let statusColor = "text-green-500";
            if (item.ndvi < 0.5) statusColor = "text-red-500";
            else if (item.ndvi < 0.7) statusColor = "text-yellow-500";

            return (
              <li
                key={i}
                className="flex justify-between p-3 rounded-lg bg-muted/50"
              >
                <span className="text-muted-foreground">{item.date}</span>
                <span className={`font-semibold ${statusColor}`}>
                  NDVI: {item.ndvi}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Placeholder for Heatmap */}
      <div className="bg-card shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Field Health Heatmap</h2>
        <div className="w-full h-64 bg-gradient-to-r from-green-600 via-yellow-400 to-red-500 rounded-lg flex items-center justify-center">
          <p className="text-white font-bold text-shadow-lg">
            Satellite Heatmap (Integration Pending)
          </p>
        </div>
      </div>
    </div>
  );
}
