import { findSkillFiles, parseSkillFile } from "../parser.js";
import { validateFrontmatter } from "../validators/frontmatter.js";
import { checkMarkdownSyntax } from "../validators/markdown.js";
import { validateFrontmatterSchema } from "../schema.js";
import { checkReferences } from "../checker.js";
import { green, red, yellow, blue, dim, bold } from "../ui/colors.js";

export interface ReportOptions {
  json?: boolean;
}

export async function report(dir: string, opts: ReportOptions = {}): Promise<void> {
  const files = findSkillFiles(dir);

  const reports: Array<{
    file: string;
    status: "pass" | "fail" | "warn";
    issues: string[];
  }> = [];

  for (const file of files) {
    const skill = parseSkillFile(file);
    const issues: string[] = [];

    const fmErrors = validateFrontmatter(skill.frontmatter);
    const schemaErrors = validateFrontmatterSchema(skill.frontmatter);
    const syntaxErrors = checkMarkdownSyntax(skill.body);

    for (const e of [...fmErrors, ...schemaErrors, ...syntaxErrors]) {
      issues.push(`${e.severity.toUpperCase()}: ${e.code} - ${e.message}`);
    }

    const hasErrors = issues.some(i => i.startsWith("ERROR"));
    const hasWarnings = issues.some(i => i.startsWith("WARNING"));
    const status = hasErrors ? "fail" : hasWarnings ? "warn" : "pass";
    reports.push({ file, status, issues });
  }

  if (opts.json) {
    console.log(JSON.stringify(reports, null, 2));
    return;
  }

  // Human readable report
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
