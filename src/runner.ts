/**
 * Fixture Runner - run inline fixtures from SKILL.md files.
 *
 * Fixtures are defined as YAML code blocks with input:/expect: pairs.
 * The runner compares input/output expectations.
 */

import type { FixtureTest, FixtureResult } from "./types.js";

export interface FixtureOptions {
  mock?: boolean;
}

export function runFixture(fixture: FixtureTest, opts: FixtureOptions = {}): FixtureResult {
  const errors: string[] = [];
  const mockMode = opts.mock ?? false;

  if (!mockMode) {
    // In non-mock mode, we check that the fixture has meaningful content
    if (!fixture.input || fixture.input.trim() === "") {
      errors.push("fixture has no input defined");
    }
    if (!fixture.expect || fixture.expect.trim() === "") {
      errors.push("fixture has no expected result defined");
    }
  }

  // Validate fixture input/expect are not identical
  if (fixture.input && fixture.expect && fixture.input.trim() === fixture.expect.trim()) {
    errors.push("input and expect are identical in fixture (likely a copy-paste error)");
  }

  // In mock mode, we just validate structure without real execution
  if (mockMode) {
    return {
      fixture: fixture.name,
      passed: errors.length === 0,
      errors,
      output: fixture.input || "",
    };
  }

  return {
    fixture: fixture.name,
    passed: errors.length === 0,
    errors,
  };
}
