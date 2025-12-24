"use client"

import { useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { MicropartnerData } from "@/lib/google-sheets"


import { Skeleton } from "@/components/ui/skeleton"

interface DataChartProps {
  data: MicropartnerData[]
  status: "Beatwise" | "BaseCat"
  loading?: boolean
}

export function DataChart({ data, status, loading }: DataChartProps) {
  const [limit, setLimit] = useState<string>("10")

  const chartData = useMemo(() => {
    if (loading) return []

    let processedData: { name: string; value: number }[] = []

    if (status === "Beatwise") {
      // Group by AccountBeat and sum totalAmt
      const grouped = data.reduce(
        (acc, item) => {
          const beat = item.accountBeat
          if (!acc[beat]) {
            acc[beat] = { name: beat, value: 0 }
          }
          acc[beat].value += item.totalAmt
          return acc
        },
        {} as Record<string, { name: string; value: number }>,
      )
      processedData = Object.values(grouped).sort((a, b) => b.value - a.value)
    } else {
      // Group by BaseCat and sum totalAmt
      const grouped = data.reduce(
        (acc, item) => {
          const cat = item.baseCat
          if (!acc[cat]) {
            acc[cat] = { name: cat, value: 0 }
          }
          acc[cat].value += item.totalAmt
          return acc
        },
        {} as Record<string, { name: string; value: number }>,
      )
      processedData = Object.values(grouped).sort((a, b) => b.value - a.value)
    }

    if (limit !== "all") {
      return processedData.slice(0, parseInt(limit))
    }
    return processedData
  }, [data, status, loading, limit])

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-3 sm:pb-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="truncate">{status} Analysis</span>
        </CardTitle>
        <Select value={limit} onValueChange={setLimit}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Select limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="all">All Data</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {loading ? (
          <div className="h-[250px] sm:h-[350px] lg:h-[400px] w-full flex items-end justify-between gap-2 pb-12 px-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton
                key={i}
                className="w-full rounded-t-lg"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[250px] sm:h-[350px] lg:h-[400px] flex items-center justify-center text-slate-500 text-sm">
            No data available for chart. Try adjusting your filters.
          </div>
        ) : (
          <ChartContainer
            config={{
              value: {
                label: "Total Amount",
                color: status === "Beatwise" ? "hsl(280, 80%, 55%)" : "hsl(330, 80%, 55%)",
              },
            }}
            className="h-[250px] sm:h-[350px] lg:h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 5,
                  left: 5,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="colorBeatwise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(280, 80%, 55%)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(280, 80%, 65%)" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorBaseCat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(330, 80%, 55%)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(330, 80%, 65%)" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: "hsl(240, 5%, 40%)", fontSize: 10 }}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "hsl(240, 5%, 40%)", fontSize: 10 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  width={50}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Amount"]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar
                  dataKey="value"
                  fill={status === "Beatwise" ? "url(#colorBeatwise)" : "url(#colorBaseCat)"}
                  radius={[6, 6, 0, 0]}
                  name="Total Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
