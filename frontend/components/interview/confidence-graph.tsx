"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Minus, Award } from "lucide-react";

interface ConfidenceDataPoint {
  timestamp: number;
  confidence: number; // 0-1
}

interface ConfidenceGraphProps {
  data: ConfidenceDataPoint[];
  className?: string;
}

/**
 * Confidence Graph Component
 *
 * Displays confidence level over time as an area chart
 * Confidence ranges from 0 (low) to 1 (high)
 */
export function ConfidenceGraph({ data, className = "" }: ConfidenceGraphProps) {
  // Format data for Recharts
  const chartData = data.map((point) => ({
    time: formatTime(point.timestamp),
    timeSeconds: point.timestamp,
    confidence: point.confidence * 100, // Convert to percentage
    confidenceRaw: point.confidence,
  }));

  // Calculate overall confidence
  const avgConfidence = data.length > 0
    ? data.reduce((sum, point) => sum + point.confidence, 0) / data.length
    : 0;

  // Get confidence level info
  const getConfidenceInfo = (confidence: number) => {
    if (confidence >= 0.8) {
      return {
        label: "Very Confident",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: <TrendingUp className="w-4 h-4" />,
      };
    } else if (confidence >= 0.6) {
      return {
        label: "Confident",
        color: "text-green-500",
        bgColor: "bg-green-50",
        icon: <TrendingUp className="w-4 h-4" />,
      };
    } else if (confidence >= 0.4) {
      return {
        label: "Moderate",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        icon: <Minus className="w-4 h-4" />,
      };
    } else if (confidence >= 0.2) {
      return {
        label: "Low Confidence",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        icon: <TrendingDown className="w-4 h-4" />,
      };
    } else {
      return {
        label: "Very Low",
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: <TrendingDown className="w-4 h-4" />,
      };
    }
  };

  const overallInfo = getConfidenceInfo(avgConfidence);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const info = getConfidenceInfo(data.confidenceRaw);

      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{data.time}</p>
          <div className="flex items-center gap-2">
            <div className={info.color}>{info.icon}</div>
            <p className={`text-sm font-semibold ${info.color}`}>
              {info.label}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Confidence: {data.confidence.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return "stable";

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.confidence, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.confidence, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 0.1) return "improving";
    if (diff < -0.1) return "declining";
    return "stable";
  };

  const trend = calculateTrend();

  const getTrendInfo = () => {
    switch (trend) {
      case "improving":
        return {
          label: "Improving",
          description: "Confidence increased throughout interview",
          color: "text-green-600",
          icon: <TrendingUp className="w-4 h-4" />,
        };
      case "declining":
        return {
          label: "Declining",
          description: "Confidence decreased throughout interview",
          color: "text-red-600",
          icon: <TrendingDown className="w-4 h-4" />,
        };
      default:
        return {
          label: "Stable",
          description: "Confidence remained consistent",
          color: "text-blue-600",
          icon: <Minus className="w-4 h-4" />,
        };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Confidence Level Over Time</CardTitle>
            <CardDescription>
              Speech confidence based on audio analysis
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Award className={`w-5 h-5 ${overallInfo.color}`} />
              <p className={`text-lg font-bold ${overallInfo.color}`}>
                {(avgConfidence * 100).toFixed(0)}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{overallInfo.label}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No confidence data available</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: "Confidence %", angle: -90, position: "insideLeft", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Reference lines for confidence levels */}
                <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="2 2" strokeOpacity={0.3} />
                <ReferenceLine y={60} stroke="#eab308" strokeDasharray="2 2" strokeOpacity={0.3} />
                <ReferenceLine y={40} stroke="#f97316" strokeDasharray="2 2" strokeOpacity={0.3} />

                {/* Confidence area */}
                <Area
                  type="monotone"
                  dataKey="confidence"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fill="url(#confidenceGradient)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Insights */}
            <div className="mt-6 space-y-3">
              {/* Trend */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Trend</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {trendInfo.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={trendInfo.color}>{trendInfo.icon}</div>
                  <p className={`text-sm font-semibold ${trendInfo.color}`}>
                    {trendInfo.label}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Average</p>
                  <p className="text-lg font-bold text-green-600">
                    {(avgConfidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Peak</p>
                  <p className="text-lg font-bold text-blue-600">
                    {(Math.max(...data.map(d => d.confidence)) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Lowest</p>
                  <p className="text-lg font-bold text-orange-600">
                    {(Math.min(...data.map(d => d.confidence)) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span>Very Confident (80%+)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Moderate (40-60%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Low (20-40%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span>Very Low (&lt;20%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Confidence Indicator
 */
export function ConfidenceIndicator({
  confidence,
  className = "",
}: {
  confidence: number;
  className?: string;
}) {
  const getConfidenceInfo = (confidence: number) => {
    if (confidence >= 0.8) {
      return {
        label: "Very Confident",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: <TrendingUp className="w-3 h-3" />,
      };
    } else if (confidence >= 0.6) {
      return {
        label: "Confident",
        color: "bg-green-50 text-green-600 border-green-200",
        icon: <TrendingUp className="w-3 h-3" />,
      };
    } else if (confidence >= 0.4) {
      return {
        label: "Moderate",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: <Minus className="w-3 h-3" />,
      };
    } else if (confidence >= 0.2) {
      return {
        label: "Low",
        color: "bg-orange-100 text-orange-700 border-orange-300",
        icon: <TrendingDown className="w-3 h-3" />,
      };
    } else {
      return {
        label: "Very Low",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: <TrendingDown className="w-3 h-3" />,
      };
    }
  };

  const info = getConfidenceInfo(confidence);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${info.color} ${className}`}>
      {info.icon}
      <span className="text-sm font-medium">{(confidence * 100).toFixed(0)}%</span>
      <span className="text-xs">{info.label}</span>
    </div>
  );
}

// Helper function
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
