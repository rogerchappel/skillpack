import { describe, it } from "node:test";
import assert from "node:assert";
import { parseSkillFile } from "../dist/parser.js";
import { validateFrontmatter } from "../dist/validators/frontmatter.js";
import { validateFrontmatterSchema } from "../dist/schema.js";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("frontmatter validation", () => {
  it("detects missing frontmatter", () => {
    const errors = validateFrontmatter(null);
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].code, "MISSING_FRONTMATTER");
  });

  it("passes on valid frontmatter", () => {
    const fm = { name: "test-skill", description: "A test skill" };
    const errors = validateFrontmatter(fm);
    assert.strictEqual(errors.length, 0);
  });

  it("detects missing description", () => {
    const fm = { name: "test-skill" };
    const errors = validateFrontmatter(fm);
    assert.ok(errors.some(e => e.code === "MISSING_DESCRIPTION"));
  });

  it("validates against JSON schema", () => {
    const fm = { name: "bad name!", description: "test" };
    const errors = validateFrontmatterSchema(fm);
    assert.ok(errors.some(e => e.code.startsWith("SCHEMA_PATTERN")));
  });
});

describe("parser", () => {
  it("parses skill file with frontmatter and body", () => {
    const tmp = tmpdir();
    const dir = join(tmp, "skillpack-test-" + Date.now());
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), "---\nname: my-skill\ndescription: test\n---\n\n# My Skill\n\nContent here.\n");
    const skill = parseSkillFile(join(dir, "SKILL.md"));
    assert.strictEqual(skill.frontmatter.name, "my-skill");
    assert.ok(skill.body.includes("# My Skill"));
    rmSync(dir, { recursive: true });
  });

  it("returns null frontmatter when no yaml block", () => {
    const tmp = tmpdir();
    const dir = join(tmp, "skillpack-test-" + Date.now());
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), "# No Frontmatter\n\nJust content.\n");
    const skill = parseSkillFile(join(dir, "SKILL.md"));
    assert.strictEqual(skill.frontmatter, null);
    rmSync(dir, { recursive: true });
  });

  it("extracts inline fixtures", async () => {
    const { extractInlineFixtures } = await import("../dist/parser.js");
    const tmp = tmpdir();
    const dir = join(tmp, "skillpack-test-" + Date.now());
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), `---
name: fixture-skill
description: has fixtures
---

# Skill

\`\`\`yaml
# fixture: example-test
input: hello
expect: world
\`\`\`
`);
    const skill = parseSkillFile(join(dir, "SKILL.md"));
    const extracted = extractInlineFixtures(skill.body);
    assert.strictEqual(extracted.length, 1);
    assert.strictEqual(extracted[0].name, "example-test");
    assert.strictEqual(extracted[0].input, "hello");
    rmSync(dir, { recursive: true });
  });
});
