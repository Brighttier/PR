"use client";

import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  aiSuggestions?: boolean;
  onAISuggest?: () => Promise<string>;
  disabled?: boolean;
  className?: string;
}

/**
 * Rich Text Editor Component
 *
 * For detailed feedback notes with:
 * - Basic formatting (bold, italic, underline)
 * - Lists (ordered/unordered)
 * - Links
 * - AI suggestions
 * - HTML output
 */
export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = "Write your feedback here...",
  minHeight = "200px",
  maxHeight = "400px",
  aiSuggestions = false,
  onAISuggest,
  disabled = false,
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Execute formatting command
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Handle content change
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Handle paste (strip formatting)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  // Insert link
  const insertLink = () => {
    if (linkUrl.trim()) {
      execCommand("createLink", linkUrl);
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  // Handle AI suggestion
  const handleAISuggest = async () => {
    if (!onAISuggest) return;

    setIsLoadingAI(true);
    try {
      const suggestion = await onAISuggest();
      if (editorRef.current) {
        editorRef.current.innerHTML = suggestion;
        onChange(suggestion);
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Toolbar button component
  const ToolbarButton = ({
    icon,
    label,
    onClick,
    active = false,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    active?: boolean;
  }) => (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className={cn(
        "h-8 w-8",
        active && "bg-accent"
      )}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      {icon}
    </Button>
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && <Label className="text-sm font-medium">{label}</Label>}

      {/* Editor container */}
      <Card
        className={cn(
          "overflow-hidden transition-all",
          isFocused && "ring-2 ring-primary ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
          {/* Text formatting */}
          <ToolbarButton
            icon={<Bold className="w-4 h-4" />}
            label="Bold (Ctrl+B)"
            onClick={() => execCommand("bold")}
          />
          <ToolbarButton
            icon={<Italic className="w-4 h-4" />}
            label="Italic (Ctrl+I)"
            onClick={() => execCommand("italic")}
          />
          <ToolbarButton
            icon={<Underline className="w-4 h-4" />}
            label="Underline (Ctrl+U)"
            onClick={() => execCommand("underline")}
          />

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <ToolbarButton
            icon={<List className="w-4 h-4" />}
            label="Bullet List"
            onClick={() => execCommand("insertUnorderedList")}
          />
          <ToolbarButton
            icon={<ListOrdered className="w-4 h-4" />}
            label="Numbered List"
            onClick={() => execCommand("insertOrderedList")}
          />

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Link */}
          <ToolbarButton
            icon={<LinkIcon className="w-4 h-4" />}
            label="Insert Link"
            onClick={() => setShowLinkDialog(true)}
          />

          {/* AI Suggestions */}
          {aiSuggestions && onAISuggest && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-purple-600"
                onClick={handleAISuggest}
                disabled={disabled || isLoadingAI}
              >
                <Sparkles className="w-4 h-4" />
                {isLoadingAI ? "Generating..." : "AI Suggest"}
              </Button>
            </>
          )}
        </div>

        {/* Editor content */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
          className={cn(
            "p-4 outline-none prose prose-sm max-w-none overflow-y-auto",
            "focus:outline-none",
            disabled && "cursor-not-allowed"
          )}
          style={{
            minHeight,
            maxHeight,
          }}
          dangerouslySetInnerHTML={{ __html: value }}
          data-placeholder={placeholder}
        />
      </Card>

      {/* Character count */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {editorRef.current?.textContent?.length || 0} characters
        </span>
        <span>HTML formatting enabled</span>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Enter the URL you want to link to
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>URL</Label>
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    insertLink();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink} disabled={!linkUrl.trim()}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom styles for placeholder and prose */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        .prose {
          color: inherit;
        }
        .prose strong {
          font-weight: 600;
        }
        .prose em {
          font-style: italic;
        }
        .prose u {
          text-decoration: underline;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        .prose li {
          margin: 0.25rem 0;
        }
        .prose a {
          color: #16a34a;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #15803d;
        }
      `}</style>
    </div>
  );
}

/**
 * Simple Textarea Editor (fallback without rich text)
 */
export function SimpleTextEditor({
  value,
  onChange,
  label,
  placeholder = "Write your feedback here...",
  minRows = 8,
  maxLength,
  disabled = false,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y"
        )}
      />

      {/* Character count */}
      {maxLength && (
        <div className="flex justify-end text-xs text-muted-foreground">
          <span>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Feedback Template Selector
 */
export function FeedbackTemplateSelector({
  onSelectTemplate,
  className = "",
}: {
  onSelectTemplate: (template: string) => void;
  className?: string;
}) {
  const templates = [
    {
      name: "Strong Hire",
      content: `<p><strong>Overall Assessment:</strong> This candidate demonstrated exceptional technical skills and cultural fit.</p>

<p><strong>Key Strengths:</strong></p>
<ul>
  <li>Strong problem-solving abilities</li>
  <li>Excellent communication skills</li>
  <li>Deep technical knowledge</li>
</ul>

<p><strong>Areas for Growth:</strong></p>
<ul>
  <li>[Add specific areas]</li>
</ul>

<p><strong>Recommendation:</strong> Strong hire - would be a valuable addition to the team.</p>`,
    },
    {
      name: "Hire with Reservations",
      content: `<p><strong>Overall Assessment:</strong> The candidate showed solid skills but has some areas of concern.</p>

<p><strong>Strengths:</strong></p>
<ul>
  <li>[Add strengths]</li>
</ul>

<p><strong>Concerns:</strong></p>
<ul>
  <li>[Add specific concerns]</li>
</ul>

<p><strong>Recommendation:</strong> Consider hiring with mentorship support in [specific areas].</p>`,
    },
    {
      name: "Not a Fit",
      content: `<p><strong>Overall Assessment:</strong> The candidate does not meet the requirements for this role.</p>

<p><strong>Key Issues:</strong></p>
<ul>
  <li>[Add specific issues]</li>
</ul>

<p><strong>Recommendation:</strong> Do not proceed with this candidate for this position.</p>`,
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">Quick Templates</Label>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <Button
            key={template.name}
            variant="outline"
            size="sm"
            onClick={() => onSelectTemplate(template.content)}
          >
            {template.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
