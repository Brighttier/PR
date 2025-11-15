"use client";

import React, { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  description?: string;
  maxRating?: number;
  allowHalf?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  showValue?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Rating Input Component
 *
 * Custom star rating input with:
 * - Full and half-star support
 * - Configurable max rating (default 5)
 * - Hover preview
 * - Multiple sizes
 * - Labels for each rating level
 */
export function RatingInput({
  value,
  onChange,
  label,
  description,
  maxRating = 5,
  allowHalf = true,
  size = "md",
  disabled = false,
  showValue = true,
  required = false,
  className = "",
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // Get star size based on size prop
  const getStarSize = () => {
    switch (size) {
      case "sm":
        return "w-5 h-5";
      case "lg":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  // Handle click on star
  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (disabled) return;

    const newValue = starIndex + (isHalf && allowHalf ? 0.5 : 1);
    onChange(newValue);
  };

  // Handle hover
  const handleMouseEnter = (starIndex: number, isHalf: boolean) => {
    if (disabled) return;

    const newValue = starIndex + (isHalf && allowHalf ? 0.5 : 1);
    setHoverValue(newValue);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  // Get rating label
  const getRatingLabel = (rating: number) => {
    if (rating === 0) return "Not rated";
    if (rating <= 1) return "Poor";
    if (rating <= 2) return "Below Average";
    if (rating <= 3) return "Average";
    if (rating <= 4) return "Good";
    return "Excellent";
  };

  const displayValue = hoverValue !== null ? hoverValue : value;
  const ratingLabel = getRatingLabel(displayValue);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Stars */}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = displayValue >= starValue;
          const isHalfFilled = displayValue >= starValue - 0.5 && displayValue < starValue;

          return (
            <div
              key={index}
              className={cn(
                "relative cursor-pointer transition-transform hover:scale-110",
                disabled && "cursor-not-allowed opacity-50"
              )}
              onMouseLeave={handleMouseLeave}
            >
              {/* Left half (for half-star) */}
              {allowHalf && (
                <div
                  className="absolute inset-0 w-1/2 z-10"
                  onClick={() => handleClick(index, true)}
                  onMouseEnter={() => handleMouseEnter(index, true)}
                />
              )}

              {/* Right half (or full star if no half-stars) */}
              <div
                className={cn("relative z-0", allowHalf ? "ml-0" : "w-full")}
                onClick={() => handleClick(index, false)}
                onMouseEnter={() => handleMouseEnter(index, false)}
              >
                {isHalfFilled ? (
                  <StarHalf
                    className={cn(
                      getStarSize(),
                      "fill-yellow-400 text-yellow-400 transition-colors"
                    )}
                  />
                ) : (
                  <Star
                    className={cn(
                      getStarSize(),
                      isFilled
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-none text-gray-300",
                      "transition-colors"
                    )}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Show numeric value and label */}
        {showValue && (
          <div className="ml-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {displayValue.toFixed(allowHalf ? 1 : 0)}/{maxRating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({ratingLabel})
            </span>
          </div>
        )}
      </div>

      {/* Validation message */}
      {required && value === 0 && (
        <p className="text-xs text-red-500">This field is required</p>
      )}
    </div>
  );
}

/**
 * Compact Rating Input (read-only display)
 */
export function RatingDisplay({
  value,
  maxRating = 5,
  size = "sm",
  showLabel = false,
  className = "",
}: {
  value: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const getStarSize = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return "Not rated";
    if (rating <= 1) return "Poor";
    if (rating <= 2) return "Below Average";
    if (rating <= 3) return "Average";
    if (rating <= 4) return "Good";
    return "Excellent";
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = value >= starValue;
        const isHalfFilled = value >= starValue - 0.5 && value < starValue;

        return (
          <div key={index}>
            {isHalfFilled ? (
              <StarHalf
                className={cn(
                  getStarSize(),
                  "fill-yellow-400 text-yellow-400"
                )}
              />
            ) : (
              <Star
                className={cn(
                  getStarSize(),
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-gray-300"
                )}
              />
            )}
          </div>
        );
      })}

      {showLabel && (
        <span className="ml-2 text-xs text-muted-foreground">
          {value.toFixed(1)} - {getRatingLabel(value)}
        </span>
      )}
    </div>
  );
}

/**
 * Multiple Rating Questions Component
 */
export function RatingQuestions({
  questions,
  values,
  onChange,
  className = "",
}: {
  questions: Array<{
    id: string;
    label: string;
    description?: string;
    required?: boolean;
  }>;
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {questions.map((question) => (
        <RatingInput
          key={question.id}
          label={question.label}
          description={question.description}
          value={values[question.id] || 0}
          onChange={(value) => onChange(question.id, value)}
          required={question.required}
        />
      ))}
    </div>
  );
}
