/** JSON Schema for skill frontmatter fields */

import type { SkillFrontmatter, ValidationError } from "./types.js";
import { validateSkillName } from "./validators/name.js";
import { validateVersion } from "./validators/version.js";

export interface SchemaRule {
  field: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  minLength?: number;
  maxLength?: number;
  enum?: string[];
  pattern?: string;
}

export const SKILL_SCHEMA: SchemaRule[] = [
  { field: "name", type: "string", required: true, minLength: 1, maxLength: 64, pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$" },
  { field: "description", type: "string", required: true, minLength: 1, maxLength: 500 },
  { field: "scope", type: "string", required: false, minLength: 1 },
  { field: "version", type: "string", required: false, pattern: "^\\d+\\.\\d+\\.\\d+" },
  { field: "author", type: "string", required: false, minLength: 1 },
];

export function validateFrontmatterSchema(fm: SkillFrontmatter | null): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!fm) {
    errors.push({ code: "SCHEMA_MISSING_FRONTMATTER", message: "No frontmatter to validate against schema", severity: "error" });
    return errors;
  }

  // Delegate specialized validators
  if ("name" in fm && typeof fm.name === "string") {
    errors.push(...validateSkillName(fm.name));
  }

  if ("version" in fm && typeof fm.version === "string") {
    errors.push(...validateVersion(fm.version));
  }

  // Standard rule-based validation
  for (const rule of SKILL_SCHEMA) {
    const value = fm[rule.field as keyof typeof fm];
    const hasValue = value !== undefined && value !== null && (typeof value !== "string" || value.trim() !== "");

    if (rule.required && !hasValue) {
      errors.push({ code: `SCHEMA_REQUIRED_${rule.field.toUpperCase()}`, message: `Required field '${rule.field}' is missing`, severity: "error" });
      continue;
    }

    if (hasValue) {
      const actualType = typeof value;
      if (rule.type === "string" && actualType !== "string") {
        errors.push({ code: `SCHEMA_TYPE_${rule.field.toUpperCase()}`, message: `Field '${rule.field}' must be a string`, severity: "error" });
        continue;
      }

      if (actualType === "string" && typeof value === "string") {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push({ code: `SCHEMA_TOO_SHORT_${rule.field.toUpperCase()}`, message: `Field '${rule.field}' is too short (min ${rule.minLength} chars)`, severity: "error" });
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push({ code: `SCHEMA_TOO_LONG_${rule.field.toUpperCase()}`, message: `Field '${rule.field}' is too long (max ${rule.maxLength} chars)`, severity: "warning" });
        }
        if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
          errors.push({ code: `SCHEMA_PATTERN_${rule.field.toUpperCase()}`, message: `Field '${rule.field}' does not match pattern: ${rule.pattern}`, severity: "error" });
        }
      }
    }
  }

  return errors;
}
