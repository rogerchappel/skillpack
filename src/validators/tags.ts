/**
 * Tags Validator
 *
 * Validates skill tags array for format and ecosystem relevance.
 */

import type { ValidationError } from "../types.js";

const VALID_TAG_CHARS = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const MAX_TAGS = 20;
const MIN_TAG_LEN = 1;
const MAX_TAG_LEN = 40;

export function validateTags(tags: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (tags === undefined || tags === null) {
    return errors; // tags are optional
  }

  if (!Array.isArray(tags)) {
    errors.push({ code: "TAGS_NOT_ARRAY", message: "Field 'tags' must be an array", severity: "error" });
    return errors;
  }

  if (tags.length > MAX_TAGS) {
    errors.push({
      code: "TOO_MANY_TAGS",
      message: `Too many tags (max ${MAX_TAGS}, got ${tags.length})`,
      severity: "warning"
    });
  }

  if (tags.length === 0) {
    errors.push({ code: "EMPTY_TAGS", message: "Tags array is empty - add at least one tag for discoverability", severity: "warning" });
  }

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    if (typeof tag !== "string") {
      errors.push({ code: `TAG_TYPE_${i}`, message: `Tag at index ${i} must be a string`, severity: "error" });
      continue;
    }
    if (tag.length < MIN_TAG_LEN) {
      errors.push({ code: `TAG_TOO_SHORT_${i}`, message: `Tag at index ${i} is too short`, severity: "warning" });
    }
    if (tag.length > MAX_TAG_LEN) {
      errors.push({ code: `TAG_TOO_LONG_${i}`, message: `Tag at index ${i} exceeds ${MAX_TAG_LEN} characters`, severity: "error" });
    }
    if (!/^[a-z0-9-]+$/.test(tag)) {
      errors.push({ code: `TAG_BAD_CHARS_${i}`, message: `Tag at index ${i} must be lowercase alphanumeric with hyphens`, severity: "error" });
    }
  }

  // Check for duplicates
  const seen = new Set<string>();
  for (const tag of tags) {
    if (typeof tag === "string") {
      if (seen.has(tag.toLowerCase())) {
        errors.push({ code: "TAG_DUPLICATE", message: `Duplicate tag found: "${tag}"`, severity: "warning" });
      }
      seen.add(tag.toLowerCase());
    }
  }

  return errors;
}
