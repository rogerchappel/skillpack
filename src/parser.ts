/**
 * SkillFileParser - Parse SKILL.md files and extract YAML frontmatter + body.
 *
 * Detects the YAML frontmatter block (between --- markers) and the markdown body.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { SkillFile, SkillFrontmatter } from "./types.js";

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;

function extractFrontmatter(raw: string): { frontmatter: SkillFrontmatter | null; body: string } {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: null, body: raw };
  }
  const yamlBlock = match[1];
  const frontmatter = parseFrontmatterYaml(yamlBlock);
  return { frontmatter, body: match[2] };
}

function parseFrontmatterYaml(yaml: string): SkillFrontmatter {
  const obj: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  for (const line of lines) {
    const m = line.match(/^(\w[\w-]*):\s+(.*)$/);
    if (!m) continue;
    const key = m[1];
    const rawVal = m[2];
    obj[key] = tryParseValue(rawVal.trim());
  }
  return obj as unknown as SkillFrontmatter;
}

function tryParseValue(val: string): unknown {
  if (val === "true") return true;
  if (val === "false") return false;
  if (/^\d+$/.test(val)) return Number(val);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}

export function parseSkillFile(filePath: string, content?: string): SkillFile {
  const resolved = resolve(filePath);
  const raw = content ?? readFileSync(resolved, "utf8");
  const { frontmatter, body } = extractFrontmatter(raw);
  const lineCount = raw.split("\n").length;
  return { path: resolved, frontmatter, body, rawContent: raw, lineCount };
}

export function findSkillFiles(dir: string): string[] {
  const resolvedDir = resolve(dir);
  if (!existsSync(resolvedDir)) {
    throw new Error(`Directory not found: ${resolvedDir}`);
  }
  return findSkillFilesRecursive(resolvedDir);
}

function findSkillFilesRecursive(dir: string): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
      results.push(...findSkillFilesRecursive(fullPath));
    } else if (entry === "SKILL.md") {
      results.push(fullPath);
    }
  }
  return results;
}

export function extractInlineFixtures(body: string): Array<{ name: string; input: string; expect: string }> {
  // Match yaml code blocks that contain input:/expect: pairs
  const yamlBlocks = body.match(/```yaml\s*\n([\s\S]*?)```/g) ?? [];
  const fixtures: Array<{ name: string; input: string; expect: string }> = [];

  for (const block of yamlBlocks) {
    const content = block.replace(/```yaml\s*\n/, "").replace(/```/, "");
    const lines = content.split("\n");

    // Check if this is a fixture block (has fixture: comment or input:/expect:)
    const nameMatch = content.match(/# fixture:\s+(.+?)(?:\n|$)/);
    const hasInput = content.includes("input:");
    const hasExpect = content.includes("expect:");

    if (!hasInput && !hasExpect && !nameMatch) continue;

    let input = "";
    let expect = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || !trimmed.includes(":")) continue;
      const colonIdx = trimmed.indexOf(":");
      const key = trimmed.slice(0, colonIdx).trim();
      const val = trimmed.slice(colonIdx + 1).trim();
      if (key === "input") input = val;
      if (key === "expect") expect = val;
    }

    fixtures.push({
      name: nameMatch?.[1] ?? "inline-fixture",
      input,
      expect,
    });
  }

  return fixtures;
}
