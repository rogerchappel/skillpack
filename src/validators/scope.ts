/**
 * Scope Validator
 *
 * Validates skill scope against known ecosystem categories.
 * Helps ensure skills use consistent categorization.
 */

import type { ValidationError } from "../types.js";

const KNOWN_SCOPES = [
  "file-management", "code-generation", "testing", "debugging",
  "documentation", "git", "ci-cd", "security", "deployment",
  "data-processing", "api", "database", "authentication",
  "monitoring", "communication", "automation", "ai-ml",
  "devops", "infrastructure", "mobile", "web",
] as const;

export type KnownScope = typeof KNOWN_SCOPES[number];

export function validateScope(scope: string | undefined): ValidationError[] {
  const errors: ValidationError[] = [];

  if (scope === undefined || scope === null) {
    return errors; // scope is optional
  }

  const normalized = scope.toLowerCase().trim();
  if (normalized.length === 0) {
    errors.push({ code: "EMPTY_SCOPE", message: "Scope field must not be empty", severity: "warning" });
    return errors;
  }

  const match = KNOWN_SCOPES.find(s => s === normalized);
  if (!match) {
    errors.push({
      code: "UNKNOWN_SCOPE",
      message: `Scope "${scope}" is not a recognized category. Consider: ${KNOWN_SCOPES.slice(0, 5).join(", ")}, ...`,
      severity: "warning"
    });
  }

  return errors;
}
