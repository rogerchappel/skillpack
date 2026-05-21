import { describe, it } from "node:test";
import assert from "node:assert";
import { validateSkillName } from "../dist/validators/name.js";
import { validateVersion } from "../dist/validators/version.js";
import { validateTags } from "../dist/validators/tags.js";
import { validateScope } from "../dist/validators/scope.js";

describe("name validator", () => {
  it("rejects undefined name", () => {
    const errors = validateSkillName(undefined);
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].code, "MISSING_NAME");
  });

  it("rejects names that are too short", () => {
    const errors = validateSkillName("ab");
    assert.ok(errors.some(e => e.code === "NAME_TOO_SHORT"));
  });

  it("rejects names that are too long", () => {
    const errors = validateSkillName("a".repeat(65));
    assert.ok(errors.some(e => e.code === "NAME_TOO_LONG"));
  });

  it("rejects names with uppercase", () => {
    const errors = validateSkillName("MySkill");
    assert.ok(errors.some(e => e.code === "INVALID_NAME_PATTERN"));
  });

  it("rejects names with spaces", () => {
    const errors = validateSkillName("my skill");
    assert.ok(errors.some(e => e.code === "INVALID_NAME_PATTERN"));
  });

  it("rejects names with double hyphens", () => {
    const errors = validateSkillName("my--skill");
    assert.ok(errors.some(e => e.code === "NAME_DOUBLE_HYPHEN"));
  });

  it("rejects names starting with hyphen", () => {
    const errors = validateSkillName("-my-skill");
    assert.ok(errors.some(e => e.code === "NAME_EDGE_HYPHEN"));
  });

  it("rejects names ending with hyphen", () => {
    const errors = validateSkillName("my-skill-");
    assert.ok(errors.some(e => e.code === "NAME_EDGE_HYPHEN"));
  });

  it("accepts valid kebab-case names", () => {
    const errors = validateSkillName("my-cool-skill");
    assert.strictEqual(errors.length, 0);
  });

  it("accepts numeric-kebab names", () => {
    const errors = validateSkillName("skill2-0");
    assert.strictEqual(errors.length, 0);
  });
});

describe("version validator", () => {
  it("warns on missing version", () => {
    const errors = validateVersion(undefined);
    assert.ok(errors.some(e => e.code === "MISSING_VERSION"));
  });

  it("rejects malformed versions", () => {
    const errors = validateVersion("1.0");
    assert.ok(errors.some(e => e.code === "INVALID_VERSION"));
  });

  it("warns on 0.x.x versions", () => {
    const errors = validateVersion("0.1.0");
    assert.ok(errors.some(e => e.code === "VERSION_ZERO_MAJOR"));
  });

  it("accepts valid semver", () => {
    const errors = validateVersion("1.2.3");
    assert.strictEqual(errors.length, 0);
  });

  it("accepts semver with prerelease", () => {
    const errors = validateVersion("2.0.0-beta.1");
    assert.strictEqual(errors.length, 0);
  });
});

describe("tags validator", () => {
  it("skips undefined tags", () => {
    const errors = validateTags(undefined);
    assert.strictEqual(errors.length, 0);
  });

  it("rejects non-array tags", () => {
    const errors = validateTags("not-an-array");
    assert.ok(errors.some(e => e.code === "TAGS_NOT_ARRAY"));
  });

  it("rejects non-string tags", () => {
    const errors = validateTags([123, "valid"]);
    assert.ok(errors.some(e => e.code.startsWith("TAG_TYPE")));
  });

  it("detects tags with bad characters", () => {
    const errors = validateTags(["valid", "BAD TAG"]);
    assert.ok(errors.some(e => e.code.startsWith("TAG_BAD_CHARS")));
  });

  it("detects duplicate tags", () => {
    const errors = validateTags(["testing", "Testing", "validation"]);
    assert.ok(errors.some(e => e.code === "TAG_DUPLICATE"));
  });

  it("warns on empty tags array", () => {
    const errors = validateTags([]);
    assert.ok(errors.some(e => e.code === "EMPTY_TAGS"));
  });

  it("accepts valid tags", () => {
    const errors = validateTags(["testing", "validation", "agent-skills"]);
    assert.strictEqual(errors.length, 0);
  });
});

describe("scope validator", () => {
  it("skips undefined scope", () => {
    const errors = validateScope(undefined);
    assert.strictEqual(errors.length, 0);
  });

  it("warns on empty scope", () => {
    const errors = validateScope("");
    assert.ok(errors.some(e => e.code === "EMPTY_SCOPE"));
  });

  it("warns on unknown scope", () => {
    const errors = validateScope("pizza-delivery");
    assert.ok(errors.some(e => e.code === "UNKNOWN_SCOPE"));
  });

  it("accepts valid known scope", () => {
    const errors = validateScope("file-management");
    assert.strictEqual(errors.length, 0);
  });

  it("accepts case-insensitive scope", () => {
    const errors = validateScope("Testing");
    assert.strictEqual(errors.length, 0);
  });
});
