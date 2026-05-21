/** Core types for skillpack */

export interface SkillFrontmatter {
  name: string;
  description: string;
  scope?: string;
  icon?: string;
  [key: string]: unknown;
}

export interface SkillFile {
  path: string;
  frontmatter: SkillFrontmatter | null;
  body: string;
  rawContent: string;
  lineCount: number;
}

export interface ValidationResult {
  file: string;
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  line?: number;
  column?: number;
  code: string;
  message: string;
  severity: "error" | "warning";
}

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface LintResult {
  file: string;
  passed: boolean;
  schemaErrors: ValidationError[];
  referenceErrors: ValidationError[];
  warnings: ValidationError[];
}

export interface FixtureTest {
  name: string;
  input: string;
  expect: string;
}

export interface FixtureResult {
  fixture: string;
  passed: boolean;
  errors: string[];
  output?: string;
}

export interface TestSuite {
  file: string;
  fixtures: FixtureTest[];
}

export interface ReportSummary {
  totalFiles: number;
  passedFiles: number;
  failedFiles: number;
  totalErrors: number;
  totalWarnings: number;
  results: (ValidationResult | LintResult | FixtureResult)[];
}
