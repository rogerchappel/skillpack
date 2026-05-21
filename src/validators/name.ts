/**
 * Skill Name Validator
 *
 * Validates skill names against strict kebab-case rules.
 * Ensures names are URL-safe and ecosystem-compatible.
 */

import type { ValidationError } from "../types.js";

export function validateSkillName(name: string | undefined): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!name) {
    errors.push({ code: "MISSING_NAME", message: "Skill name is required", severity: "error" });
    return errors;
  }

  if (name.length < 3) {
    errors.push({ code: "NAME_TOO_SHORT", message: "Skill name must be at least 3 characters", severity: "error" });
  }

  if (name.length > 64) {
    errors.push({ code: "NAME_TOO_LONG", message: "Skill name must be at most 64 characters", severity: "error" });
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length >= 3) {
    errors.push({
      code: "INVALID_NAME_PATTERN",
      message: "Skill name must be lowercase kebab-case (letters, numbers, hyphens only)",
      severity: "error"
    });
  }

  if (name.includes("--")) {
    errors.push({ code: "NAME_DOUBLE_HYPHEN", message: "Skill name must not contain consecutive hyphens", severity: "error" });
  }

  if (/^-/.test(name) || /-$/.test(name)) {
    errors.push({ code: "NAME_EDGE_HYPHEN", message: "Skill name must not start or end with a hyphen", severity: "error" });
  }

  return errors;
}
