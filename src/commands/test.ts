import { parseSkillFile, findSkillFiles, extractInlineFixtures } from "../parser.js";
import type { TestSuite, FixtureResult } from "../types.js";
import { runFixture } from "../runner.js";
import { green, red, yellow, blue, dim, bold } from "../ui/colors.js";

export interface TestOptions {
  mock?: boolean;
}

export async function test(dir: string, opts: TestOptions = {}): Promise<void> {
  const mockMode = opts.mock ?? false;
  console.log(bold(blue("skillpack test")));
  console.log(dim(`scanning: ${dir}$`));
  if (mockMode) console.log(dim("(mock mode enabled)\n"));
  else console.log();

  const files = findSkillFiles(dir);
  if (files.length === 0) {
    console.log(yellow("No SKILL.md files found."));
    process.exit(1);
  }

  // Collect suites: inline + external
  const suites: TestSuite[] = [];
  for (const file of files) {
    const skill = parseSkillFile(file);
    const fixtures = extractInlineFixtures(skill.body);
    if (fixtures.length > 0) {
      suites.push({ file, fixtures });
    }
  }

  if (suites.length === 0) {
    console.log(yellow("No fixtures found in any SKILL.md files."));
    console.log(dim("Add inline fixtures (yaml code blocks with input:/expect:) to your skills."));
    process.exit(0);
  }

  console.log(`Running ${bold(String(suites.length))} fixture suite(s):\n`);

  const allResults: FixtureResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    console.log(bold(suite.file));
    for (const fx of suite.fixtures) {
      const result = runFixture(fx, { mock: mockMode });
      allResults.push(result);
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

  if (totalFailed > 0) {
    process.exit(1);
  }
}
