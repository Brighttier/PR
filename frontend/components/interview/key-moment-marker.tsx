"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Clock,
  Bookmark,
  Star,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Trash2,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface KeyMoment {
  id: string;
  timestamp: number; // Seconds
  type: "question" | "highlight" | "concern" | "strong_answer" | "weak_answer" | "note";
  label: string;
  description?: string;
  createdBy?: string;
}

interface KeyMomentMarkerProps {
  moments: KeyMoment[];
  currentTime: number;
  onAddMoment: (moment: Omit<KeyMoment, "id">) => void;
  onUpdateMoment: (id: string, updates: Partial<KeyMoment>) => void;
  onDeleteMoment: (id: string) => void;
  onJumpToMoment: (timestamp: number) => void;
  className?: string;
}

/**
 * Key Moment Marker Component
 *
 * Add timestamp notes to video during feedback:
 * - Mark questions, highlights, concerns
 * - Add descriptive notes
 * - Jump to moments in video
 * - Edit/delete markers
 */
export function KeyMomentMarker({
  moments,
  currentTime,
  onAddMoment,
  onUpdateMoment,
  onDeleteMoment,
  onJumpToMoment,
  className = "",
}: KeyMomentMarkerProps) {
  const [isAddingMoment, setIsAddingMoment] = useState(false);
  const [editingMoment, setEditingMoment] = useState<KeyMoment | null>(null);

  // Format timestamp
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get icon and color for moment type
  const getMomentStyle = (type: string) => {
    switch (type) {
      case "question":
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-200",
          label: "Question",
        };
      case "highlight":
        return {
          icon: <Star className="w-4 h-4" />,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          label: "Highlight",
        };
      case "concern":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          label: "Concern",
        };
      case "strong_answer":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          label: "Strong Answer",
        };
      case "weak_answer":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-200",
          label: "Weak Answer",
        };
      default:
        return {
          icon: <Bookmark className="w-4 h-4" />,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          label: "Note",
        };
    }
  };

  // Sort moments by timestamp
  const sortedMoments = [...moments].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Key Moments
          </CardTitle>

          {/* Add Moment Button */}
          <AddMomentDialog
            currentTime={currentTime}
            onAdd={(moment) => {
              onAddMoment(moment);
              setIsAddingMoment(false);
            }}
            trigger={
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Marker
              </Button>
            }
          />
        </div>

        {/* Current time indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Clock className="w-4 h-4" />
          <span>Current time: {formatTime(currentTime)}</span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Moments list */}
        {sortedMoments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No key moments marked yet</p>
            <p className="text-xs mt-1">
              Click "Add Marker" to mark important moments in the interview
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedMoments.map((moment) => {
              const style = getMomentStyle(moment.type);

              return (
                <div
                  key={moment.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                    style.bg,
                    style.border
                  )}
                  onClick={() => onJumpToMoment(moment.timestamp)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", style.color, style.bg, style.border)}
                        >
                          {style.icon}
                          <span className="ml-1">{style.label}</span>
                        </Badge>

                        <button
                          className={cn(
                            "text-xs font-mono px-2 py-0.5 rounded hover:bg-background/80 transition-colors",
                            style.color
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onJumpToMoment(moment.timestamp);
                          }}
                          title="Jump to this moment"
                        >
                          {formatTime(moment.timestamp)}
                        </button>
                      </div>

                      {/* Label */}
                      <p className="text-sm font-medium mb-1">{moment.label}</p>

                      {/* Description */}
                      {moment.description && (
                        <p className="text-xs text-muted-foreground">
                          {moment.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-2">
                      <AddMomentDialog
                        currentTime={moment.timestamp}
                        initialValues={moment}
                        onAdd={(updates) => {
                          onUpdateMoment(moment.id, updates);
                        }}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        }
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMoment(moment.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary stats */}
        {sortedMoments.length > 0 && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="font-semibold text-lg">{sortedMoments.length}</p>
              <p className="text-muted-foreground">Total markers</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">
                {sortedMoments.filter((m) => m.type === "highlight" || m.type === "strong_answer").length}
              </p>
              <p className="text-muted-foreground">Positives</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">
                {sortedMoments.filter((m) => m.type === "concern" || m.type === "weak_answer").length}
              </p>
              <p className="text-muted-foreground">Concerns</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Add/Edit Moment Dialog
 */
function AddMomentDialog({
  currentTime,
  initialValues,
  onAdd,
  trigger,
}: {
  currentTime: number;
  initialValues?: Partial<KeyMoment>;
  onAdd: (moment: Omit<KeyMoment, "id">) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<KeyMoment["type"]>(initialValues?.type || "note");
  const [label, setLabel] = useState(initialValues?.label || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [timestamp, setTimestamp] = useState(currentTime);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (!label.trim()) return;

    onAdd({
      timestamp,
      type,
      label: label.trim(),
      description: description.trim() || undefined,
    });

    // Reset form
    setLabel("");
    setDescription("");
    setType("note");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Edit Key Moment" : "Add Key Moment"}
          </DialogTitle>
          <DialogDescription>
            Mark an important moment in the interview for reference
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timestamp */}
          <div>
            <Label>Timestamp</Label>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono">{formatTime(timestamp)}</span>
            </div>
          </div>

          {/* Type */}
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as KeyMoment["type"])}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="question">Question Asked</SelectItem>
                <SelectItem value="highlight">Highlight</SelectItem>
                <SelectItem value="strong_answer">Strong Answer</SelectItem>
                <SelectItem value="weak_answer">Weak Answer</SelectItem>
                <SelectItem value="concern">Concern/Red Flag</SelectItem>
                <SelectItem value="note">General Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Label */}
          <div>
            <Label>
              Label <span className="text-red-500">*</span>
            </Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Brief description (e.g., 'Excellent problem-solving')"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Additional Notes (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detailed observations..."
              className="mt-1 h-24 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!label.trim()}>
            {initialValues ? "Update" : "Add Marker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Compact Key Moments List
 */
export function CompactKeyMoments({
  moments,
  onJumpToMoment,
  className = "",
}: {
  moments: KeyMoment[];
  onJumpToMoment: (timestamp: number) => void;
  className?: string;
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getMomentIcon = (type: string) => {
    switch (type) {
      case "question": return <MessageSquare className="w-3 h-3" />;
      case "highlight": return <Star className="w-3 h-3" />;
      case "concern": return <AlertCircle className="w-3 h-3" />;
      case "strong_answer": return <CheckCircle2 className="w-3 h-3" />;
      case "weak_answer": return <AlertCircle className="w-3 h-3" />;
      default: return <Bookmark className="w-3 h-3" />;
    }
  };

  const sortedMoments = [...moments].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className={cn("space-y-2", className)}>
      {sortedMoments.map((moment) => (
        <button
          key={moment.id}
          onClick={() => onJumpToMoment(moment.timestamp)}
          className="w-full text-left p-2 rounded-lg border hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            {getMomentIcon(moment.type)}
            <span className="text-xs font-mono text-muted-foreground">
              {formatTime(moment.timestamp)}
            </span>
          </div>
          <p className="text-sm font-medium">{moment.label}</p>
        </button>
      ))}
    </div>
  );
}
