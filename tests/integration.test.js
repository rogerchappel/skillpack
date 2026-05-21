import { describe, it } from "node:test";
import assert from "node:assert";
import { parseSkillFile, findSkillFiles, extractInlineFixtures } from "../dist/parser.js";
import { validateFrontmatter } from "../dist/validators/frontmatter.js";
import { checkMarkdownSyntax } from "../dist/validators/markdown.js";
import { validateFrontmatterSchema } from "../dist/schema.js";
import { validateScope } from "../dist/validators/scope.js";
import { validateTags } from "../dist/validators/tags.js";
import { checkReferences } from "../dist/checker.js";
import { runFixture } from "../dist/runner.js";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:node:path".replace("node:node:path", "node:path");

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "..", "fixtures", "skills");

describe("integration: full skill validation pipeline", () => {
  it("validates good-skill end-to-end", () => {
    const skillPath = join(fixturesDir, "good-skill", "SKILL.md");
    const skill = parseSkillFile(skillPath);
    assert.ok(skill.frontmatter);
    assert.ok(skill.body.length > 0);

    const fmErrors = validateFrontmatter(skill.frontmatter);
    assert.strictEqual(fmErrors.length, 0, `Unexpected frontmatter errors: ${JSON.stringify(fmErrors)}`);

    const syntaxErrors = checkMarkdownSyntax(skill.body);
    assert.strictEqual(syntaxErrors.length, 0);

    const schemaErrors = validateFrontmatterSchema(skill.frontmatter);
    assert.strictEqual(schemaErrors.length, 0);
  });

  it("detects bad-skill failures", () => {
    const skillPath = join(fixturesDir, "bad-skill", "SKILL.md");
    const skill = parseSkillFile(skillPath);
    assert.ok(skill.frontmatter);

    const fmErrors = validateFrontmatter(skill.frontmatter);
    assert.ok(fmErrors.some(e => e.code === "MISSING_DESCRIPTION"));
  });

  it("finds both skill fixtures in fixtures directory", () => {
    const files = findSkillFiles(fixturesDir);
    assert.strictEqual(files.length, 2);
  });

  it("extracts fixtures from good-skill", () => {
    const skillPath = join(fixturesDir, "good-skill", "SKILL.md");
    const skill = parseSkillFile(skillPath);
    const fixtures = extractInlineFixtures(skill.body);
    assert.ok(fixtures.length > 0);
    assert.ok(fixtures[0].name);
    assert.ok(fixtures[0].input);
    assert.ok(fixtures[0].expect);
  });

  it("runs extracted fixtures in mock mode", () => {
    const skillPath = join(fixturesDir, "good-skill", "SKILL.md");
    const skill = parseSkillFile(skillPath);
    const fixtures = extractInlineFixtures(skill.body);

    for (const fx of fixtures) {
      const result = runFixture(fx, { mock: true });
      assert.ok(result.passed || result.errors.length === 0, `Fixture ${fx.name} failed: ${result.errors.join(", ")}`);
    }
  });

  it("validates scope for skills with scope defined", () => {
    // Good skill has scope: file-management
    const skillPath = join(fixturesDir, "good-skill", "SKILL.md");
    const skill = parseSkillFile(skillPath);
    if (skill.frontmatter?.scope) {
      const scopeErrs = validateScope(skill.frontmatter.scope);
      assert.strictEqual(scopeErrs.length, 0);
    }
  });
});

describe("integration: library API consistency", () => {
  it("all exported functions are callable", async () => {
    // Just verify imports don't crash
    assert.ok(typeof parseSkillFile === "function");
    assert.ok(typeof findSkillFiles === "function");
    assert.ok(typeof extractInlineFixtures === "function");
    assert.ok(typeof validateFrontmatter === "function");
    assert.ok(typeof checkMarkdownSyntax === "function");
    assert.ok(typeof validateFrontmatterSchema === "function");
    assert.ok(typeof validateScope === "function");
    assert.ok(typeof validateTags === "function");
    assert.ok(typeof checkReferences === "function");
    assert.ok(typeof runFixture === "function");
  });
});
