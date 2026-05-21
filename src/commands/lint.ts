import { parseSkillFile, findSkillFiles, extractInlineFixtures } from "../parser.js";
import { validateFrontmatterSchema } from "../schema.js";
import { checkReferences } from "../checker.js";
import type { LintResult } from "../types.js";
import { green, red, yellow, blue, dim, bold } from "../ui/colors.js";

export async function lint(dir: string): Promise<void> {
  console.log(bold(blue("skillpack lint")));
  console.log(dim(`scanning: ${dir}\n`));

  const files = findSkillFiles(dir);
  if (files.length === 0) {
    console.log(yellow("No SKILL.md files found."));
    process.exit(1);
  }

  console.log(`Found ${bold(String(files.length))} SKILL.md file(s):`);
  console.log();

  const results: LintResult[] = [];
  for (const file of files) {
    const skill = parseSkillFile(file);

    // Schema validation on frontmatter
    const schemaErrors = validateFrontmatterSchema(skill.frontmatter);

    // Reference checking in body
    const refErrors = checkReferences(skill.body, file);

    const passed = schemaErrors.length === 0 && refErrors.length === 0;
    results.push({
      file,
      passed,
      schemaErrors,
      referenceErrors: refErrors,
      warnings: [],
    });

    const symbol = passed ? green("✓") : red("✗");
    const status = passed ? green("PASS") : red("FAIL");
    console.log(`  ${symbol} ${status}  ${file}`);

    for (const e of schemaErrors) {
      console.log(dim(`      → ${red(e.code)}: ${e.message}`));
    }
    for (const e of refErrors) {
      const lineInfo = e.line ? dim(` (line ${e.line})`) : "";
      console.log(dim(`      → ${yellow(e.code)}: ${e.message}${lineInfo}`));
    }

    // Check inline fixtures
    const fixtures = extractInlineFixtures(skill.body);
    for (const fx of fixtures) {
      if (!fx.input || !fx.expect) {
        console.log(dim(`      → ${yellow("EMPTY_FIXTURE")}: Inline fixture "${fx.name}" has no input or expect`));
      }
    }
  }

  console.log();
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  console.log(bold("Lint summary:"));
  console.log(`  ${green(String(passedCount))} passed, ${red(String(failedCount))} failed\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}
