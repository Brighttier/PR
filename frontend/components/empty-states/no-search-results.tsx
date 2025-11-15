"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { EmptyState } from "./empty-state";

interface NoSearchResultsProps {
  query?: string;
  hasFilters?: boolean;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  suggestions?: string[];
  className?: string;
}

/**
 * No Search Results Empty State
 *
 * Generic empty state for search results with optional suggestions.
 *
 * Usage:
 * ```tsx
 * <NoSearchResults
 *   query="senior developer"
 *   hasFilters
 *   onClearSearch={() => setQuery('')}
 *   onClearFilters={() => resetFilters()}
 *   suggestions={["Try different keywords", "Check your spelling"]}
 * />
 * ```
 */
export function NoSearchResults({
  query,
  hasFilters = false,
  onClearSearch,
  onClearFilters,
  suggestions = [],
  className,
}: NoSearchResultsProps) {
  const defaultSuggestions = [
    "Try different keywords",
    "Check your spelling",
    "Use more general terms",
    "Remove some filters",
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className={className}>
      <EmptyState
        icon={Search}
        title={query ? `No results for "${query}"` : "No results found"}
        description={
          hasFilters
            ? "Try adjusting your search terms or clearing some filters"
            : "We couldn't find any matches for your search"
        }
        action={
          onClearSearch || onClearFilters
            ? {
                label: hasFilters ? "Clear Filters" : "Clear Search",
                onClick: hasFilters && onClearFilters ? onClearFilters : onClearSearch || (() => {}),
                variant: "outline",
              }
            : undefined
        }
        variant="inline"
      />

      {/* Search Suggestions */}
      {displaySuggestions.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm font-medium mb-2">Try these suggestions:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {displaySuggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * No Filter Results Empty State
 *
 * Specific variant for when filters return no results.
 */
export function NoFilterResults({
  onClearFilters,
  filterCount,
  className,
}: {
  onClearFilters?: () => void;
  filterCount?: number;
  className?: string;
}) {
  return (
    <EmptyState
      icon={Filter}
      title="No matches for these filters"
      description={
        filterCount
          ? `Your ${filterCount} active filters didn't match any results. Try removing some filters.`
          : "Try adjusting your filters to see more results"
      }
      action={
        onClearFilters
          ? {
              label: "Clear All Filters",
              onClick: onClearFilters,
              variant: "outline",
            }
          : undefined
      }
      className={className}
      variant="inline"
    />
  );
}
