"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface TimelineMarker {
  time: number;
  type: "question" | "highlight" | "concern" | "strong_answer" | "weak_answer";
  label: string;
  description?: string;
}

interface VideoTimelineProps {
  markers: TimelineMarker[];
  duration: number;
  currentTime: number;
  onMarkerClick: (time: number) => void;
  className?: string;
}

/**
 * Video Timeline with Visual Markers
 *
 * Shows all important moments in the interview as a visual timeline
 */
export function VideoTimeline({
  markers,
  duration,
  currentTime,
  onMarkerClick,
  className = "",
}: VideoTimelineProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "question":
        return <MessageSquare className="w-4 h-4" />;
      case "highlight":
        return <Star className="w-4 h-4" />;
      case "concern":
        return <AlertTriangle className="w-4 h-4" />;
      case "strong_answer":
        return <CheckCircle2 className="w-4 h-4" />;
      case "weak_answer":
        return <XCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "question":
        return "bg-blue-500 border-blue-600 text-white";
      case "highlight":
        return "bg-green-500 border-green-600 text-white";
      case "concern":
        return "bg-red-500 border-red-600 text-white";
      case "strong_answer":
        return "bg-emerald-500 border-emerald-600 text-white";
      case "weak_answer":
        return "bg-orange-500 border-orange-600 text-white";
      default:
        return "bg-gray-500 border-gray-600 text-white";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "question":
        return "Question";
      case "highlight":
        return "Highlight";
      case "concern":
        return "Concern";
      case "strong_answer":
        return "Strong Answer";
      case "weak_answer":
        return "Weak Answer";
      default:
        return type;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Interview Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          {markers.length} key moments • {formatTime(duration)} total
        </p>
      </CardHeader>

      <CardContent>
        {/* Visual Timeline Bar */}
        <div className="relative h-12 bg-muted rounded-lg mb-6">
          {/* Progress Indicator */}
          <div
            className="absolute top-0 left-0 h-full bg-primary/20 rounded-lg transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Current Time Indicator */}
          <div
            className="absolute top-0 w-1 h-full bg-primary"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full border-2 border-white" />
          </div>

          {/* Markers */}
          {markers.map((marker, index) => (
            <button
              key={index}
              className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-8 ${getMarkerColor(
                marker.type
              ).split(" ")[0]} rounded-full hover:w-3 transition-all cursor-pointer`}
              style={{ left: `${(marker.time / duration) * 100}%` }}
              onClick={() => onMarkerClick(marker.time)}
              title={`${formatTime(marker.time)} - ${marker.label}`}
            />
          ))}
        </div>

        {/* Marker List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {markers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No key moments identified yet
              </p>
            ) : (
              markers.map((marker, index) => (
                <button
                  key={index}
                  onClick={() => onMarkerClick(marker.time)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getMarkerColor(
                        marker.type
                      )}`}
                    >
                      {getMarkerIcon(marker.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {formatTime(marker.time)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(marker.type)}
                        </Badge>
                      </div>

                      <p className="text-sm font-medium mb-1">{marker.label}</p>

                      {marker.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {marker.description}
                        </p>
                      )}
                    </div>

                    {/* Play indicator on hover */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-primary"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium mb-2 text-muted-foreground">Legend:</p>
          <div className="flex flex-wrap gap-2">
            {["question", "highlight", "strong_answer", "weak_answer", "concern"].map((type) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className={`w-3 h-3 rounded-full ${getMarkerColor(type).split(" ")[0]}`}
                />
                <span className="text-xs">{getTypeLabel(type)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Timeline (for smaller spaces)
 */
export function CompactTimeline({
  markers,
  duration,
  currentTime,
  onMarkerClick,
  className = "",
}: VideoTimelineProps) {
  return (
    <div className={className}>
      <div className="relative h-8 bg-muted rounded">
        {/* Progress */}
        <div
          className="absolute h-full bg-primary/20 rounded transition-all"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />

        {/* Current Time */}
        <div
          className="absolute w-0.5 h-full bg-primary"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />

        {/* Markers */}
        {markers.map((marker, index) => {
          const getColor = (type: string) => {
            switch (type) {
              case "question":
                return "bg-blue-500";
              case "highlight":
                return "bg-green-500";
              case "concern":
                return "bg-red-500";
              case "strong_answer":
                return "bg-emerald-500";
              case "weak_answer":
                return "bg-orange-500";
              default:
                return "bg-gray-500";
            }
          };

          return (
            <button
              key={index}
              className={`absolute top-0 w-1 h-full ${getColor(
                marker.type
              )} hover:w-2 transition-all cursor-pointer`}
              style={{ left: `${(marker.time / duration) * 100}%` }}
              onClick={() => onMarkerClick(marker.time)}
              title={marker.label}
            />
          );
        })}
      </div>
    </div>
  );
}
