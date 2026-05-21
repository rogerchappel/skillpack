/**
 * Version Validator
 *
 * Validates version strings against semver conventions.
 */

import type { ValidationError } from "../types.js";

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?(?:\+([\w.-]+))?$/;

export function validateVersion(version: string | undefined): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!version) {
    errors.push({ code: "MISSING_VERSION", message: "Version field is not defined", severity: "warning" });
    return errors;
  }

  const match = version.match(SEMVER_RE);
  if (!match) {
    errors.push({
      code: "INVALID_VERSION",
      message: "Version must follow semver format (MAJOR.MINOR.PATCH)",
      severity: "error"
    });
    return errors;
  }

  const major = Number(match[1]);
  if (major === 0) {
    errors.push({
      code: "VERSION_ZERO_MAJOR",
      message: "Version 0.x.x indicates pre-release/stability not yet achieved",
      severity: "warning"
    });
  }

  return errors;
}
