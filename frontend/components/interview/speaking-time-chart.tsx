"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { User, Bot, Clock } from "lucide-react";

interface SpeakingStats {
  aiSpeakingTime: number; // seconds
  candidateSpeakingTime: number; // seconds
  aiSpeakingPercentage: number; // 0-100
  candidateSpeakingPercentage: number; // 0-100
  totalSpeakingTime: number;
  averageResponseLength: number;
  longestResponse: number;
  shortestResponse: number;
}

interface SpeakingTimeChartProps {
  stats: SpeakingStats;
  className?: string;
}

/**
 * Speaking Time Chart Component
 *
 * Displays speaking time distribution between AI and candidate as a pie chart
 */
export function SpeakingTimeChart({ stats, className = "" }: SpeakingTimeChartProps) {
  // Prepare data for pie chart
  const chartData = [
    {
      name: "Candidate",
      value: stats.candidateSpeakingPercentage,
      time: stats.candidateSpeakingTime,
      color: "#22c55e", // green-500
    },
    {
      name: "AI Interviewer",
      value: stats.aiSpeakingPercentage,
      time: stats.aiSpeakingTime,
      color: "#3b82f6", // blue-500
    },
  ];

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{data.name}</p>
          <p className="text-sm">
            <span className="font-semibold">{data.value.toFixed(1)}%</span> of total
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatTime(data.payload.time)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Assessment of speaking ratio
  const getBalanceAssessment = () => {
    const candidatePercentage = stats.candidateSpeakingPercentage;

    if (candidatePercentage >= 60 && candidatePercentage <= 75) {
      return {
        label: "Excellent Balance",
        description: "Candidate had appropriate speaking time",
        color: "text-green-600",
      };
    } else if (candidatePercentage >= 50 && candidatePercentage < 60) {
      return {
        label: "Good Balance",
        description: "Slightly more interviewer speaking",
        color: "text-blue-600",
      };
    } else if (candidatePercentage > 75) {
      return {
        label: "Candidate Dominated",
        description: "Candidate spoke significantly more",
        color: "text-orange-600",
      };
    } else {
      return {
        label: "Interviewer Dominated",
        description: "Candidate had limited speaking time",
        color: "text-red-600",
      };
    }
  };

  const assessment = getBalanceAssessment();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Speaking Time Distribution
        </CardTitle>
        <CardDescription>
          Breakdown of who spoke and for how long
        </CardDescription>
      </CardHeader>

      <CardContent>
        {stats.totalSpeakingTime === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No speaking data available</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Statistics */}
            <div className="mt-6 space-y-4">
              {/* Balance Assessment */}
              <div className="p-3 rounded-lg bg-muted">
                <p className={`text-sm font-semibold ${assessment.color}`}>
                  {assessment.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {assessment.description}
                </p>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4">
                {/* Candidate Stats */}
                <div className="p-3 rounded-lg border border-green-200 bg-green-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium text-green-900">Candidate</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.candidateSpeakingPercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {formatTime(stats.candidateSpeakingTime)}
                  </p>
                </div>

                {/* AI Stats */}
                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">AI Interviewer</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.aiSpeakingPercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {formatTime(stats.aiSpeakingTime)}
                  </p>
                </div>
              </div>

              {/* Response Stats */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Candidate Response Analysis</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Average</p>
                    <p className="text-sm font-semibold">
                      {formatTime(stats.averageResponseLength)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Longest</p>
                    <p className="text-sm font-semibold">
                      {formatTime(stats.longestResponse)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Shortest</p>
                    <p className="text-sm font-semibold">
                      {formatTime(stats.shortestResponse)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact Speaking Time Display
 */
export function CompactSpeakingTime({ stats, className = "" }: SpeakingTimeChartProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-green-600" />
          <span className="text-sm">Candidate</span>
        </div>
        <span className="text-sm font-semibold text-green-600">
          {stats.candidateSpeakingPercentage.toFixed(0)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${stats.candidateSpeakingPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatTime(stats.candidateSpeakingTime)}</span>
        <span>{formatTime(stats.aiSpeakingTime)}</span>
      </div>
    </div>
  );
}
