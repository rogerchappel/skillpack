/**
 * skillpack - Validate, lint, test, and package agent skills
 *
 * The Jest for agent skill directories.
 * Provides programmatic APIs for skill validation and testing.
 */

export type {
  SkillFrontmatter,
  SkillFile,
  ValidationResult,
  ValidationError,
  SchemaField,
  LintResult,
  FixtureTest,
  FixtureResult,
  TestSuite,
  ReportSummary,
} from "./types.js";

export { parseSkillFile, findSkillFiles, extractInlineFixtures } from "./parser.js";
export { validateFrontmatter } from "./validators/frontmatter.js";
export { checkMarkdownSyntax } from "./validators/markdown.js";
export { validateFrontmatterSchema, SKILL_SCHEMA } from "./schema.js";
export { detectReferences, checkReferences } from "./checker.js";
export { runFixture } from "./runner.js";
