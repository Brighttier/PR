"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingInput, RatingDisplay } from "./rating-input";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillAssessment {
  skill: string;
  rating: number;
  notes?: string;
  required?: boolean;
  targetLevel?: number; // Expected proficiency level for the role
}

interface SkillsMatrixProps {
  skills: SkillAssessment[];
  onChange: (skillIndex: number, field: "rating" | "notes", value: string | number) => void;
  readonly?: boolean;
  showNotes?: boolean;
  showTargetComparison?: boolean;
  className?: string;
}

/**
 * Skills Matrix Component
 *
 * Grid of skill ratings for technical assessment
 * - Rate multiple skills on a scale
 * - Compare to target levels
 * - Optional notes per skill
 * - Visual indicators for proficiency
 */
export function SkillsMatrix({
  skills,
  onChange,
  readonly = false,
  showNotes = true,
  showTargetComparison = false,
  className = "",
}: SkillsMatrixProps) {
  // Calculate overall proficiency
  const avgRating = skills.length > 0
    ? skills.reduce((sum, skill) => sum + skill.rating, 0) / skills.length
    : 0;

  // Count skills meeting target
  const skillsMeetingTarget = showTargetComparison
    ? skills.filter((s) => s.targetLevel && s.rating >= s.targetLevel).length
    : 0;

  // Get proficiency level label
  const getProficiencyLevel = (rating: number) => {
    if (rating >= 4.5) return { label: "Expert", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (rating >= 3.5) return { label: "Proficient", color: "text-green-500", bg: "bg-green-50", border: "border-green-100" };
    if (rating >= 2.5) return { label: "Intermediate", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    if (rating >= 1.5) return { label: "Beginner", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    if (rating > 0) return { label: "Novice", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    return { label: "Not Rated", color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" };
  };

  // Check if skill meets target
  const meetsTarget = (skill: SkillAssessment) => {
    if (!skill.targetLevel) return null;
    if (skill.rating >= skill.targetLevel) return true;
    return false;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Technical Skills Assessment</CardTitle>
            <CardDescription>
              Rate candidate's proficiency in each required skill
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <p className="text-2xl font-bold text-primary">
                {avgRating.toFixed(1)}/5
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {getProficiencyLevel(avgRating).label}
            </p>
          </div>
        </div>

        {/* Summary stats */}
        {showTargetComparison && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>
                {skillsMeetingTarget}/{skills.length} skills meet target
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>
                {skills.length - skillsMeetingTarget} below target
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {skills.map((skill, index) => {
            const proficiency = getProficiencyLevel(skill.rating);
            const targetMet = meetsTarget(skill);

            return (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  readonly ? "bg-muted/30" : "hover:bg-accent/50",
                  targetMet === false && showTargetComparison && "border-orange-200 bg-orange-50/30"
                )}
              >
                {/* Skill header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">
                        {skill.skill}
                        {skill.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>

                      {/* Proficiency badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          proficiency.color,
                          proficiency.bg,
                          proficiency.border
                        )}
                      >
                        {proficiency.label}
                      </Badge>

                      {/* Target comparison indicator */}
                      {showTargetComparison && skill.targetLevel && (
                        <>
                          {targetMet === true ? (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Meets Target
                            </Badge>
                          ) : targetMet === false ? (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Below Target
                            </Badge>
                          ) : null}
                        </>
                      )}
                    </div>

                    {/* Target level info */}
                    {showTargetComparison && skill.targetLevel && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Target proficiency: {skill.targetLevel}/5 ({getProficiencyLevel(skill.targetLevel).label})
                      </p>
                    )}
                  </div>

                  {/* Rating display (compact) */}
                  {readonly && (
                    <RatingDisplay value={skill.rating} showLabel={false} />
                  )}
                </div>

                {/* Rating input */}
                {!readonly && (
                  <div className="mb-3">
                    <RatingInput
                      value={skill.rating}
                      onChange={(value) => onChange(index, "rating", value)}
                      showValue={true}
                      allowHalf={true}
                      required={skill.required}
                    />
                  </div>
                )}

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div
                    className={cn(
                      "h-full transition-all",
                      skill.rating >= 4 ? "bg-green-500" :
                      skill.rating >= 3 ? "bg-yellow-500" :
                      skill.rating >= 2 ? "bg-orange-500" :
                      "bg-red-500"
                    )}
                    style={{ width: `${(skill.rating / 5) * 100}%` }}
                  />
                </div>

                {/* Notes */}
                {showNotes && (
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground">
                      Notes (optional)
                    </Label>
                    <Textarea
                      value={skill.notes || ""}
                      onChange={(e) => onChange(index, "notes", e.target.value)}
                      placeholder="Add specific observations about this skill..."
                      className="mt-1 text-sm h-20 resize-none"
                      disabled={readonly}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {skills.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No skills to assess</p>
          </div>
        )}

        {/* Overall assessment summary */}
        {skills.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
            <h4 className="text-sm font-semibold mb-2">Overall Technical Assessment</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Average Rating</p>
                <p className="text-lg font-bold">{avgRating.toFixed(1)}/5</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Proficiency Level</p>
                <p className={cn("text-sm font-semibold", proficiency.color)}>
                  {getProficiencyLevel(avgRating).label}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skills Assessed</p>
                <p className="text-lg font-bold">{skills.filter(s => s.rating > 0).length}/{skills.length}</p>
              </div>
              {showTargetComparison && (
                <div>
                  <p className="text-xs text-muted-foreground">Meeting Target</p>
                  <p className="text-lg font-bold">
                    {skillsMeetingTarget}/{skills.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact Skills Matrix (for smaller spaces)
 */
export function CompactSkillsMatrix({
  skills,
  className = "",
}: {
  skills: SkillAssessment[];
  className?: string;
}) {
  const getProficiencyColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-100";
    if (rating >= 3) return "text-yellow-600 bg-yellow-100";
    if (rating >= 2) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {skills.map((skill, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
          <span className="text-sm font-medium">{skill.skill}</span>
          <div className="flex items-center gap-2">
            <RatingDisplay value={skill.rating} size="sm" />
            <Badge
              variant="outline"
              className={cn("text-xs", getProficiencyColor(skill.rating))}
            >
              {skill.rating.toFixed(1)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
