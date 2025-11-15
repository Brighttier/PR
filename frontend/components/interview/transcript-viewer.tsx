"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Download, User, Bot, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptEntry {
  id: string;
  timestamp: number;
  speaker: "ai" | "candidate";
  text: string;
  confidence?: number;
}

interface TranscriptViewerProps {
  transcript: TranscriptEntry[];
  onTimestampClick?: (timestamp: number) => void;
  highlightText?: string;
  className?: string;
}

/**
 * Transcript Viewer Component
 *
 * Features:
 * - Search within transcript
 * - Click timestamp to jump to video
 * - Speaker identification
 * - Highlight search results
 * - Export transcript
 */
export function TranscriptViewer({
  transcript,
  onTimestampClick,
  highlightText = "",
  className = "",
}: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTranscript, setFilteredTranscript] = useState(transcript);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter transcript based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTranscript(transcript);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = transcript.filter(
      (entry) =>
        entry.text.toLowerCase().includes(query) ||
        entry.speaker.toLowerCase().includes(query)
    );
    setFilteredTranscript(filtered);
  }, [searchQuery, transcript]);

  // Format timestamp
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Highlight search text
  const highlightSearchText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Export transcript
  const exportTranscript = () => {
    const content = transcript
      .map((entry) => {
        const time = formatTime(entry.timestamp);
        const speaker = entry.speaker === "ai" ? "INTERVIEWER" : "CANDIDATE";
        return `[${time}] ${speaker}: ${entry.text}`;
      })
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Transcript
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportTranscript}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span>{transcript.length} entries</span>
          {searchQuery && (
            <span>
              {filteredTranscript.length} results for "{searchQuery}"
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4" ref={scrollRef}>
          {filteredTranscript.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? (
                <>
                  <p>No results found for "{searchQuery}"</p>
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <p>No transcript entries yet</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTranscript.map((entry) => (
                <TranscriptEntry
                  key={entry.id}
                  entry={entry}
                  searchQuery={searchQuery}
                  highlightText={highlightText}
                  onTimestampClick={onTimestampClick}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Individual Transcript Entry
 */
function TranscriptEntry({
  entry,
  searchQuery,
  highlightText,
  onTimestampClick,
  formatTime,
}: {
  entry: TranscriptEntry;
  searchQuery: string;
  highlightText: string;
  onTimestampClick?: (timestamp: number) => void;
  formatTime: (seconds: number) => string;
}) {
  const isAI = entry.speaker === "ai";

  return (
    <div
      className={`flex gap-3 p-3 rounded-lg transition-colors ${
        isAI ? "bg-blue-50 dark:bg-blue-950/20" : "bg-green-50 dark:bg-green-950/20"
      }`}
    >
      {/* Speaker Icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isAI
            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            : "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
        }`}
      >
        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant={isAI ? "secondary" : "outline"}
            className={isAI ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}
          >
            {isAI ? "AI Interviewer" : "Candidate"}
          </Badge>

          {/* Timestamp - Clickable */}
          <button
            onClick={() => onTimestampClick?.(entry.timestamp)}
            className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1"
            title="Jump to this moment in video"
          >
            <Clock className="w-3 h-3" />
            {formatTime(entry.timestamp)}
          </button>

          {/* Confidence (if available) */}
          {entry.confidence !== undefined && !isAI && (
            <span className="text-xs text-muted-foreground">
              {Math.round(entry.confidence * 100)}% confident
            </span>
          )}
        </div>

        {/* Text */}
        <p className="text-sm leading-relaxed">
          {searchQuery
            ? highlightSearchText(entry.text, searchQuery)
            : highlightText
            ? highlightSearchText(entry.text, highlightText)
            : entry.text}
        </p>
      </div>
    </div>
  );
}

/**
 * Compact Transcript Viewer (for sidebar)
 */
export function CompactTranscriptViewer({
  transcript,
  onTimestampClick,
  className = "",
}: Omit<TranscriptViewerProps, "highlightText">) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={className}>
      <h3 className="font-semibold mb-3 text-sm">Live Transcript</h3>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {transcript.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Transcript will appear here...
            </p>
          ) : (
            transcript.map((entry) => (
              <div key={entry.id} className="text-sm">
                <div className="flex items-start gap-2">
                  <span
                    className={`text-xs font-medium ${
                      entry.speaker === "ai" ? "text-blue-600" : "text-green-600"
                    }`}
                  >
                    {entry.speaker === "ai" ? "AI" : "You"}
                  </span>
                  <button
                    onClick={() => onTimestampClick?.(entry.timestamp)}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    {formatTime(entry.timestamp)}
                  </button>
                </div>
                <p className="text-xs mt-1 text-foreground">{entry.text}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * Transcript Search Component
 */
export function TranscriptSearch({
  transcript,
  onResultClick,
}: {
  transcript: TranscriptEntry[];
  onResultClick: (timestamp: number, text: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TranscriptEntry[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = transcript.filter((entry) =>
      entry.text.toLowerCase().includes(query.toLowerCase())
    );
    setResults(searchResults);
  }, [query, transcript]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search in transcript..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{results.length} results</p>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {results.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onResultClick(entry.timestamp, entry.text)}
                  className="w-full text-left p-2 rounded border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {formatTime(entry.timestamp)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {entry.speaker === "ai" ? "AI" : "Candidate"}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{entry.text}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to highlight search text
 */
function highlightSearchText(text: string, query: string) {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
