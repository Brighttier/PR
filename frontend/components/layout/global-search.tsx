"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Briefcase, FileText, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "job" | "application" | "candidate" | "company" | "team";
  url: string;
}

interface GlobalSearchProps {
  onSearch?: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
}

export default function GlobalSearch({
  onSearch,
  placeholder = "Search jobs, applications, candidates...",
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      if (onSearch) {
        try {
          const searchResults = await onSearch(query);
          setResults(searchResults);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        }
      } else {
        // Mock search results for demo
        const mockResults: SearchResult[] = [
          {
            id: "1",
            title: "Senior Frontend Developer",
            subtitle: "Engineering • Remote",
            type: "job",
            url: "/recruiter/jobs/1",
          },
          {
            id: "2",
            title: "John Doe - Frontend Developer",
            subtitle: "Applied 2 days ago • Match: 85%",
            type: "application",
            url: "/recruiter/applications/2",
          },
          {
            id: "3",
            title: "Jane Smith",
            subtitle: "Senior Developer • San Francisco",
            type: "candidate",
            url: "/recruiter/candidates/3",
          },
        ].filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(mockResults);
      }

      setIsSearching(false);
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "job":
        return Briefcase;
      case "application":
        return FileText;
      case "candidate":
        return Users;
      case "company":
        return Building2;
      case "team":
        return Users;
      default:
        return Search;
    }
  };

  const getResultBadge = (type: SearchResult["type"]) => {
    switch (type) {
      case "job":
        return { label: "Job", variant: "default" as const };
      case "application":
        return { label: "Application", variant: "secondary" as const };
      case "candidate":
        return { label: "Candidate", variant: "outline" as const };
      case "company":
        return { label: "Company", variant: "default" as const };
      case "team":
        return { label: "Team", variant: "outline" as const };
      default:
        return { label: "Result", variant: "outline" as const };
    }
  };

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.url;
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-64 justify-start text-muted-foreground"
      >
        <Search className="mr-2 h-4 w-4" />
        <span>{placeholder}</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-4 pt-4 pb-0">
            <DialogTitle className="sr-only">Search</DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-4 h-12 text-base"
                autoFocus
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[400px] overflow-y-auto px-2 pb-2">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1 p-2">
                {results.map((result) => {
                  const Icon = getResultIcon(result.type);
                  const badge = getResultBadge(result.type);

                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium truncate">
                            {result.title}
                          </h4>
                          <Badge variant={badge.variant} className="text-xs">
                            {badge.label}
                          </Badge>
                        </div>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : query.trim().length > 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No results found for "{query}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for jobs, applications, or candidates
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Start typing to search
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
