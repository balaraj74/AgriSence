
"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "firebase/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Harvest, Expense } from "@/types";
import { getHarvests } from "@/lib/actions/harvests";
import { getExpenses } from "@/lib/actions/expenses";
import { BarChart as BarChartIcon, LayoutGrid, Loader2 } from "lucide-react";
import { subMonths } from "date-fns";

const BarChart = dynamic(() => import("./charts").then(mod => mod.AnalyticsBarChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

const PieChart = dynamic(() => import("./charts").then(mod => mod.AnalyticsPieChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});


type TimeRange = "all" | "3m" | "6m" | "12m";

export default function AnalyticsPageClient() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const [allHarvests, setAllHarvests] = useState<Harvest[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    async function fetchData(currentUser: User) {
      setIsLoading(true);
      try {
        const [harvestData, expenseData] = await Promise.all([
          getHarvests(currentUser.uid),
          getExpenses(currentUser.uid),
        ]);
        setAllHarvests(harvestData);
        setAllExpenses(expenseData);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (user) {
      fetchData(user);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;

    switch (timeRange) {
      case "3m":
        startDate = subMonths(now, 3);
        break;
      case "6m":
        startDate = subMonths(now, 6);
        break;
      case "12m":
        startDate = subMonths(now, 12);
        break;
      case "all":
      default:
        startDate = null;
        break;
    }

    const harvests = startDate
      ? allHarvests.filter((h) => new Date(h.harvestDate) >= startDate!)
      : allHarvests;
    const expenses = startDate
      ? allExpenses.filter((e) => new Date(e.date) >= startDate!)
      : allExpenses;

    return { harvests, expenses };
  }, [timeRange, allHarvests, allExpenses]);

  // Data for Crop Performance Chart
  const cropPerformanceData = useMemo(() => {
    if (!filteredData.harvests) return [];
    const dataByCrop: { [key: string]: { yield: number } } = {};
    filteredData.harvests.forEach((h) => {
      if (!dataByCrop[h.cropName]) {
        dataByCrop[h.cropName] = { yield: 0 };
      }
      // Simple conversion for demo. A real app might need more complex logic.
      let quantityInKg = h.quantity;
      if (h.unit === 'quintal') quantityInKg *= 100;
      if (h.unit === 'tonne') quantityInKg *= 1000;
      dataByCrop[h.cropName].yield += quantityInKg;
    });

    return Object.entries(dataByCrop).map(([name, { yield: totalYield }]) => ({
      name,
      yield: totalYield,
    }));
  }, [filteredData.harvests]);

  // Data for Expense Breakdown Chart
  const expenseBreakdownData = useMemo(() => {
    if (!filteredData.expenses) return [];
    const dataByCategory: { [key: string]: number } = {};
    filteredData.expenses.forEach((e) => {
      if (!dataByCategory[e.category]) {
        dataByCategory[e.category] = 0;
      }
      dataByCategory[e.category] += e.amount;
    });

    return Object.entries(dataByCategory).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [filteredData.expenses]);

  const renderCharts = () => {
    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
        );
    }
     if (!allHarvests.length && !allExpenses.length) {
        return (
            <div className="text-center py-12 bg-card rounded-lg border">
                <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Data for Analytics</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Start by adding some crops, expenses, or harvest records to see your analytics.
                </p>
            </div>
        )
     }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Crop Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Crop Performance</CardTitle>
                    <CardDescription>Total yield (in kg) per crop.</CardDescription>
                </CardHeader>
                <CardContent>
                    {cropPerformanceData.length > 0 ? (
                        <BarChart data={cropPerformanceData} />
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">No harvest data for this period.</div>
                    )}
                </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Total spending by category.</CardDescription>
                </CardHeader>
                <CardContent>
                    {expenseBreakdownData.length > 0 ? (
                        <PieChart data={expenseBreakdownData} />
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">No expense data for this period.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
                <BarChartIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-bold font-headline">Analytics</h1>
                <p className="text-muted-foreground">
                    Visualize your farm's performance and expenses.
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Select onValueChange={(v) => setTimeRange(v as TimeRange)} defaultValue="all" disabled={isLoading}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="12m">Last 12 Months</SelectItem>
                </SelectContent>
            </Select>
             {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        </div>
      </div>
      
      {renderCharts()}
    </div>
  );
}
