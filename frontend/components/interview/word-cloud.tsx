"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Hash } from "lucide-react";

interface WordData {
  word: string;
  count: number;
  category?: string; // Optional category (e.g., "technical", "soft skill", "general")
}

interface WordCloudProps {
  words: WordData[];
  className?: string;
  maxWords?: number;
}

/**
 * Word Cloud Component
 *
 * Displays frequently mentioned keywords/topics from the interview
 * Size and color based on frequency and importance
 */
export function WordCloud({ words, className = "", maxWords = 30 }: WordCloudProps) {
  // Sort by frequency and take top N
  const topWords = useMemo(() => {
    return [...words]
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);
  }, [words, maxWords]);

  // Calculate font size based on frequency
  const getFontSize = (count: number, maxCount: number, minCount: number) => {
    const range = maxCount - minCount;
    const normalized = range > 0 ? (count - minCount) / range : 0.5;
    const minSize = 12;
    const maxSize = 48;
    return Math.round(minSize + normalized * (maxSize - minSize));
  };

  // Get color based on category
  const getWordColor = (category?: string) => {
    switch (category) {
      case "technical":
        return "text-green-600 hover:text-green-700";
      case "soft_skill":
        return "text-blue-600 hover:text-blue-700";
      case "concern":
        return "text-red-600 hover:text-red-700";
      case "highlight":
        return "text-emerald-600 hover:text-emerald-700";
      default:
        return "text-gray-700 hover:text-gray-900";
    }
  };

  const maxCount = topWords.length > 0 ? Math.max(...topWords.map((w) => w.count)) : 1;
  const minCount = topWords.length > 0 ? Math.min(...topWords.map((w) => w.count)) : 1;

  // Calculate total mentions
  const totalMentions = words.reduce((sum, word) => sum + word.count, 0);

  // Group by category for stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    words.forEach((word) => {
      const category = word.category || "general";
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }, [words]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Topics Discussed
            </CardTitle>
            <CardDescription>
              Frequently mentioned keywords and themes (size = frequency)
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{words.length}</p>
            <p className="text-xs text-muted-foreground">Unique topics</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {words.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No topics data available</p>
          </div>
        ) : (
          <>
            {/* Word Cloud */}
            <div className="min-h-[300px] p-6 bg-muted/30 rounded-lg flex flex-wrap items-center justify-center gap-3">
              {topWords.map((word, index) => {
                const fontSize = getFontSize(word.count, maxCount, minCount);
                const colorClass = getWordColor(word.category);

                return (
                  <span
                    key={index}
                    className={`font-semibold transition-all cursor-default ${colorClass}`}
                    style={{ fontSize: `${fontSize}px` }}
                    title={`Mentioned ${word.count} time${word.count > 1 ? "s" : ""}${
                      word.category ? ` (${word.category})` : ""
                    }`}
                  >
                    {word.word}
                  </span>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Mentions</p>
                </div>
                <p className="text-2xl font-bold">{totalMentions}</p>
              </div>

              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Unique Words</p>
                </div>
                <p className="text-2xl font-bold">{words.length}</p>
              </div>

              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Most Frequent</p>
                </div>
                <p className="text-lg font-bold truncate">{topWords[0]?.word || "N/A"}</p>
                <p className="text-xs text-muted-foreground">
                  {topWords[0]?.count || 0} times
                </p>
              </div>

              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Avg. Frequency</p>
                </div>
                <p className="text-2xl font-bold">
                  {words.length > 0 ? (totalMentions / words.length).toFixed(1) : 0}
                </p>
              </div>
            </div>

            {/* Top Words List */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Top Keywords</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {topWords.slice(0, 12).map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm font-medium">{word.word}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {word.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            {Object.keys(categoryStats).length > 1 && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-medium mb-3">Category Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryStats).map(([category, count]) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className={`${getWordColor(category)} border-current`}
                    >
                      {category.replace("_", " ")}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs font-medium mb-2">Color Legend:</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-600" />
                  <span>Technical Skills</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span>Soft Skills</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span>Highlights</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-600" />
                  <span>Concerns</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-600" />
                  <span>General</span>
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
 * Compact Word Cloud (for smaller spaces)
 */
export function CompactWordCloud({ words, className = "", maxWords = 15 }: WordCloudProps) {
  const topWords = useMemo(() => {
    return [...words]
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);
  }, [words, maxWords]);

  const getWordColor = (category?: string) => {
    switch (category) {
      case "technical":
        return "text-green-600";
      case "soft_skill":
        return "text-blue-600";
      case "concern":
        return "text-red-600";
      case "highlight":
        return "text-emerald-600";
      default:
        return "text-gray-700";
    }
  };

  const maxCount = topWords.length > 0 ? Math.max(...topWords.map((w) => w.count)) : 1;
  const minCount = topWords.length > 0 ? Math.min(...topWords.map((w) => w.count)) : 1;

  const getFontSize = (count: number, maxCount: number, minCount: number) => {
    const range = maxCount - minCount;
    const normalized = range > 0 ? (count - minCount) / range : 0.5;
    const minSize = 10;
    const maxSize = 24;
    return Math.round(minSize + normalized * (maxSize - minSize));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Topics Discussed</h3>
        <Badge variant="secondary" className="text-xs">
          {words.length} topics
        </Badge>
      </div>

      {words.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No topics yet
        </p>
      ) : (
        <div className="min-h-[150px] p-4 bg-muted/30 rounded-lg flex flex-wrap items-center justify-center gap-2">
          {topWords.map((word, index) => {
            const fontSize = getFontSize(word.count, maxCount, minCount);
            const colorClass = getWordColor(word.category);

            return (
              <span
                key={index}
                className={`font-semibold transition-all ${colorClass}`}
                style={{ fontSize: `${fontSize}px` }}
                title={`${word.count} mentions`}
              >
                {word.word}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Topic List (alternative to word cloud)
 */
export function TopicList({ words, className = "" }: WordCloudProps) {
  const topWords = useMemo(() => {
    return [...words].sort((a, b) => b.count - a.count);
  }, [words]);

  const getWordColor = (category?: string) => {
    switch (category) {
      case "technical":
        return "bg-green-50 text-green-700 border-green-200";
      case "soft_skill":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "concern":
        return "bg-red-50 text-red-700 border-red-200";
      case "highlight":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {topWords.map((word, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              #{index + 1}
            </span>
            <span className="text-sm font-medium">{word.word}</span>
            {word.category && (
              <Badge variant="outline" className={`text-xs ${getWordColor(word.category)}`}>
                {word.category.replace("_", " ")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {word.count} {word.count === 1 ? "mention" : "mentions"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
