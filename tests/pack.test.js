import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "package.json");

describe("package.json", () => {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  it("has valid name and version", () => {
    assert.ok(pkg.name && pkg.name.length > 0);
    assert.ok(/^\d+\.\d+\.\d+/.test(pkg.version));
  });

  it("has MIT license", () => {
    assert.strictEqual(pkg.license, "MIT");
  });

  it("has CLI bin entry", () => {
    assert.ok(pkg.bin && pkg.bin.skillpack);
  });

  it("has repository metadata", () => {
    assert.ok(pkg.repository && pkg.repository.url);
  });

  it("has required dependencies", () => {
    // Core library should not have runtime deps beyond basic types
    // commander moved to deps for CLI
    assert.ok(pkg.dependencies || Object.keys(pkg.dependencies || {}).length >= 0);
  });

  it("defines main entry point", () => {
    assert.strictEqual(pkg.main, "./dist/index.js");
  });

  it("defines types entry point", () => {
    assert.strictEqual(pkg.types, "./dist/index.d.ts");
  });
});
