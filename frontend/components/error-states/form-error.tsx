"use client";

import React from "react";
import { AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FormErrorProps {
  title?: string;
  message?: string;
  errors?: string[] | Record<string, string | string[]>;
  variant?: "default" | "destructive";
  className?: string;
}

/**
 * Form Error Component
 *
 * Displays form validation errors in a user-friendly format.
 * Supports single error messages, error arrays, or field-specific errors.
 *
 * Usage:
 * ```tsx
 * // Simple error message
 * <FormError message="Please fix the errors below" />
 *
 * // Array of errors
 * <FormError errors={["Email is required", "Password is too short"]} />
 *
 * // Field-specific errors
 * <FormError errors={{ email: "Invalid email", password: ["Too short", "Must contain number"] }} />
 * ```
 */
export function FormError({
  title = "Validation Error",
  message,
  errors,
  variant = "destructive",
  className,
}: FormErrorProps) {
  // Convert errors to array format
  const errorList: string[] = React.useMemo(() => {
    if (message) return [message];
    if (!errors) return [];

    if (Array.isArray(errors)) {
      return errors;
    }

    // Convert field errors to array
    const fieldErrors: string[] = [];
    Object.entries(errors).forEach(([field, fieldError]) => {
      if (Array.isArray(fieldError)) {
        fieldError.forEach((err) => fieldErrors.push(`${field}: ${err}`));
      } else if (fieldError) {
        fieldErrors.push(`${field}: ${fieldError}`);
      }
    });
    return fieldErrors;
  }, [message, errors]);

  if (errorList.length === 0) return null;

  return (
    <Alert variant={variant} className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {errorList.length === 1 ? (
          <p className="text-sm">{errorList[0]}</p>
        ) : (
          <ul className="list-disc list-inside space-y-1 mt-2">
            {errorList.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Inline Field Error Component
 *
 * Small error message for individual form fields.
 */
export function FieldError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-1.5 text-sm text-destructive mt-1.5 ${className || ""}`}>
      <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Form Error Summary Component
 *
 * Displays a summary of all form errors at the top of a form.
 */
export function FormErrorSummary({
  errors,
  title = "Please fix the following errors:",
}: {
  errors: Record<string, string | string[]>;
  title?: string;
}) {
  const errorCount = React.useMemo(() => {
    let count = 0;
    Object.values(errors).forEach((error) => {
      if (Array.isArray(error)) {
        count += error.length;
      } else if (error) {
        count += 1;
      }
    });
    return count;
  }, [errors]);

  if (errorCount === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {title}
        <span className="text-xs font-normal">({errorCount} errors)</span>
      </AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {Object.entries(errors).map(([field, fieldErrors]) => {
            const errorArray = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
            return errorArray.map((error, index) => (
              <li key={`${field}-${index}`} className="text-sm">
                <span className="font-medium capitalize">{field}:</span> {error}
              </li>
            ));
          })}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
