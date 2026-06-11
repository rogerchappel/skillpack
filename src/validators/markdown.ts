/**
 * Markdown Syntax Checker
 *
 * Checks for basic syntax issues in skill markdown files.
 */

import type { ValidationError } from "../types.js";

export function checkMarkdownSyntax(body: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = body.split("\n");

  // Check for unclosed code blocks
  const codeBlockStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("```")) {
      if (codeBlockStarts.length % 2 === 0) {
        codeBlockStarts.push(i + 1); // 1-indexed
      } else {
        codeBlockStarts.pop();
      }
    }
  }
  for (const line of codeBlockStarts) {
    errors.push({
      code: "UNCLOSED_CODE_BLOCK",
      message: "Unclosed code block started at this line",
      line,
      severity: "error",
    });
  }

  // Check for malformed headers (no space after #)
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}(?![#\s])/.test(lines[i])) {
      errors.push({
        code: "MALFORMED_HEADER",
        message: `Header has no space after #: "${lines[i].trim()}"`,
        line: i + 1,
        severity: "warning",
      });
    }
  }

  // Check for trailing whitespace on important lines (code blocks excluded)
  const inCodeBlock = { value: false };
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("```")) {
      inCodeBlock.value = !inCodeBlock.value;
    }
    if (!inCodeBlock.value && lines[i].endsWith("  ") && lines[i].length > 2) {
      // Trailing whitespace is allowed, just a warning
    }
  }

  // Check for empty skill body
  const trimmed = body.trim();
  if (trimmed === "") {
    errors.push({ code: "EMPTY_BODY", message: "Skill has no markdown body content", severity: "warning" });
  }

  // Check for at least one heading
  if (!/^#{1,6}\s/m.test(trimmed)) {
    errors.push({ code: "NO_HEADING", message: "Skill should contain at least one heading", severity: "warning" });
  }

  errors.push(...checkSideEffectBoundaries(lines));

  return errors;
}

const SIDE_EFFECT_PATTERN =
  /\b(publish|post|submit|send|delete|remove|deploy|release|merge|approve|reject|queue|upload|write to|create issue|open pr)\b/i;
const APPROVAL_PATTERN = /\b(approval|approve|approved|confirm|consent|permission|dry-run|dry run|preview|review first)\b/i;

function checkSideEffectBoundaries(lines: string[]): ValidationError[] {
  const warnings: ValidationError[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock || !SIDE_EFFECT_PATTERN.test(line)) {
      continue;
    }

    const windowStart = Math.max(0, i - 2);
    const windowEnd = Math.min(lines.length, i + 3);
    const context = lines.slice(windowStart, windowEnd).join("\n");
    if (!APPROVAL_PATTERN.test(context)) {
      warnings.push({
        code: "SIDE_EFFECT_BOUNDARY_MISSING",
        message: "External side-effect instruction should mention approval, confirmation, preview, or dry-run boundaries",
        line: i + 1,
        severity: "warning",
      });
    }
  }

  return warnings;
}
