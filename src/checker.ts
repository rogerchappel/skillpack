/**
 * Dependency Reference Checker
 *
 * Detects broken references in skill markdown:
 * - Tool references: `tool:xyz`, `use:xyz`, `requires:xyz`
 * - File references: `./path/to/file`
 * - Other skill references: `skill:xyz`
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { ValidationError } from "./types.js";

/** Common tool names that are valid in agent skill ecosystems */
const VALID_TOOL_PATTERNS = [
  "browser", "exec", "read", "write", "edit", "web_search", "web_fetch",
  "memory", "process", "image", "file_fetch", "dir_list", "dir_fetch",
  "file_write", "sessions_spawn", "sessions_list", "sessions_history",
  "message", "tts", "canvas", "pdf", "update_plan",
  "^\\w[\\w-]*$", // allow any tool-like name (open ecosystem)
];

interface ToolRef {
  name: string;
  line: number;
  kind: "tool" | "skill" | "file";
}

export function detectReferences(body: string): ToolRef[] {
  const refs: ToolRef[] = [];
  const lines = body.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip code blocks content for file refs but not for inline references
    // Match tool:xyz, use:xyz, requires:xyz patterns
    const toolMatches = line.matchAll(/(?:tool|tool_ref|use|requires?):\s*([a-zA-Z0-9_-]+)/g);
    for (const m of toolMatches) {
      refs.push({ name: m[1], line: i + 1, kind: "tool" });
    }

    // Match skill:xyz references
    const skillMatches = line.matchAll(/(?:skill_ref|skill):\s*([a-zA-Z0-9_-]+)/g);
    for (const m of skillMatches) {
      refs.push({ name: m[1], line: i + 1, kind: "skill" });
    }

    // Match relative file paths in markdown links or standalone refs
    const fileMatches = line.matchAll(/\[.*?\]\((\.\/[^)]+)\)/g);
    for (const m of fileMatches) {
      refs.push({ name: m[1], line: i + 1, kind: "file" });
    }
  }

  return refs;
}

export function checkReferences(body: string, skillFilePath: string): ValidationError[] {
  const refs = detectReferences(body);
  const errors: ValidationError[] = [];
  const skillDir = dirname(skillFilePath);

  for (const ref of refs) {
    if (ref.kind === "file") {
      // Check if referenced file exists
      const resolvedPath = resolve(skillDir, ref.name);
      if (!existsSync(resolvedPath)) {
        errors.push({
          code: "BROKEN_FILE_REF",
          message: `Referenced file does not exist: ${ref.name}`,
          line: ref.line,
          severity: "error",
        });
      }
    }
    // Note: tool and skill references are informational only - we don't
    // validate that tools exist in a specific agent's ecosystem
  }

  // Check for markdown tool call syntax: [tool_name] or `tool_name` used as call refs
  const inlineToolRefs = body.matchAll(/\[([a-zA-Z][a-zA-Z0-9_-]*)\]/g);
  // These are treated as soft references, no validation needed

  return errors;
}
