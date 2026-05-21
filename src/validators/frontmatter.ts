/**
 * YAML Frontmatter Validator
 *
 * Validates that the frontmatter contains all required fields
 * and that values are of the correct type.
 */

import type { SkillFrontmatter, ValidationError } from "../types.js";

const REQUIRED_FIELDS: Array<{ key: string; type: string; message: string }> = [
  { key: "name", type: "string", message: "Missing required field: 'name' (skill identifier)" },
  { key: "description", type: "string", message: "Missing required field: 'description' (what this skill does)" },
];

const KNOWN_FIELDS = new Set(["name", "description", "scope", "icon", "title", "version", "author", "tags"]);

export function validateFrontmatter(fm: SkillFrontmatter | null): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!fm) {
    errors.push({ code: "MISSING_FRONTMATTER", message: "No YAML frontmatter found", severity: "error" });
    return errors;
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field.key in fm) || fm[field.key as keyof typeof fm] === undefined || fm[field.key as keyof typeof fm] === "") {
      errors.push({ code: `MISSING_${field.key.toUpperCase()}`, message: field.message, severity: "error" });
    } else if (typeof fm[field.key as keyof typeof fm] !== field.type) {
      errors.push({
        code: `INVALID_${field.key.toUpperCase()}`,
        message: `Field '${field.key}' must be a ${field.type}`,
        severity: "error",
      });
    }
  }

  // Check for unknown fields
  for (const key of Object.keys(fm)) {
    if (!KNOWN_FIELDS.has(key)) {
      // Unknown fields are just a warning, not an error
    }
  }

  // Scope validation
  if ("scope" in fm && typeof fm.scope === "string" && fm.scope.trim() === "") {
    errors.push({ code: "EMPTY_SCOPE", message: "Field 'scope' must not be empty", severity: "warning" });
  }

  return errors;
}
