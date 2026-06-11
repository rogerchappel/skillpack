import { describe, it } from "node:test";
import assert from "node:assert";
import { checkMarkdownSyntax } from "../dist/validators/markdown.js";

describe("markdown syntax", () => {
  it("detects unclosed code blocks", () => {
    const body = "Some text\n\n```bash\necho hello\n";
    const errors = checkMarkdownSyntax(body);
    assert.ok(errors.some(e => e.code === "UNCLOSED_CODE_BLOCK"));
  });

  it("passes on well-formed markdown", () => {
    const body = "# Title\n\nSome text.\n\n```js\nconst x = 1;\n```\n";
    const errors = checkMarkdownSyntax(body);
    assert.strictEqual(errors.length, 0);
  });

  it("detects malformed headers", () => {
    const body = "##NoSpace\n";
    const errors = checkMarkdownSyntax(body);
    assert.ok(errors.some(e => e.code === "MALFORMED_HEADER"));
  });

  it("warns about empty body", () => {
    const errors = checkMarkdownSyntax("");
    assert.ok(errors.some(e => e.code === "EMPTY_BODY"));
  });

  it("warns when external side effects lack approval boundaries", () => {
    const body = "# Deploy\n\n- Deploy the app and publish the release notes.\n";
    const errors = checkMarkdownSyntax(body);
    assert.ok(errors.some(e => e.code === "SIDE_EFFECT_BOUNDARY_MISSING"));
  });

  it("accepts side effects with dry-run or approval language", () => {
    const body = "# Release\n\n- Prepare a dry-run first.\n- Deploy only after explicit approval.\n";
    const errors = checkMarkdownSyntax(body);
    assert.ok(!errors.some(e => e.code === "SIDE_EFFECT_BOUNDARY_MISSING"));
  });
});

describe("checker", () => {
  it("detects broken file references", async () => {
    const { checkReferences } = await import("../dist/checker.js");
    const body = "See the [config](./config.yml) for details.\n";
    const errors = checkReferences(body, "/tmp/nonexistent/SKILL.md");
    assert.ok(errors.some(e => e.code === "BROKEN_FILE_REF"));
  });
});

describe("runner", () => {
  it("passes valid fixture in mock mode", async () => {
    const { runFixture } = await import("../dist/runner.js");
    const result = runFixture({ name: "t", input: "hello", expect: "world" }, { mock: true });
    assert.strictEqual(result.passed, true);
  });

  it("fails on identical input and expect", async () => {
    const { runFixture } = await import("../dist/runner.js");
    const result = runFixture({ name: "t", input: "same", expect: "same" });
    assert.strictEqual(result.passed, false);
  });
});
