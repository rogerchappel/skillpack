#!/usr/bin/env node

/**
 * skillpack CLI entry point
 *
 * Usage:
 *   skillpack validate <dir>  - Validate SKILL.md structure
 *   skillpack lint <dir>      - Schema & dependency checking
 *   skillpack test <dir>      - Fixture-based dry-run
 *   skillpack report <dir>    - Generate validation report
 */

import { parseSkillFile, findSkillFiles, extractInlineFixtures } from "./parser.js";
import { validateFrontmatter } from "./validators/frontmatter.js";
import { checkMarkdownSyntax } from "./validators/markdown.js";
import { validateFrontmatterSchema, SKILL_SCHEMA } from "./schema.js";
import { checkReferences } from "./checker.js";
import { runFixture } from "./runner.js";
import { validateScope } from "./validators/scope.js";
import { validateTags } from "./validators/tags.js";
import { green, red, yellow, blue, dim, bold, cyan } from "./ui/colors.js";

type Command = "validate" | "lint" | "test" | "report" | "help" | "--version" | "-v";

function parseArgs(argv: string[]): { command: Command; dir: string; flags: Record<string, boolean> } {
  const args = argv.slice(2);
  const command = (args[0] ?? "help") as Command;
  const dir = args[1] ?? ".";
  const flags: Record<string, boolean> = {};
  for (const arg of args.slice(2)) {
    if (arg.startsWith("--")) {
      flags[arg.slice(2)] = true;
    }
  }
  return { command, dir, flags };
}

function printHelp(): void {
  console.log(bold(cyan("skillpack")) + dim(" - Agent skill validator & tester\n"));
  console.log(bold("Usage:"));
  console.log(`  skillpack validate <dir>    ${dim("Validate SKILL.md structure and frontmatter")}`);
  console.log(`  skillpack lint <dir>        ${dim("Check schema, references, and dependencies")}`);
  console.log(`  skillpack test <dir>        ${dim("Run fixture-based dry-run validation")}`);
  console.log(`  skillpack report <dir>      ${dim("Generate validation report")}`);
  console.log(`  skillpack help              ${dim("Show this help message")}`);
  console.log();
  console.log(bold("Options:"));
  console.log(`  --mock     ${dim("Run in mock/offline mode (no real execution)")}`);
  console.log(`  --json     ${dim("Output report as JSON")}`);
  console.log(`  --help     ${dim("Show this help message")}`);
  console.log(`  --version  ${dim("Show version")}`);
}

// --- Validation Helpers ----------

function collectErrorsAndWarnings(skill: ReturnType<typeof parseSkillFile>): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Frontmatter validation
  const fmErrors = validateFrontmatter(skill.frontmatter);
  for (const e of fmErrors) {
    if (e.severity === "error") errors.push(`${e.code}: ${e.message}`);
    else warnings.push(`${e.code}: ${e.message}`);
  }

  // Markdown syntax
  const syntaxErrors = checkMarkdownSyntax(skill.body);
  for (const e of syntaxErrors) {
    if (e.severity === "error") errors.push(`${e.code}: ${e.message}`);
    else warnings.push(`${e.code}: ${e.message}`);
  }

  // Scope validation
  if (skill.frontmatter) {
    const scopeErrs = validateScope(skill.frontmatter.scope as string);
    for (const e of scopeErrs) {
      if (e.severity === "error") errors.push(`${e.code}: ${e.message}`);
      else warnings.push(`${e.code}: ${e.message}`);
    }
  }

  // Tags validation
  if (skill.frontmatter && "tags" in skill.frontmatter) {
    const tagErrs = validateTags(skill.frontmatter.tags);
    for (const e of tagErrs) {
      if (e.severity === "error") errors.push(`${e.code}: ${e.message}`);
      else warnings.push(`${e.code}: ${e.message}`);
    }
  }

  return { errors, warnings };
}

// --- Commands ----------

async function runValidate(dir: string): Promise<void> {
  console.log(bold(blue("skillpack validate")));
  console.log(dim(`scanning: ${dir}\n`));

  const files = findSkillFiles(dir);
  if (files.length === 0) {
    console.log(yellow("No SKILL.md files found in the specified directory."));
    process.exit(1);
  }

  console.log(`Found ${bold(String(files.length))} SKILL.md file(s):\n`);

  let totalPassed = 0;
  let totalFailed = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const skill = parseSkillFile(file);
    const { errors, warnings } = collectErrorsAndWarnings(skill);

    totalErrors += errors.length;
    totalWarnings += warnings.length;
    const passed = errors.length === 0;
    if (passed) totalPassed++;
    else totalFailed++;

    const symbol = passed ? green("✓") : red("✗");
    const status = passed ? green("PASS") : red("FAIL");
    console.log(`  ${symbol} ${status}  ${file}`);
    for (const e of errors) {
      console.log(dim(`      → ${red(e)}`));
    }
    for (const w of warnings) {
      console.log(dim(`      → ${yellow(w)}`));
    }
  }

  console.log();
  console.log(bold("Summary:"));
  console.log(`  ${bold(String(files.length))} files scanned`);
  console.log(`  ${green(String(totalPassed))} passed, ${red(String(totalFailed))} failed`);
  console.log(`  ${red(String(totalErrors))} errors, ${yellow(String(totalWarnings))} warnings\n`);

  if (totalFailed > 0) process.exit(1);
}

async function runLint(dir: string): Promise<void> {
  console.log(bold(blue("skillpack lint")));
  console.log(dim(`scanning: ${dir}\n`));

  const files = findSkillFiles(dir);
  if (files.length === 0) {
    console.log(yellow("No SKILL.md files found."));
    process.exit(1);
  }

  console.log(`Found ${bold(String(files.length))} SKILL.md file(s):\n`);

  let totalPassed = 0;
  let totalFailed = 0;

  for (const file of files) {
    const skill = parseSkillFile(file);
    const { errors, warnings } = collectErrorsAndWarnings(skill);

    // Schema validation
    const schemaErrors = validateFrontmatterSchema(skill.frontmatter);
    for (const e of schemaErrors) {
      errors.push(`${e.code}: ${e.message}`);
    }

    // Reference checking
    const refErrors = checkReferences(skill.body, file);
    for (const e of refErrors) {
      errors.push(`${e.code}: ${e.message}`);
    }

    const passed = errors.length === 0;
    if (passed) totalPassed++;
    else totalFailed++;

    const symbol = passed ? green("✓") : red("✗");
    const status = passed ? green("PASS") : red("FAIL");
    console.log(`  ${symbol} ${status}  ${file}`);
    for (const e of errors) {
      console.log(dim(`      → ${red(e)}`));
    }
    for (const w of warnings) {
      console.log(dim(`      → ${yellow(w)}`));
    }

    // Check inline fixtures
    const fixtures = extractInlineFixtures(skill.body);
    for (const fx of fixtures) {
      if (!fx.input || !fx.expect) {
        console.log(dim(`      → ${yellow("EMPTY_FIXTURE")}: Inline fixture "${fx.name}" missing input or expect`));
      }
    }
  }

  console.log();
  console.log(bold("Lint summary:"));
  console.log(`  ${green(String(totalPassed))} passed, ${red(String(totalFailed))} failed\n`);

  if (totalFailed > 0) process.exit(1);
}

async function runTest(dir: string, opts?: { mock: boolean }): Promise<void> {
  const mockMode = opts?.mock ?? false;
  console.log(bold(blue("skillpack test")));
  console.log(dim(`scanning: ${dir}`));
  if (mockMode) console.log(dim("(mock mode enabled)\n"));
  else console.log();

  const files = findSkillFiles(dir);
  if (files.length === 0) {
    console.log(yellow("No SKILL.md files found."));
    process.exit(1);
  }

  // Collect suites: inline fixtures
  let totalFixtures = 0;
  for (const file of files) {
    const skill = parseSkillFile(file);
    const fixtures = extractInlineFixtures(skill.body);
    if (fixtures.length > 0) {
      totalFixtures += fixtures.length;
    }
  }

  if (totalFixtures === 0) {
    console.log(yellow("No fixtures found in any SKILL.md files."));
    console.log(dim("Add inline fixtures (yaml code blocks with input:/expect:) to your skills."));
    process.exit(0);
  }

  console.log(bold(`Running ${totalFixtures} fixture(s):\n`));

  let totalPassed = 0;
  let totalFailed = 0;

  for (const file of files) {
    const skill = parseSkillFile(file);
    const fixtures = extractInlineFixtures(skill.body);
    if (fixtures.length === 0) continue;

    console.log(bold(file));
    for (const fx of fixtures) {
      const result = runFixture(fx, { mock: mockMode });
      if (result.passed) totalPassed++;
      else totalFailed++;

      const symbol = result.passed ? green("✓") : red("✗");
      console.log(`  ${symbol} ${result.fixture}`);
      for (const err of result.errors) {
        console.log(dim(`      → ${err}`));
      }
    }
    console.log();
  }

  console.log(bold("Test summary:"));
  console.log(`  ${green(String(totalPassed))} passed, ${red(String(totalFailed))} failed\n`);

  if (totalFailed > 0) process.exit(1);
}

async function runReport(dir: string, opts?: { json: boolean }): Promise<void> {
  const files = findSkillFiles(dir);

  const reports: Array<{ file: string; status: string; issues: string[] }> = [];

  for (const file of files) {
    const skill = parseSkillFile(file);
    const issues: string[] = [];

    const fmErrors = validateFrontmatter(skill.frontmatter);
    const schemaErrors = validateFrontmatterSchema(skill.frontmatter);
    const syntaxErrors = checkMarkdownSyntax(skill.body);
    const scopeErrs = skill.frontmatter ? validateScope(skill.frontmatter.scope as string) : [];
    const tagErrs = skill.frontmatter && "tags" in skill.frontmatter ? validateTags(skill.frontmatter.tags) : [];

    const allValidation = [...fmErrors, ...schemaErrors, ...syntaxErrors, ...scopeErrs, ...tagErrs];
    for (const e of allValidation) {
      issues.push(`${e.severity.toUpperCase()}: ${e.code} - ${e.message}`);
    }

    const hasErrors = issues.some(i => i.startsWith("ERROR"));
    const hasWarnings = issues.some(i => i.startsWith("WARNING"));
    const status = hasErrors ? "fail" : hasWarnings ? "warn" : "pass";
    reports.push({ file, status, issues });
  }

  if (opts?.json) {
    console.log(JSON.stringify(reports, null, 2));
    return;
  }

  console.log(bold(blue("skillpack report")));
  console.log(`Results: ${bold(String(files.length))} file(s)\n`);

  for (const r of reports) {
    const color = r.status === "pass" ? green : r.status === "warn" ? yellow : red;
    const symbol = r.status === "pass" ? "✓" : r.status === "warn" ? "⚠" : "✗";
    console.log(`${color(symbol)} ${r.file}`);
    for (const issue of r.issues) {
      console.log(dim(`   ${issue}`));
    }
  }

  const passCount = reports.filter(r => r.status === "pass").length;
  console.log(`\n${bold(`Passed: ${passCount}/${reports.length}`)}`);
}

// Main entry
async function main(): Promise<void> {
  const { command, dir, flags } = parseArgs(process.argv);

  switch (command) {
    case "help":
    case undefined:
      printHelp();
      break;
    case "--version":
    case "-v":
      console.log("0.1.0");
      break;
    case "validate":
      await runValidate(dir);
      break;
    case "lint":
      await runLint(dir);
      break;
    case "test":
      await runTest(dir, { mock: flags.mock ?? false });
      break;
    case "report":
      await runReport(dir, { json: flags.json ?? false });
      break;
    default:
      console.log(red(`Unknown command: ${command}`));
      printHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error(red(`Error: ${err.message}`));
  process.exit(1);
});
