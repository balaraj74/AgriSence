
"use client";

import { useEffect, useState } from "react";
import { Satellite } from "lucide-react";

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
        ]
      };
      // In a real scenario:
      // const res = await fetch("/api/satellite-health");
      // const data = await res.json();
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Satellite className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Satellite Crop Health</h1>
      </div>

      {/* NDVI Trend Chart Placeholder */}
      <div className="bg-white dark:bg-card shadow rounded-xl p-4">
        {trendData.length > 0 ? (
          <ul className="space-y-2">
            {trendData.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{item.date}</span>
                <span className="font-semibold text-green-600">
                  NDVI: {item.ndvi}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Loading NDVI data...</p>
        )}
      </div>
    </div>
  );
}
