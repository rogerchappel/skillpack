import { parseSkillFile, findSkillFiles } from "../parser.js";
import { validateFrontmatter } from "../validators/frontmatter.js";
import { checkMarkdownSyntax } from "../validators/markdown.js";
import type { ValidationResult, ReportSummary } from "../types.js";
import { green, red, yellow, blue, dim, bold } from "../ui/colors.js";

export async function validate(dir: string): Promise<void> {
  console.log(bold(blue("skillpack validate")));
  console.log(dim(`scanning: ${dir}\n`));

  const files = findSkillFiles(dir);
  if (files.length === 0) {
    console.log(yellow("No SKILL.md files found in the specified directory."));
    process.exit(1);
  }

  console.log(`Found ${bold(String(files.length))} SKILL.md file(s):\n`);

  const results: ValidationResult[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const skill = parseSkillFile(file);
    const errors: ValidationResult["errors"] = [];
    const warnings: ValidationResult["warnings"] = [];

    // 1. Frontmatter validation
    const fmErrors = validateFrontmatter(skill.frontmatter);
    for (const e of fmErrors) {
      if (e.severity === "error") errors.push(e);
      else warnings.push(e);
    }

    // 2. Markdown syntax check
    const syntaxErrors = checkMarkdownSyntax(skill.body);
    for (const e of syntaxErrors) {
      if (e.severity === "error") errors.push(e);
      else warnings.push(e);
    }

    const passed = errors.length === 0;
    results.push({ file, passed, errors, warnings });
    totalErrors += errors.length;
    totalWarnings += warnings.length;

    // Print result
    const symbol = passed ? green("✓") : red("✗");
    const status = passed ? green("PASS") : red("FAIL");
    console.log(`  ${symbol} ${status}  ${file}`);
    for (const e of errors) {
      const lineInfo = e.line ? dim(` (line ${e.line})`) : "";
      console.log(dim(`      → ${red(e.code)}:${e.message}${lineInfo}`));
    }
    for (const w of warnings) {
      const lineInfo = w.line ? dim(` (line ${w.line})`) : "";
      console.log(dim(`      → ${yellow(w.code)}:${w.message}${lineInfo}`));
    }
  }

  console.log();
  const summary: ReportSummary = {
    totalFiles: results.length,
    passedFiles: results.filter(r => r.passed).length,
    failedFiles: results.filter(r => !r.passed).length,
    totalErrors,
    totalWarnings,
    results,
  };

  console.log(bold("Summary:"));
  console.log(`  ${bold(String(summary.totalFiles))} files scanned`);
  console.log(`  ${green(String(summary.passedFiles))} passed, ${red(String(summary.failedFiles))} failed`);
  console.log(`  ${red(String(totalErrors))} errors, ${yellow(String(totalWarnings))} warnings\n`);

  if (summary.failedFiles > 0) {
    process.exit(1);
  }
}
