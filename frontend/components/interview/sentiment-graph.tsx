"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentDataPoint {
  timestamp: number;
  sentiment: number; // -1 to 1
  emotion?: string;
}

interface SentimentGraphProps {
  data: SentimentDataPoint[];
  className?: string;
}

/**
 * Sentiment Graph Component
 *
 * Displays sentiment over time as a line chart
 * Sentiment ranges from -1 (very negative) to 1 (very positive)
 */
export function SentimentGraph({ data, className = "" }: SentimentGraphProps) {
  // Format data for Recharts
  const chartData = data.map((point) => ({
    time: formatTime(point.timestamp),
    timeSeconds: point.timestamp,
    sentiment: point.sentiment,
    emotion: point.emotion || "",
  }));

  // Calculate overall sentiment
  const avgSentiment = data.length > 0
    ? data.reduce((sum, point) => sum + point.sentiment, 0) / data.length
    : 0;

  // Get sentiment label and color
  const getSentimentInfo = (sentiment: number) => {
    if (sentiment >= 0.5) {
      return {
        label: "Very Positive",
        color: "text-green-600",
        icon: <TrendingUp className="w-4 h-4" />,
      };
    } else if (sentiment >= 0.2) {
      return {
        label: "Positive",
        color: "text-green-500",
        icon: <TrendingUp className="w-4 h-4" />,
      };
    } else if (sentiment >= -0.2) {
      return {
        label: "Neutral",
        color: "text-gray-600",
        icon: <Minus className="w-4 h-4" />,
      };
    } else if (sentiment >= -0.5) {
      return {
        label: "Negative",
        color: "text-orange-500",
        icon: <TrendingDown className="w-4 h-4" />,
      };
    } else {
      return {
        label: "Very Negative",
        color: "text-red-600",
        icon: <TrendingDown className="w-4 h-4" />,
      };
    }
  };

  const overallSentimentInfo = getSentimentInfo(avgSentiment);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const sentimentInfo = getSentimentInfo(data.sentiment);

      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{data.time}</p>
          <div className="flex items-center gap-2">
            <div className={sentimentInfo.color}>{sentimentInfo.icon}</div>
            <p className={`text-sm font-semibold ${sentimentInfo.color}`}>
              {sentimentInfo.label}
            </p>
          </div>
          {data.emotion && (
            <p className="text-xs text-muted-foreground mt-1">
              Emotion: {data.emotion}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Score: {data.sentiment.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get line color based on sentiment value
  const getLineColor = (sentiment: number) => {
    if (sentiment >= 0.5) return "#16a34a"; // green-600
    if (sentiment >= 0.2) return "#22c55e"; // green-500
    if (sentiment >= -0.2) return "#6b7280"; // gray-500
    if (sentiment >= -0.5) return "#f97316"; // orange-500
    return "#dc2626"; // red-600
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sentiment Over Time</CardTitle>
            <CardDescription>
              Candidate's emotional tone throughout the interview
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={overallSentimentInfo.color}>
              {overallSentimentInfo.icon}
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${overallSentimentInfo.color}`}>
                {overallSentimentInfo.label}
              </p>
              <p className="text-xs text-muted-foreground">Overall</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No sentiment data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                domain={[-1, 1]}
                ticks={[-1, -0.5, 0, 0.5, 1]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: "Sentiment", angle: -90, position: "insideLeft", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference lines */}
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
              <ReferenceLine y={0.5} stroke="#22c55e" strokeDasharray="2 2" strokeOpacity={0.3} />
              <ReferenceLine y={-0.5} stroke="#ef4444" strokeDasharray="2 2" strokeOpacity={0.3} />

              {/* Sentiment line */}
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: "#16a34a", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t grid grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span>Very Positive</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span>Very Negative</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Sentiment Indicator
 */
export function SentimentIndicator({
  sentiment,
  className = "",
}: {
  sentiment: number;
  className?: string;
}) {
  const getSentimentInfo = (sentiment: number) => {
    if (sentiment >= 0.5) {
      return {
        label: "Very Positive",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: <TrendingUp className="w-3 h-3" />,
      };
    } else if (sentiment >= 0.2) {
      return {
        label: "Positive",
        color: "bg-green-50 text-green-600 border-green-200",
        icon: <TrendingUp className="w-3 h-3" />,
      };
    } else if (sentiment >= -0.2) {
      return {
        label: "Neutral",
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: <Minus className="w-3 h-3" />,
      };
    } else if (sentiment >= -0.5) {
      return {
        label: "Negative",
        color: "bg-orange-50 text-orange-600 border-orange-200",
        icon: <TrendingDown className="w-3 h-3" />,
      };
    } else {
      return {
        label: "Very Negative",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: <TrendingDown className="w-3 h-3" />,
      };
    }
  };

  const info = getSentimentInfo(sentiment);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${info.color} ${className}`}>
      {info.icon}
      <span className="text-sm font-medium">{info.label}</span>
    </div>
  );
}

// Helper function
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
